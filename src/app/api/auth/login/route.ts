import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tìm user và so sánh mật khẩu
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 });
    }

    // Tạo token và set cookie
    const token = await createToken({ id: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('[/api/auth/login] Error:', err);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
