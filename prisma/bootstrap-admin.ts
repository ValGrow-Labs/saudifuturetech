import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function bootstrap() {
  const email = (process.env.ADMIN_EMAIL || 'admin@saudifuturetech.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';
  const name = process.env.ADMIN_NAME || 'Super Administrator';

  console.log(`🔐 Bootstrapping Super Admin account: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: UserRole.SUPER_ADMIN,
      passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin provisioned successfully!`);
  console.log(`   ID:       ${user.id}`);
  console.log(`   Email:    ${user.email}`);
  console.log(`   Role:     ${user.role}`);
  console.log(`   Active:   ${user.isActive}`);
}

bootstrap()
  .catch((e) => {
    console.error('❌ Bootstrap failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

