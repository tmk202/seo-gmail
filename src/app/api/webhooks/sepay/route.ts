import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAccountEmail } from '@/lib/resend';

interface AccountRow {
  id: string;
  email: string;
  password: string;
  recoveryEmail: string | null;
}

async function fulfillOrder(orderId: string, productId: string, quantity: number): Promise<AccountRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await prisma.$transaction(async (tx: any) => {
    // SELECT ... FOR UPDATE SKIP LOCKED — chống race condition khi 2 khách mua cùng lúc
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
    // Xác thực Bearer token từ SePay
    const authHeader = req.headers.get('Authorization');
    const expectedToken = process.env.SEPAY_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[Webhook SePay] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Chỉ xử lý tiền VÀO
    if (body.transferType !== 'in') {
      return NextResponse.json({ success: true, message: 'Ignored: outbound transfer' });
    }

    const content: string = body.content ?? '';
    const amount: number = body.transferAmount ?? 0;

    // Tìm mã đơn hàng trong nội dung chuyển khoản (VD: ANTI-A1B2C3D4)
    const match = content.match(/ANTI-[A-Z0-9]{8}/i);
    if (!match) {
      return NextResponse.json({ success: true, message: 'Ignored: no order code found' });
    }
    const orderCode = match[0].toUpperCase();

    // Tìm đơn hàng
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { product: true },
    });

    if (!order) {
      // LUÔN LUÔN trả về 200 cho SePay để tránh webhook bị retry liên tục
      // Đồng thời ngăn hacker dùng webhook đoán mã đơn hàng có tồn tại hay không.
      console.warn(`[Webhook SePay] Order not found: ${orderCode}`);
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 200 });
    }

    // Đã xử lý rồi → idempotent
    if (order.status !== 'PENDING') {
      return NextResponse.json({ success: true, message: `Already ${order.status}` });
    }

    // Số tiền nhận được phải >= tổng đơn
    if (amount < order.totalAmount) {
      console.warn(`[Webhook SePay] Amount mismatch: received ${amount}, expected ${order.totalAmount}`);
      return NextResponse.json({ success: true, message: 'Ignored: insufficient amount' });
    }

    // Đặt PAID ngay (atomic update — nếu 2 webhook gọi đồng thời, chỉ 1 cái update được)
    const updated = await prisma.order.updateMany({
      where: { orderCode, status: 'PENDING' },
      data: { status: 'PAID' },
    });

    if (updated.count === 0) {
      return NextResponse.json({ success: true, message: 'Concurrent request ignored' });
    }

    // Xuất kho & gửi email
    let deliveredAccounts: AccountRow[] = [];
    try {
      deliveredAccounts = await fulfillOrder(order.id, order.productId, order.quantity);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Webhook SePay] Fulfill failed:', msg);
      // Giữ status 200 nhưng log lỗi
      await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
      return NextResponse.json({ success: false, error: `Fulfill error: ${msg}` }, { status: 200 });
    }

    // Gửi email (không block nếu lỗi)
    try {
      await sendAccountEmail({
        toEmail: order.customerEmail,
        orderCode: order.orderCode,
        productName: order.product.name,
        accounts: deliveredAccounts,
      });
    } catch (emailErr) {
      console.error('[Webhook SePay] Email failed (non-fatal):', emailErr);
    }

    console.log(`[Webhook SePay] ✅ Order ${orderCode} fulfilled.`);
    return NextResponse.json({ success: true, orderCode });
  } catch (err) {
    console.error('[Webhook SePay] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 200 });
  }
}
