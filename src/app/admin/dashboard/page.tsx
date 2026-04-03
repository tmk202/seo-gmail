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

  const [orders, totalRevenueRaw, totalAccounts, logs, transactions] = await Promise.all([
    prisma.order.findMany({
      include: {
        product: true,
        items: {
          include: { account: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['PAID', 'DELIVERED'] } }
    }),
    prisma.account.count({
      where: { status: 'AVAILABLE' }
    }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ]);

  const totalRevenue = totalRevenueRaw._sum.totalAmount || 0;

  return (
    <main className="min-h-screen bg-[#050510] text-gray-200 font-sans">
      <nav className="border-b border-indigo-500/20 bg-[#0F0F1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]">A</div>
            <span className="font-bold tracking-widest text-indigo-400 uppercase text-xs">System Admin Panel</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Về Trang chủ</Link>
            <span className="opacity-20">|</span>
            <span className="text-green-500/80">● Server Online</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Thống kê Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.2em] relative z-10">Tổng Doanh Thu (PAID)</p>
            <p className="text-4xl font-black text-white relative z-10">{totalRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.2em] relative z-10">Đơn hàng thành công</p>
            <p className="text-4xl font-black text-white relative z-10">x{orders.filter(o => o.status !== 'PENDING').length}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-[0.2em] relative z-10">Kho hàng Gmail (Sẵn sàng)</p>
            <p className="text-4xl font-black text-white relative z-10">{totalAccounts} Accs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          {/* Cột trái: Giao dịch & Log */}
          <div className="space-y-8">
            {/* Nhật ký Hệ thống */}
            <section className="bg-[#0F0F1A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Nhật ký Hệ thống (Real-time)
                </h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="p-10 text-center text-gray-600 text-sm italic">Hệ thống chưa ghi nhận sự kiện nào</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {logs.map(log => (
                      <div key={log.id} className="px-8 py-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            log.level === 'ERROR' ? 'bg-red-500/10 text-red-500' :
                            log.level === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold ${log.level === 'ERROR' ? 'text-red-400' : 'text-gray-300'}`}>
                          {log.message}
                        </p>
                        {log.details && <p className="text-[10px] text-gray-500 mt-1 font-mono truncate">{log.details}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Lịch sử Webhook SePay */}
            <section className="bg-[#0F0F1A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  🏦 Giao dịch Ngân hàng (SePay)
                </h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {transactions.length === 0 ? (
                  <div className="p-10 text-center text-gray-600 text-sm italic">Chưa có dữ liệu từ Webhook</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {transactions.map(tx => (
                      <div key={tx.id} className="px-8 py-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-black text-sm">+{tx.transferAmount.toLocaleString('vi-VN')}đ</span>
                          <span className="text-[10px] text-gray-600">{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Nội dung: <span className="text-indigo-400 font-bold">{tx.content}</span></span>
                          <span className="text-gray-500 font-mono">ID: {tx.transactionId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Cột phải: Đơn hàng */}
          <section className="bg-[#0F0F1A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full">
            <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">🛍️ Đơn hàng gần đây</h2>
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Hiển thị 20 đơn</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Mã Đơn</th>
                    <th className="px-6 py-4">Khách Hàng</th>
                    <th className="px-6 py-4">Thành Tiền</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                          {order.orderCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]" title={order.customerEmail}>
                        {order.customerEmail}
                      </td>
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          order.status === 'DELIVERED' ? 'text-green-500' :
                          order.status === 'PAID' ? 'text-blue-500' :
                          'text-yellow-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

