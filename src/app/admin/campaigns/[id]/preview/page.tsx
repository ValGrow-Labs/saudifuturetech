import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { CampaignPreviewClient } from '@/components/admin/CampaignPreviewClient';
import { SubscriberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface CampaignPreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignPreviewPage({ params }: CampaignPreviewPageProps) {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);
  const { id } = await params;

  const [campaign, activeSubscribersCount] = await Promise.all([
    prisma.newsletterCampaign.findUnique({
      where: { id },
    }),
    prisma.newsletterSubscriber.count({
      where: { status: SubscriberStatus.ACTIVE },
    }),
  ]);

  if (!campaign) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saudifuturetech.com';

  return (
    <div className="space-y-6">
      <CampaignPreviewClient
        campaign={campaign}
        activeSubscribersCount={activeSubscribersCount}
        siteUrl={siteUrl}
      />
    </div>
  );
}

