'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        // failed to fetch session
      }
    }
    fetchSession();
  }, []);

  const products = [
    {
      id: "basic",
      name: "Gmail Basic - Antigravity",
      desc: "Tài khoản Gmail mới tạo, sạch 100%, chưa qua sử dụng.",
      price: "15.000",
      badge: "Phổ biến",
    },
    {
      id: "premium",
      name: "Gmail Premium - Antigravity",
      desc: "Gmail cổ (Aged), độ tin cậy cao, vượt được nhiều checkpoint.",
      price: "35.000",
      badge: "Khuyên dùng",
    },
    {
      id: "master",
      name: "Gmail Master - Độc Quyền",
      desc: "Tài khoản kèm Recovery Email riêng, bảo hành 1 đổi 1 trong 30 ngày.",
      price: "90.000",
      badge: "VIP",
    }
  ];

  return (
    <main className="min-h-screen bg-[#050510] text-[#e5e7eb] selection:bg-indigo-500/30">
      {/* Navbar xịn xò */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[#050510]/80 backdrop-blur-xl border-b border-white/[0.05] z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-display font-black tracking-tighter text-white">ANTIGRAVITY<span className="text-indigo-500">STORE</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/" className="text-white">Trang chủ</Link>
            <Link href="/account" className="hover:text-white transition-colors">Tra cứu đơn</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Hệ thống phân phối Gmail tự động
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tight mb-8 leading-[1.1]">
            Nền tảng cung cấp <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-purple-400">Gmail Tài Khoản Demo</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12">
            Hệ thống Antigravity Store vận hành tự động 24/7. Thanh toán xong nhận tài khoản ngay lập tức qua Email và Dashboard cá nhân.
          </p>
        </div>
      </section>

      {/* Product List - Grid Style */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-[#0f0f20]/50 border border-white/5 rounded-[2.5rem] p-10 hover:border-indigo-500/30 transition-all duration-500 hover:translate-y-[-8px]">
              <div className="flex items-start justify-between mb-8">
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {product.badge}
                </span>
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">{product.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 h-10">{product.desc}</p>

              <div className="pt-8 border-t border-white/5 flex items-end justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1">Giá chỉ từ</span>
                  <span className="text-3xl font-black text-white">{product.price}<span className="text-sm font-medium text-gray-500 ml-1">VNĐ</span></span>
                </div>
                <Link 
                  href={`/checkout?plan=${product.id}`}
                  className="bg-white text-black font-bold px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                >
                  Mua Ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 text-center border-t border-white/5 text-gray-600 text-sm font-medium">
        &copy; {new Date().getFullYear()} Antigravity Mạng Lưới Phân Phối Kín. Bảo mật & Uy tín.
      </footer>
    </main>
  );
}
