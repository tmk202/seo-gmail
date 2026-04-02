import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// Đây là Server Component để lấy data bảo mật nhất
export default async function DashboardPage() {
  const userPayload = await getAuthUser();
  if (!userPayload) {
    redirect('/login');
  }

  // Lấy danh sách đơn hàng đã DELIVERED của User này
  const orders = await prisma.order.findMany({
    where: {
      userId: userPayload.id as string,
      status: 'DELIVERED',
    },
    include: {
      product: true,
      items: {
        include: {
          account: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-[#050510] text-gray-200">
      {/* Header */}
      <nav className="border-b border-white/5 bg-[#0F0F1A]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">
            ANTIGRAVITY
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hidden sm:inline">Chào, <span className="text-white font-medium">{String(userPayload.email)}</span></span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 transition-all">
                Đăng Xuất
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Kho Tàng Tài Khoản 💎</h2>
            <p className="text-gray-400">Xem lại và tải về tất cả tài khoản Gmail bạn đã mua.</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 text-sm transition-all">
            + Mua Thêm Tài Khoản
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-[#0F0F1A] rounded-3xl border border-white/5">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-xl font-bold text-gray-400">Bạn chưa có đơn hàng nào đã thanh toán.</h3>
            <p className="text-gray-600 mt-2">Sau khi thanh toán thành công, tài khoản sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0F0F1A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:border-purple-500/20 transition-all">
                <div className="px-8 py-6 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 text-xl font-bold">
                      #{order.orderCode.slice(-4)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase text-sm tracking-widest">{order.product.name}</h4>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20 tracking-tighter">
                      Đã Giao {order.quantity} Acc
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</span>
                          <code className="text-purple-400 font-medium text-sm break-all">{item.account.email}</code>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-4">
                          <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/10 group-hover:border-purple-500/40 transition-colors">
                            <span className="text-gray-500 text-[10px] uppercase block leading-none mb-1">Mật khẩu</span>
                            <span className="text-white font-mono text-sm tracking-widest select-all">••••••••</span> 
                            {/* Mật khẩu bị ẩn trên UI chính, cần bấm vào hoặc copy */}
                          </div>
                          <button 
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs transition-colors"
                            title="Copy Email|Pass"
                            onClick={() => {}} // Handle client side copy in real app
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <footer className="py-20 text-center border-t border-white/5 text-gray-600 text-sm">
        &copy; 2026 Antigravity Store. Premium Security Edition.
      </footer>
    </main>
  );
}
