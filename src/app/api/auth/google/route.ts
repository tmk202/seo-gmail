import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: 'Thiếu Google Token.' }, { status: 400 });
    }

    // Xác minh token với Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Dữ liệu Google không hợp lệ.' }, { status: 400 });
    }

    const { email, name, picture } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra xem User đã tồn tại chưa
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Nếu chưa tồn tại, tự động Đăng ký (Register)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || 'Người dùng Google',
          authProvider: 'google',
        },
      });
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
  } catch (err: any) {
    console.error('[/api/auth/google] Error:', err);
    return NextResponse.json({ error: 'Xác thực Google thất bại.' }, { status: 500 });
  }
}
