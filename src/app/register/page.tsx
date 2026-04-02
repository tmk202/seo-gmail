'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
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
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[480px] z-10">
        <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/50">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-500 mt-3 font-medium">Bắt đầu quản lý Gmail của bạn chuyên nghiệp hơn.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="Tối thiểu 8 ký tự"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 text-sm font-medium">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-white hover:text-indigo-400 transition-colors font-bold ml-1">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
