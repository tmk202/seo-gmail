import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra user tồn tại
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email này đã được đăng ký.' }, { status: 409 });
    }

    // Hash pass và tạo user
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: name || null,
      },
    });

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
    console.error('[/api/auth/register] Error:', err);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
