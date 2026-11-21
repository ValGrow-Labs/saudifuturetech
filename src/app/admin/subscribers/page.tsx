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

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
          Audience & Distribution
        </div>
        <PageHeading
          title="Newsletter Subscribers"
          description="Manage active readers, verified consent audit trails, unsubscription preferences, and secure CSV exports."
        />
      </div>

      <SubscriberManager
        subscribers={subscribers}
        totalCount={totalCount}
        activeCount={activeCount}
        unsubscribedCount={unsubscribedCount}
        initialSearch={searchQuery}
        initialStatus={activeStatus}
        isSuperAdmin={currentUser.role === 'SUPER_ADMIN'}
      />
    </div>
  );
}

