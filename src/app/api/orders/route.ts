import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const orderCode = req.nextUrl.searchParams.get('orderCode');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
  }

  // Chống brute-force: Bắt buộc cung cấp orderCode để tra cứu mã đơn
  if (!orderCode || orderCode.length < 5) {
    return NextResponse.json({ error: 'Bạn phải nhập Email và Mã đơn hàng.' }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { 
      customerEmail: email.toLowerCase().trim(),
      orderCode: orderCode.toUpperCase().trim()
    },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true } },
      items: {
        include: {
          account: {
            select: { email: true, password: true, recoveryEmail: true },
          },
        },
      },
    },
  });

  const result = orders.map((order: any) => ({
    id: order.id,
    orderCode: order.orderCode,
    productName: order.product.name,
    quantity: order.quantity,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
    accounts: order.status === 'DELIVERED'
      ? order.items.map((item: any) => ({
          ...item.account,
          password: decrypt(item.account.password) // Giải mã mật khẩu tại đây
        }))
      : [],
  }));

  return NextResponse.json({ orders: result });
}
