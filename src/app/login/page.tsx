'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050510] flex items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-black/80">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Chào mừng trở lại
            </h1>
            <p className="text-gray-500 font-medium md:text-lg">
              Đăng nhập để quản lý tài khoản của bạn.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="name@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Mật khẩu</label>
                <Link href="#" className="text-xs text-indigo-400 font-bold hover:underline">Quên?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-6 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Xác thực & Vào Dashboard'}
            </button>
          </form>

          <p className="text-center mt-12 text-gray-500 text-sm font-medium">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-white hover:text-indigo-400 transition-colors font-bold ml-1">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
