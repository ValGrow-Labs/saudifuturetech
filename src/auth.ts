import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { checkRateLimit, recordFailedAttempt, resetFailedAttempts } from '@/lib/auth/rate-limit';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // 1. Check rate limit
        const rateCheck = await checkRateLimit(email);
        if (!rateCheck.allowed) {
          throw new Error(
            `Account temporarily locked due to repeated failed attempts. Please retry in ${rateCheck.remainingMinutes} minutes.`
          );
        }

        // 2. Query user from database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          await recordFailedAttempt(email);
          return null;
        }

        // 3. Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          const attempt = await recordFailedAttempt(email);
          if (attempt.locked) {
            throw new Error(
              'Too many failed login attempts. Your account has been temporarily locked for 15 minutes.'
            );
          }
          return null;
        }

        // 4. Verify account active state
        if (!user.isActive) {
          throw new Error('This account has been deactivated. Please contact your system administrator.');
        }

        // 5. Successful login: reset failed counter
        await resetFailedAttempts(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          authorId: user.authorId,
          isActive: user.isActive,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
});

