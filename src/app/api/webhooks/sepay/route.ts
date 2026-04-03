import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAccountEmail } from '@/lib/resend';

interface AccountRow {
  id: string;
  email: string;
  password: string;
  recoveryEmail: string | null;
}

// Hàm xuất kho (fulfillment)
async function fulfillOrder(orderId: string, productId: string, quantity: number): Promise<AccountRow[]> {
  return await prisma.$transaction(async (tx) => {
    // SELECT ... FOR UPDATE SKIP LOCKED
    const accounts = await tx.$queryRaw<AccountRow[]>`
      SELECT id, email, password, "recoveryEmail"
      FROM "Account"
      WHERE "productId" = ${productId}
        AND status = 'AVAILABLE'
      LIMIT ${quantity}
      FOR UPDATE SKIP LOCKED
    `;

    if (accounts.length < quantity) {
      throw new Error(`INSUFFICIENT_STOCK`);
    }

    const accountIds = accounts.map((a: AccountRow) => a.id);

    // Đánh dấu SOLD
    await tx.account.updateMany({
      where: { id: { in: accountIds } },
      data: { status: 'SOLD' },
    });

    // Tạo OrderItems
    await tx.orderItem.createMany({
      data: accountIds.map((accountId: string) => ({ orderId, accountId })),
    });

    // Cập nhật Order → DELIVERED
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });

    return accounts;
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực Auth Token
    const authHeader = req.headers.get('Authorization');
    const expectedToken = process.env.SEPAY_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[Webhook SePay] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Chỉ xử lý các giao dịch TIỀN VÀO (inbound)
    if (body.transferType !== 'in') {
      return NextResponse.json({ success: true, message: 'Ignored: outbound transfer' });
    }

    const content: string = body.content ?? '';
    const amount: number = Number(body.transferAmount) ?? 0;
    const transactionId: string = body.id ?? ''; // ID của SePay
    const bankAccount: string = body.bankAccount ?? '';

    // 2. Ghi nhận giao dịch vào bảng Transaction (Đối soát)
    const transactionRecord = await prisma.transaction.create({
      data: {
        transactionId,
        transferAmount: amount,
        content,
        bankAccount,
        gateway: 'SEPAY',
      },
    });

    // 3. Tìm mã đơn hàng từ nội dung (VD: ANTI-A1B2C3D4)
    const match = content.match(/ANTI-[A-Z0-9]{8}/i);
    if (!match) {
      await prisma.systemLog.create({
        data: {
          level: 'WARNING',
          source: 'WEBHOOK',
          message: `Giao dịch không có mã đơn hàng: ${content}`,
          details: JSON.stringify(body),
        },
      });
      return NextResponse.json({ success: true, message: 'No order code' });
    }
    const orderCode = match[0].toUpperCase();

    // Gắn transaction vào orderCode nếu có
    await prisma.transaction.update({
      where: { id: transactionRecord.id },
      data: { orderCode },
    });

    // 4. Tìm kiếm đơn hàng
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { product: true },
    });

    if (!order) {
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          source: 'WEBHOOK',
          message: `Không tìm thấy đơn hàng tương ứng mã: ${orderCode}`,
          details: JSON.stringify(body),
        },
      });
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    // 5. Kiểm tra trạng thái đơn
    if (order.status !== 'PENDING') {
      return NextResponse.json({ success: true, message: `Skipped: status is ${order.status}` });
    }

    // 6. Kiểm tra số tiền
    if (amount < order.totalAmount) {
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          source: 'WEBHOOK',
          message: `Đơn ${orderCode}: Chuyển thiếu tiền. Nhận ${amount}, cần ${order.totalAmount}`,
          details: JSON.stringify(body),
        },
      });
      return NextResponse.json({ success: true, message: 'Insufficient amount logged' });
    }

    // 7. Cập nhật trạng thái PAID ngay (Idempotent)
    const updated = await prisma.order.updateMany({
      where: { orderCode, status: 'PENDING' },
      data: { status: 'PAID' },
    });

    if (updated.count === 0) {
      return NextResponse.json({ success: true, message: 'Concurrent request handled' });
    }

    // 8. Xuất kho & giao hàng
    let deliveredAccounts: AccountRow[] = [];
    try {
      deliveredAccounts = await fulfillOrder(order.id, order.productId, order.quantity);
      
      // Log thành công
      await prisma.systemLog.create({
        data: {
          level: 'INFO',
          source: 'WEBHOOK',
          message: `Đơn ${orderCode}: Giao hàng thành công (x${order.quantity} accs).`,
          details: `Product: ${order.product.name} | Customer: ${order.customerEmail}`,
        },
      });
    } catch (fulfillErr: any) {
      const msg = fulfillErr.message || 'Unknown fulfillment error';
      console.error('[Webhook SePay] Fulfillment failed:', msg);
      
      // LOG ERROR critically! Hết hàng hoặc lỗi DB!
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          source: 'WEBHOOK',
          message: `Đơn ${orderCode}: Thanh toán OK nhưng XUẤT KHO THẤT BẠI. Lý do: ${msg}`,
          details: JSON.stringify(body),
        },
      });
      
      return NextResponse.json({ success: false, error: msg }, { status: 200 });
    }

    // 9. Gửi Email thông báo
    try {
      await sendAccountEmail({
        toEmail: order.customerEmail,
        orderCode: order.orderCode,
        productName: order.product.name,
        accounts: deliveredAccounts,
      });
    } catch (emailErr) {
      console.error('[Webhook SePay] Email failed (Non-fatal):', emailErr);
    }

    return NextResponse.json({ success: true, orderCode });
  } catch (err: any) {
    console.error('[Webhook SePay] Global Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 200 });
  }
}

