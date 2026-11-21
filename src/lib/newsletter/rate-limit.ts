import prisma from '@/lib/prisma';

const MAX_SUBSCRIPTION_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 15;
const COOLDOWN_MINUTES = 10;

/**
 * Shared persistent rate limiting for newsletter subscription submissions.
 * Uses PostgreSQL database via Prisma (loginAttempt table) to synchronize across all serverless/multi-pod instances.
 */
export async function checkNewsletterRateLimit(
  rawEmail: string,
  clientIp?: string
): Promise<{
  allowed: boolean;
  remainingAttempts?: number;
  waitMinutes?: number;
}> {
  const email = rawEmail.trim().toLowerCase();
  const legacyIdentifier = `newsletter:${email}`;
  const emailIdentifier = `newsletter:email:${email}`;
  const now = new Date();

  try {
    // 1. Check legacy email record (backwards compatibility with phase tests)
    const legacyRecord = await prisma.loginAttempt.findUnique({
      where: { identifier: legacyIdentifier },
    });
    if (legacyRecord?.lockedUntil && legacyRecord.lockedUntil > now) {
      const remainingMs = legacyRecord.lockedUntil.getTime() - now.getTime();
      const waitMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return { allowed: false, remainingAttempts: 0, waitMinutes };
    }

    // 2. Check email record
    const emailRecord = await prisma.loginAttempt.findUnique({
      where: { identifier: emailIdentifier },
    });
    if (emailRecord?.lockedUntil && emailRecord.lockedUntil > now) {
      const remainingMs = emailRecord.lockedUntil.getTime() - now.getTime();
      const waitMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return { allowed: false, remainingAttempts: 0, waitMinutes };
    }

    // 3. Check IP address if provided (protects against distributed dictionary spam)
    if (clientIp && clientIp !== 'unknown' && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      const ipRecord = await prisma.loginAttempt.findUnique({
        where: { identifier: `newsletter:ip:${clientIp}` },
      });
      if (ipRecord?.lockedUntil && ipRecord.lockedUntil > now) {
        const remainingMs = ipRecord.lockedUntil.getTime() - now.getTime();
        const waitMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
        return { allowed: false, remainingAttempts: 0, waitMinutes };
      }
    }

    const failed = Math.max(legacyRecord?.failedAttempts ?? 0, emailRecord?.failedAttempts ?? 0);
    const remaining = Math.max(0, MAX_SUBSCRIPTION_ATTEMPTS - failed);
    return { allowed: true, remainingAttempts: remaining };
  } catch (error) {
    console.warn('[NewsletterRateLimit] Failed to query rate limit record, allowing:', error);
    return { allowed: true, remainingAttempts: MAX_SUBSCRIPTION_ATTEMPTS };
  }
}

async function updateAttempt(identifier: string, maxAttempts: number, now: Date) {
  const existing = await prisma.loginAttempt.findUnique({
    where: { identifier },
  });

  const isLockExpired = existing?.lockedUntil && existing.lockedUntil <= now;
  const currentAttempts = isLockExpired ? 0 : existing?.failedAttempts ?? 0;
  const newAttempts = currentAttempts + 1;

  const shouldLock = newAttempts >= maxAttempts;
  const lockedUntil = shouldLock
    ? new Date(now.getTime() + COOLDOWN_MINUTES * 60 * 1000)
    : null;

  await prisma.loginAttempt.upsert({
    where: { identifier },
    create: {
      identifier,
      failedAttempts: newAttempts,
      lockedUntil,
      lastAttemptAt: now,
    },
    update: {
      failedAttempts: newAttempts,
      lockedUntil,
      lastAttemptAt: now,
    },
  });
}

export async function recordNewsletterAttempt(rawEmail: string, clientIp?: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const legacyIdentifier = `newsletter:${email}`;
  const emailIdentifier = `newsletter:email:${email}`;
  const now = new Date();

  try {
    await updateAttempt(legacyIdentifier, MAX_SUBSCRIPTION_ATTEMPTS, now);
    await updateAttempt(emailIdentifier, MAX_SUBSCRIPTION_ATTEMPTS, now);

    if (clientIp && clientIp !== 'unknown' && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      await updateAttempt(`newsletter:ip:${clientIp}`, MAX_IP_ATTEMPTS, now);
    }
  } catch (error) {
    console.warn('[NewsletterRateLimit] Failed to record attempt:', error);
  }
}
