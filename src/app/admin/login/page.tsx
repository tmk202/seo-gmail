'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="w-full max-w-sm z-10">
        <div className="bg-black border border-green-500/30 p-8 rounded-none shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-500 tracking-widest uppercase mb-2">
              System Admin
            </h1>
            <p className="text-green-500/60 text-xs">Awaiting authorization protocol...</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold text-center">
              [ACCESS DENIED] {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-green-500/80 uppercase">Enter Passphrase</label>
              <input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoFocus
                className="w-full bg-black border border-green-500/50 px-4 py-3 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-500 border border-green-500 font-bold py-3 uppercase text-sm tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Authorize'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
