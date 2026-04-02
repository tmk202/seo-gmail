import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'antigravity-super-secret-jwt-key-2026'
);

export default async function AdminDashboardPage() {
  // Bọc thêm 1 lớp bảo vệ bên trong (phòng hờ)
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');
  try {
    await jwtVerify(token, SECRET_KEY);
  } catch {
    redirect('/admin/login');
  }

  const [orders, totalRevenueRaw, totalAccounts] = await Promise.all([
    prisma.order.findMany({
      include: {
        product: true,
        items: {
          include: { account: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Giới hạn 50 đơn gần nhất cho nhẹ
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['PAID', 'DELIVERED'] } }
    }),
    prisma.account.count({
      where: { status: 'AVAILABLE' }
    })
  ]);

  const totalRevenue = totalRevenueRaw._sum.totalAmount || 0;

  return (
    <main className="min-h-screen bg-[#050510] text-gray-200 font-sans">
      <nav className="border-b border-indigo-500/20 bg-[#0F0F1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg text-white font-bold">A</div>
            <span className="font-bold tracking-widest text-indigo-400 uppercase text-sm">System Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 text-sm hover:text-white transition-colors">Về Trang chủ</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Thống kê Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
            <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest relative z-10">Tổng Doanh Thu</p>
            <p className="text-4xl font-black text-white relative z-10">{totalRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest relative z-10">Đơn hàng đã bán</p>
            <p className="text-4xl font-black text-white relative z-10">{orders.filter(o => o.status !== 'PENDING').length}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest relative z-10">Trong Kho (Sẵn Sàng)</p>
            <p className="text-4xl font-black text-white relative z-10">{totalAccounts} Acc</p>
          </div>
        </div>

        {/* Bảng Lịch sử */}
        <div className="bg-[#0F0F1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">Lịch Sử Mua Bán (50 đơn gần nhất)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[11px] font-bold">
                <tr>
                  <th className="px-8 py-4">Mã Đơn</th>
                  <th className="px-8 py-4">Khách Hàng</th>
                  <th className="px-8 py-4">Sản Phẩm</th>
                  <th className="px-8 py-4">Thành Tiền</th>
                  <th className="px-8 py-4">Trạng Thái</th>
                  <th className="px-8 py-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        #{order.orderCode}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-medium text-white">{order.customerEmail}</div>
                      {order.userId && <span className="text-[10px] text-green-400 px-2 py-0.5 bg-green-500/10 rounded-full mt-1 inline-block">Đã đăng ký User</span>}
                    </td>
                    <td className="px-8 py-5 text-gray-300">
                      {order.product.name} <span className="text-gray-500">(x{order.quantity})</span>
                    </td>
                    <td className="px-8 py-5 font-bold text-white">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        order.status === 'PAID' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
