import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fallback database URL prevents build-time schema validation crashes when DATABASE_URL is not set during CI/CD builds
const fallbackDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/saudi_future_tech?schema=public';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: fallbackDbUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

