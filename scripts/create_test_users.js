const { PrismaClient } = require('./src/generated/prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  console.log('🚀 Bắt đầu tạo User test...');
  
  const users = [
    { email: 'user1@test.com', name: 'Người dùng 1' },
    { email: 'user2@test.com', name: 'Người dùng 2' }
  ];

  const password = await bcrypt.hash('password123', 10);

  for (const u of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          name: u.name,
          password: password
        }
      });
      console.log(`✅ Đã tạo/Cập nhật: ${user.email}`);
    } catch (err) {
      console.error(`❌ Lỗi tạo user ${u.email}:`, err.message);
    }
  }
  
  await prisma.$disconnect();
}

createUsers();
