import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- Đang khởi tạo Dữ liệu Demo ---');

  // 1. Tạo/Cập nhật các Sản phẩm (Sản phẩm phải tồn tại trước khi nạp Account)
  const products = [
    { id: 'prod_basic', name: 'Gói Basic', price: 15000 },
    { id: 'prod_premium', name: 'Gói Premium', price: 35000 },
    { id: 'prod_master', name: 'Gói Master', price: 90000 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price },
      create: { id: p.id, name: p.name, price: p.price, stock: 0 },
    });
    console.log(`✓ Product: ${p.name} (${p.id})`);
  }

  // 2. Tạo 10 tài khoản Gmail mẫu cho gói Basic
  const demoAccounts = Array.from({ length: 10 }).map((_, i) => ({
    productId: 'prod_basic',
    email: `demo.user${i + 1}@gmail.com`,
    password: `PassWord_${Math.random().toString(36).slice(-6)}`,
    recoveryEmail: `recovery${i + 1}@outlook.com`,
    status: 'AVAILABLE' as any,
  }));

  console.log('--- Đang nạp 10 tài khoản vào Kho (Basic) ---');
  
  for (const acc of demoAccounts) {
    await prisma.account.create({
      data: acc
    });
  }

  // 3. Cập nhật số lượng Stock cho Product
  const count = await prisma.account.count({
    where: { productId: 'prod_basic', status: 'AVAILABLE' }
  });

  await prisma.product.update({
    where: { id: 'prod_basic' },
    data: { stock: count }
  });

  console.log(`✅ Thành công! Đã nạp 10 tài khoản mẫu vào kho.`);
  console.log(`📊 Tổng tồn kho Basic hiện tại: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
