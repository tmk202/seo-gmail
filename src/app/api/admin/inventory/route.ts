import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

// Bảo mật đơn giản bằng secret key trong env
// Gọi: POST /api/admin/inventory
// Header: Authorization: Bearer <ADMIN_SECRET>
// Body: { "productId": "...", "accounts": ["email|pass|recovery", ...] }

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  const secret = process.env.ADMIN_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { productId, accounts } = body as { productId: string; accounts: string[] };

  if (!productId || !Array.isArray(accounts) || accounts.length === 0) {
    return NextResponse.json({ error: 'Thiếu productId hoặc accounts[]' }, { status: 400 });
  }

  // Kiểm tra product tồn tại
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: 'Product không tồn tại.' }, { status: 404 });
  }

  // Parse từng dòng format: email|password|recoveryEmail
  const parsed = accounts
    .map((line: string) => {
      const parts = line.trim().split('|');
      if (parts.length < 2) return null;
      return {
        productId,
        email: parts[0].trim(),
        password: encrypt(parts[1].trim()), // Đã mã hóa AES-256
        recoveryEmail: parts[2]?.trim() || null,
        status: 'AVAILABLE' as const,
      };
    })
    .filter(Boolean);

  if (parsed.length === 0) {
    return NextResponse.json({ error: 'Không có dòng hợp lệ (format: email|pass|recovery)' }, { status: 400 });
  }

  // Bulk insert
  const result = await prisma.account.createMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: parsed as any[],
    skipDuplicates: true,
  });

  // Cập nhật stock trong Product
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: result.count } },
  });

  return NextResponse.json({
    success: true,
    inserted: result.count,
    skipped: accounts.length - result.count,
  });
}
