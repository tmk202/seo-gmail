'use client';

import React from 'react';

export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Antigravity Logo / Symbol */}
        <div className="relative w-24 h-24 mb-12">
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full scale-110"></div>
          {/* Rotating ring */}
          <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
          {/* Inner core */}
          <div className="absolute inset-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center">
            <span className="text-white font-black text-2xl italic leading-none ml-1">A</span>
          </div>
        </div>

        {/* Text cues */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase opacity-80">
            Dữ liệu đang được đồng bộ
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest max-w-[200px] leading-relaxed mx-auto">
            Hệ thống đang thiết lập môi trường bảo mật...
          </p>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-10 left-10 w-20 h-px bg-white/5"></div>
      <div className="absolute bottom-10 left-10 w-px h-20 bg-white/5"></div>
      <div className="absolute top-10 right-10 w-20 h-px bg-white/5"></div>
      <div className="absolute top-10 right-10 w-px h-20 bg-white/5"></div>
    </main>
  );
}
