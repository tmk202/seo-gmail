'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Tùy chọn: Log lỗi lên Sentry / CloudWatch nếu cần
    console.error('--- Hệ thống xảy ra lỗi ---', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-red-900/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg bg-[#0f0f1a] border border-red-500/10 p-12 rounded-[3.5rem] shadow-2xl">
        {/* Error Symbol */}
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
           <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping"></div>
           <span className="text-red-500 text-4xl">⚠️</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Sự cố không mong muốn</h1>
        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
          Dường như có lỗi xảy ra trong quá trình xử lý. Hệ thống an ninh đã tự động ghi nhận mã lỗi này.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
          >
            Thử tải lại (Reset)
          </button>
          
          <Link
            href="/"
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold py-4 px-8 rounded-2xl border border-white/10 transition-all text-sm flex items-center justify-center"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-[10px] text-gray-700 font-mono tracking-widest uppercase">
          ERROR_CODE: {error.digest || 'ANTIGRAVITY_UNK_ERR'}
        </div>
      </div>
    </main>
  );
}
