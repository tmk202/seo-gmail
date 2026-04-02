import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// Sinh mã đơn hàng gồm 8 ký tự alphanumeric (VD: ANTI-A1B2C3D4)
function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ANTI-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, customerEmail } = body;

    // Check auth
    const user = await getAuthUser();
    const userId = user?.id as string | undefined;

    // Validate input
    if (!productId || !quantity || !customerEmail) {
      return NextResponse.json(
        { error: 'Thiếu thông tin: productId, quantity, customerEmail là bắt buộc.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
    }
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json({ error: 'Số lượng phải từ 1 đến 100.' }, { status: 400 });
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();

    // Rate Limit: Chống Spam tạo đơn ảo
    const pendingOrders = await prisma.order.count({
      where: {
        customerEmail: normalizedEmail,
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // trong 1 giờ qua
      }
    });

    if (pendingOrders >= 3) {
      return NextResponse.json(
        { error: 'Bạn đang có quá nhiều đơn hàng chờ thanh toán. Vui lòng thanh toán các đơn cũ trước.' },
        { status: 429 }
      );
    }

    // Lấy thông tin sản phẩm
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại.' }, { status: 404 });
    }

    // Kiểm tra tồn kho (số account AVAILABLE)
    const availableCount = await prisma.account.count({
      where: { productId, status: 'AVAILABLE' },
    });
    if (availableCount < quantity) {
      return NextResponse.json(
        { error: `Không đủ hàng. Hiện chỉ còn ${availableCount} tài khoản.` },
        { status: 409 }
      );
    }

    // Sinh mã unique (retry nếu trùng)
    let orderCode = generateOrderCode();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.order.findUnique({ where: { orderCode } });
      if (!exists) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    const totalAmount = product.price * quantity;

    // Tạo đơn hàng PENDING
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerEmail: normalizedEmail,
        totalAmount,
        quantity,
        productId,
        status: 'PENDING',
        userId: userId || null, // Lưu ID nếu khách đã đăng nhập
      },
    });

    // Trả về thông tin để FE hiển thị QR
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        productName: product.name,
        quantity,
        customerEmail,
      },
    });
  } catch (err) {
    console.error('[/api/checkout] Error:', err);
    return NextResponse.json({ error: 'Lỗi server, vui lòng thử lại.' }, { status: 500 });
  }
}
