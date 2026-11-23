import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { SubscriberManager } from '@/components/admin/SubscriberManager';
import { SubscriberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface AdminSubscribersPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminSubscribersPage({ searchParams }: AdminSubscribersPageProps) {
  const currentUser = await requireRole(['SUPER_ADMIN', 'EDITOR']);
  const params = await searchParams;

  const activeStatus = params.status || 'ALL';
  const searchQuery = params.q?.trim() || '';

  const [totalCount, activeCount, unsubscribedCount] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.ACTIVE } }),
    prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.UNSUBSCRIBED } }),
  ]);

  const where: any = {};

  if (activeStatus && activeStatus !== 'ALL') {
    where.status = activeStatus as SubscriberStatus;
  }

  if (searchQuery) {
    where.email = { contains: searchQuery, mode: 'insensitive' };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <PageHeading
        title="Subscribers"
        description="People who signed up for the newsletter, with the date they gave consent."
      >
        {isSuperAdmin ? (
          <a href="/api/admin/subscribers/export" download className="btn-quiet">
            Export active as CSV
            <span className="font-sans tabular text-[0.75rem]">{activeCount}</span>
          </a>
        ) : (
          <span className="text-[0.8125rem] text-ink-3">Only super admins can export.</span>
        )}
      </PageHeading>

      <SubscriberManager
        subscribers={subscribers}
        totalCount={totalCount}
        activeCount={activeCount}
        unsubscribedCount={unsubscribedCount}
        initialSearch={searchQuery}
        initialStatus={activeStatus}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
