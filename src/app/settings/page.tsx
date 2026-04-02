'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
        else router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp với xác nhận.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const isGoogleUser = !user.hasPassword;

  return (
    <main className="min-h-screen bg-[#050510] text-gray-200">
      {/* Header */}
      <nav className="border-b border-white/5 bg-[#0F0F1A]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">
            ANTIGRAVITY
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Về Dashboard
            </Link>
            <span className="text-sm text-gray-400 hidden sm:inline">
              <span className="text-white font-medium">{user.email}</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">Cài đặt tài khoản</h1>
          <p className="text-gray-500">Quản lý bảo mật và thông tin cá nhân của bạn.</p>
        </div>

        {/* Thông tin tài khoản */}
        <div className="bg-[#0F0F1A] border border-white/5 rounded-3xl p-8 mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Thông tin cơ bản</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-gray-500 text-sm">Email</span>
              <span className="text-white font-medium text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-gray-500 text-sm">Tên hiển thị</span>
              <span className="text-white font-medium text-sm">{user.name || '—'}</span>
            </div>
          </div>
        </div>

        {/* Form đổi mật khẩu */}
        <div className="bg-[#0F0F1A] border border-white/5 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
            {isGoogleUser ? '🔐 Thiết lập mật khẩu' : '🔐 Đổi mật khẩu'}
          </h3>

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-sm text-center font-bold flex items-center justify-center gap-2">
              <span>✓</span> {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            {!isGoogleUser && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                  placeholder="Nhập mật khẩu cũ của bạn"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : (isGoogleUser ? 'Thiết lập mật khẩu' : 'Cập nhật mật khẩu')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
