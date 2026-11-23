import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { CampaignRowActions, CampaignStatusWord } from '@/components/admin/CampaignRowActions';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const [campaigns, activeSubscribersCount] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.newsletterSubscriber.count({
      where: { status: SubscriberStatus.ACTIVE },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="Campaigns" description="Newsletter issues: write, preview and send to subscribers.">
        <Link href="/admin/campaigns/new">
          <Button variant="primary" size="md">
            New campaign
          </Button>
        </Link>
      </PageHeading>

      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink-2">
        <span>
          <span className="font-sans tabular text-ink">{activeSubscribersCount}</span> active subscribers will receive
          the next send.
        </span>
        <Link href="/admin/subscribers" className="text-[0.8125rem] text-ink-2 hover:text-clay transition-colors">
          Manage subscribers →
        </Link>
      </p>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Write the first newsletter issue. You can preview it before anything is sent."
          actionLabel="New campaign"
          actionHref="/admin/campaigns/new"
        />
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="data-table min-w-[48rem]">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Created by</th>
                <th>Date</th>
                <th className="text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id}>
                  <td className="max-w-[26rem]">
                    <Link
                      href={`/admin/campaigns/${camp.id}/preview`}
                      className="font-serif text-[1rem] leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                    >
                      {camp.subject}
                    </Link>
                    <div className="mt-0.5 text-[0.75rem] text-ink-4 truncate">{camp.title}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    <CampaignStatusWord status={camp.status} />
                  </td>
                  <td className="whitespace-nowrap font-sans text-[0.75rem] tabular">
                    {camp.status === CampaignStatus.SENT ? (
                      <span className="text-ink-2">{camp.recipientCount} sent</span>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-[0.8125rem]">{camp.createdBy?.name || '—'}</td>
                  <td className="whitespace-nowrap font-sans text-[0.71875rem] tabular">
                    <div className="text-ink-2">{formatDate(camp.sentAt || camp.createdAt)}</div>
                    <div className="text-ink-4">{camp.sentAt ? 'Sent' : 'Created'}</div>
                  </td>
                  <td className="text-right">
                    <CampaignRowActions campaignId={camp.id} status={camp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
