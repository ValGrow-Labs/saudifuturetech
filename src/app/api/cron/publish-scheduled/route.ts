import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledArticles } from '@/lib/scheduler/publisher';

export const dynamic = 'force-dynamic';

/**
 * Machine Cron Endpoint for Scheduled Editorial Publishing.
 *
 * Security Architecture & Policy:
 * 1. Strictly requires `Authorization: Bearer <CRON_SECRET>` header for ALL requests.
 * 2. Query parameter (?key=...) authentication is strictly rejected to prevent secret leakage
 *    in access logs, referrers, browser history, or cloud infrastructure monitoring.
 * 3. Interactive sessions (Unauthenticated, AUTHOR, EDITOR, SUPER_ADMIN) cannot bypass the Bearer token.
 * 4. Interactive manual triggering by authorized editorial staff (SUPER_ADMIN or EDITOR) must
 *    use the audited Server Action `triggerScheduledPublisherAction()` in `src/actions/scheduler.ts`.
 */
async function verifySchedulerAuthorization(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret-2026';
  const authHeader = req.headers.get('authorization');

  // Strict Bearer token check only
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const isAuthorized = await verifySchedulerAuthorization(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid Bearer CRON_SECRET machine token is strictly required for all cron invocations.' },
      { status: 401 }
    );
  }

  const result = await publishScheduledArticles();
  return NextResponse.json({ success: true, ...result }, { status: 200 });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
