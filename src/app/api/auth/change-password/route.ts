import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hashPassword, comparePassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự.' }, { status: 400 });
    }

    // Lấy user từ DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id as string },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }

    // Nếu user đăng ký bằng Google (không có password cũ)
    if (!dbUser.password) {
      // Cho phép đặt mật khẩu mới mà không cần xác minh mật khẩu cũ
      const hashed = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { password: hashed },
      });
      return NextResponse.json({ success: true, message: 'Đã thiết lập mật khẩu thành công.' });
    }

    // User có password cũ -> bắt buộc xác minh
    if (!currentPassword) {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu hiện tại.' }, { status: 400 });
    }

    const isMatch = await comparePassword(currentPassword, dbUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không chính xác.' }, { status: 403 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error('[/api/auth/change-password] Error:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
