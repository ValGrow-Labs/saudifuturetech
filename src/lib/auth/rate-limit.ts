import prisma from '@/lib/prisma';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingMinutes?: number;
  retryAfter?: Date;
  remainingAttempts?: number;
}

export interface FailedAttemptResult {
  locked: boolean;
  lockedUntil?: Date;
  attempts: number;
}

/**
 * Normalize an identifier for rate limiting (e.g., lowercased email).
 */
export function normalizeIdentifier(rawIdentifier: string): string {
  return rawIdentifier.trim().toLowerCase();
}

/**
 * Check whether an identifier (email) is currently locked out due to excessive failed attempts.
 */
export async function checkRateLimit(rawIdentifier: string): Promise<RateLimitCheckResult> {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (!identifier) {
    return { allowed: false, remainingAttempts: 0 };
  }

  try {
    const record = await prisma.loginAttempt.findUnique({
      where: { identifier },
    });

    if (!record) {
      return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }

    const now = new Date();

    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingMs = record.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return {
        allowed: false,
        remainingMinutes,
        retryAfter: record.lockedUntil,
        remainingAttempts: 0,
      };
    }

    // If lockout duration has elapsed, allow attempts
    const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);
    return {
      allowed: true,
      remainingAttempts,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // On DB failure, do not completely lock out, but fail open safely for legitimate logins
    return { allowed: true, remainingAttempts: 1 };
  }
}

/**
 * Record a failed authentication attempt.
 * Increments failed attempts and triggers lockout if threshold is reached.
 */
export async function recordFailedAttempt(rawIdentifier: string): Promise<FailedAttemptResult> {
  const identifier = normalizeIdentifier(rawIdentifier);
  const now = new Date();

  try {
    const existing = await prisma.loginAttempt.findUnique({
      where: { identifier },
    });

    // Reset count if previous lockout has expired
    const isPreviousLockExpired = existing?.lockedUntil && existing.lockedUntil <= now;
    const currentAttempts = isPreviousLockExpired ? 0 : existing?.failedAttempts ?? 0;
    const newAttempts = currentAttempts + 1;

    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
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

    return {
      locked: shouldLock,
      lockedUntil: lockedUntil ?? undefined,
      attempts: newAttempts,
    };
  } catch (error) {
    console.error('[RateLimit] Error recording failed attempt:', error);
    return { locked: false, attempts: 1 };
  }
}

/**
 * Reset failed attempts following a successful authentication.
 */
export async function resetFailedAttempts(rawIdentifier: string): Promise<void> {
  const identifier = normalizeIdentifier(rawIdentifier);
  try {
    await prisma.loginAttempt.updateMany({
      where: { identifier },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
  } catch (error) {
    console.error('[RateLimit] Error resetting failed attempts:', error);
  }
}

