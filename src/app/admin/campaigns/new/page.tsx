import React from 'react';
import { requireRole } from '@/lib/auth/guard';
import { CampaignEditorForm } from '@/components/admin/CampaignEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  return (
    <div className="space-y-6 font-sans">
      <CampaignEditorForm isNew={true} />
    </div>
  );
}

