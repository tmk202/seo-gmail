import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userPayload = await getAuthUser();
    if (!userPayload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Lấy thêm thông tin từ DB để biết user có password hay không
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.id as string },
      select: { id: true, email: true, name: true, password: true, authProvider: true },
    });

    if (!dbUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        hasPassword: !!dbUser.password,
        authProvider: dbUser.authProvider,
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
