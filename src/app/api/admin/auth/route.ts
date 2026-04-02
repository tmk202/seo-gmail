import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Mã truy cập không hợp lệ!' }, { status: 401 });
    }

    // Tạo token Admin
    const token = await createToken({ role: 'admin' });
    const cookieStore = await cookies();
    
    // Set cookie, maxAge 1 day
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/admin/auth] Error:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
