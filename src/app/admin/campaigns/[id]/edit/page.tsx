import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { CampaignEditorForm } from '@/components/admin/CampaignEditorForm';

export const dynamic = 'force-dynamic';

interface EditCampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);
  const { id } = await params;

  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  const initialData = {
    id: campaign.id,
    title: campaign.title,
    subject: campaign.subject,
    previewText: campaign.previewText,
    content: campaign.content,
    status: campaign.status,
  };

  return (
    <div className="space-y-6 font-sans">
      <CampaignEditorForm isNew={false} initialData={initialData} />
    </div>
  );
}

