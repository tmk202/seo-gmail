import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret từ .env hoặc mặc định
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'antigravity-super-secret-jwt-key-2026'
);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Xử lý bảo vệ trang ADMIN
  if (path.startsWith('/admin/dashboard') || path === '/admin') {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    // Ở đây ta có thể dùng jwtVerify cho admin_token nếu muốn phức tạp, 
    // hiện tại dùng chuỗi ngẫu nhiên + băm thì check đơn giản ở middleware
    // Hoặc ta thiết kế admin_token cũng là JWT luôn cho nhất quán.
    try {
      await jwtVerify(adminToken, SECRET_KEY);
      // Nếu path là /admin thì redirect thẳng vào /admin/dashboard
      if (path === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Chặn đăng nhập lại trang Admin Login nếu đã có session
  if (path === '/admin/login') {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (adminToken) {
      try {
        await jwtVerify(adminToken, SECRET_KEY);
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } catch {
        // Token lỗi -> Cho phép hiện trang nhập mật khẩu admin
      }
    }
  }

  // Xử lý bảo vệ trang USER (dashboard + settings)
  if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Tự động chuyển hướng khỏi trang Auth User nếu đã login
  if (path.startsWith('/login') || path.startsWith('/register')) {
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch {
        // Token lỗi -> Cho phép vào trang login để đăng nhập lại
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/register', '/admin/:path*'],
};
