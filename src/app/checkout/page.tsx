'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface OrderInfo {
  id: string;
  orderCode: string;
  totalAmount: number;
  productName: string;
  quantity: number;
  customerEmail: string;
}

const PRODUCTS: Record<string, { id: string; name: string; price: number; description: string }> = {
  basic:   { id: 'prod_basic',   name: 'Gói Basic',   price: 15000, description: '1 Tài khoản Gmail sạch, ngâm sẵn 7 ngày.' },
  premium: { id: 'prod_premium', name: 'Gói Premium', price: 35000, description: '3 Tài khoản Gmail chất lượng cao, phục vụ SEO.' },
  master:  { id: 'prod_master',  name: 'Gói Master',  price: 90000, description: '10 Tài khoản Gmail VIP, hỗ trợ 24/7.' },
};

// Bank info (Config)
const BANK_BIN  = '970436'; 
const BANK_ACCT = '1234567890'; 
const BANK_NAME = 'ANTIGRAVITY STORE';

function buildVietQRUrl(amount: number, description: string): string {
  return `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_NAME)}`;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') || 'basic';
  const currentPlan = PRODUCTS[plan] || PRODUCTS.basic;

  const [user, setUser] = useState<User | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
            setEmail(data.user.email);
          }
        }
      } catch (err) {
        // failed or not logged in
      }
    }
    checkAuth();
  }, []);

  const total = currentPlan.price * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() && !user) { setError('Vui lòng nhập email nhận hàng.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentPlan.id,
          quantity,
          customerEmail: email.trim() || user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Đã có lỗi xảy ra.'); return; }
      setOrder(data.order);
    } catch {
      setError('Không thể kết nối tới server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  if (order) {
    const qrUrl = buildVietQRUrl(order.totalAmount, order.orderCode);
    return (
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Invoice Section */}
        <div className="bg-[#0f0f1a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">✓</span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Đơn hàng đã được tạo</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                <span className="text-gray-400 text-sm">Mã đơn hàng</span>
                <span className="text-indigo-400 font-mono font-bold tracking-wider">#{order.orderCode}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">Sản phẩm</span>
                <span className="text-white font-medium">{order.productName} (x{order.quantity})</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-gray-400 text-sm">Tổng cộng</span>
                <span className="text-2xl font-black text-white">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <p className="text-sm text-indigo-300">
                Tài khoản sẽ được gửi vào email: <strong className="text-white">{order.customerEmail}</strong>
              </p>
            </div>
            
            <Link 
              href={user ? "/dashboard" : "/"}
              className="block w-full py-4 text-center bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl border border-white/10 transition-all"
            >
              {user ? "Quay lại Dashboard" : "Về trang chủ"}
            </Link>
          </div>
        </div>

        {/* QR Section */}
        <div className="bg-[#0f0f1a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-[#94a3b8]">Quét QR để thanh toán</h3>
          
          <div className="relative mb-8 p-4 bg-white rounded-3xl shadow-2xl shadow-indigo-500/20">
            <img src={qrUrl} alt="Payment QR" className="w-[200px] h-[200px]" />
          </div>

          <div className="w-full space-y-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Số tiền</span>
              <span className="text-2xl font-black text-white">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Nội dung chuyển khoản (Bắt buộc)</span>
              <span className="text-xl font-mono font-bold text-indigo-400 select-all tracking-[4px]">{order.orderCode}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-gray-500 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Hệ thống đang chờ lệnh chuyển khoản...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-[#0f0f1a] border border-white/5 rounded-[3rem] p-8 md:p-14 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Thanh toán & Nhận Email</h1>
          <p className="text-gray-500 font-medium">{currentPlan.description}</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Order Summary In Form */}
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-white font-bold text-lg">{currentPlan.name}</h4>
                <p className="text-gray-500 text-xs mt-1">Đơn giá: {currentPlan.price.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all font-bold"
                >-</button>
                <span className="w-8 text-center text-white font-bold">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all font-bold"
                >+</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <span className="text-gray-400 font-medium">Tổng tiền</span>
              <span className="text-2xl font-black text-white">{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email nhận hàng {user && '(Đã liên kết)'}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!user}
              className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${!!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Nhập email của bạn để chúng tôi gửi tài khoản"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {isLoading ? 'Đang khởi tạo...' : 'Xác nhận Đặt hàng'}
          </button>

          {!user && (
            <p className="text-center text-sm text-gray-500 font-medium">
              Bạn nên <Link href="/login" className="text-indigo-400 hover:underline">Đăng nhập</Link> để quản lý lịch sử đơn hàng tốt hơn.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#050510] selection:bg-indigo-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[140px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/5 bg-[#050510]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic tracking-tighter">
            ANTIGRAVITY
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white text-sm font-bold transition-all">← Quay lại trang chủ</Link>
        </div>
      </header>

      <div className="pt-32 pb-20 px-4 relative z-10">
        <Suspense fallback={<div className="text-center py-20 text-indigo-400">Đang tải cấu hình...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>

      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        &copy; 2026 Antigravity Store. All transactions are secured with military-grade encryption.
      </footer>
    </main>
  );
}
