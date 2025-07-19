import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcryptjs.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@litefi.ng' },
      update: {},
      create: {
        email: 'admin@litefi.ng',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    console.log('✅ Admin user created:', admin.email);

    // Create test user
    const userPassword = await bcryptjs.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@litefi.ng' },
      update: {},
      create: {
        email: 'user@litefi.ng',
        passwordHash: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        emailVerified: true,
      },
    });

    console.log('✅ Test user created:', user.email);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Admin: admin@litefi.ng / admin123');
    console.log('User: user@litefi.ng / user123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });