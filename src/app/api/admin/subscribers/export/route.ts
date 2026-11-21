import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/guard';
import { SubscriberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Authorization check: Super Admin only (PDPL data protection compliance)
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff session required.' },
      { status: 401 }
    );
  }
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Super Admin privileges required to export subscriber personal data.' },
      { status: 403 }
    );
  }

  // 2. Query active subscribers
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: SubscriberStatus.ACTIVE },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Format CSV
  const headers = ['ID', 'Email', 'Status', 'Consent Given Date', 'Subscribed Date', 'Unsubscribed Date'];
  const rows = subscribers.map((sub) => [
    `"${sub.id}"`,
    `"${sub.email}"`,
    `"${sub.status}"`,
    `"${sub.consentGivenAt.toISOString()}"`,
    `"${sub.createdAt.toISOString()}"`,
    `"${sub.unsubscribedAt ? sub.unsubscribedAt.toISOString() : ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateSlug = new Date().toISOString().split('T')[0];

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sft-active-subscribers-${dateSlug}.csv"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
