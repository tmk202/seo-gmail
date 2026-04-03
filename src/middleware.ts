import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret từ .env hoặc mặc định
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'antigravity-super-secret-jwt-key-2026'
);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  let response = NextResponse.next();

  // 1. Kiểm tra Quyền Truy Cập (Auth Logic)
  // -----------------------------------------------------

  // Xử lý bảo vệ trang ADMIN
  if (path.startsWith('/admin/dashboard') || path === '/admin') {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (!adminToken) {
      response = NextResponse.redirect(new URL('/admin/login', req.url));
    } else {
      try {
        await jwtVerify(adminToken, SECRET_KEY);
        if (path === '/admin') {
          response = NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
      } catch {
        response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('admin_token');
      }
    }
  }

  // Chặn đăng nhập lại trang Admin Login nếu đã có session
  else if (path === '/admin/login') {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (adminToken) {
      try {
        await jwtVerify(adminToken, SECRET_KEY);
        response = NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } catch { /* Token hỏng -> OK tiếp tục trang login */ }
    }
  }

  // Xử lý bảo vệ trang USER (dashboard + settings)
  else if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      response = NextResponse.redirect(new URL('/login', req.url));
    } else {
      try {
        await jwtVerify(token, SECRET_KEY);
      } catch {
        response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('auth_token');
      }
    }
  }

  // Tự động chuyển hướng khỏi trang Auth User nếu đã login
  else if (path.startsWith('/login') || path.startsWith('/register')) {
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        response = NextResponse.redirect(new URL('/dashboard', req.url));
      } catch { /* Token hỏng -> OK tiếp tục trang login */ }
    }
  }

  // 2. Thêm Security Headers (Production Armor)
  // -----------------------------------------------------
  
  // CSP: Chống XSS (Cho phép script từ domain hiện tại, Google OAuth, và inline của Next.js)
  // Lưu ý: Trong môi trường dev có thể cần nới lỏng chút để hot reload hoạt động.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://img.vietqr.io https://lh3.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src https://accounts.google.com;
    connect-src 'self' https://accounts.google.com;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Force HSTS (Chỉ nên bật khi chạy thật HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    /* Chạy middleware cho mọi route trừ các file tĩnh */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

