'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { sendCampaignAction, deleteCampaignAction } from '@/actions/campaigns';
import { CampaignStatus } from '@prisma/client';

const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; text: string; dot: string }> = {
  DRAFT: { label: 'Draft', text: 'text-ink-3', dot: 'bg-ink-4' },
  SCHEDULED: { label: 'Scheduled', text: 'text-ink', dot: 'bg-ink' },
  SENDING: { label: 'Sending', text: 'text-clay', dot: 'bg-clay' },
  SENT: { label: 'Sent', text: 'text-moss', dot: 'bg-moss' },
  FAILED: { label: 'Failed', text: 'text-clay', dot: 'bg-clay' },
};

export function CampaignStatusWord({ status }: { status: CampaignStatus }) {
  const s = CAMPAIGN_STATUS[status] ?? CAMPAIGN_STATUS.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-[0.71875rem] whitespace-nowrap ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

interface CampaignRowActionsProps {
  campaignId: string;
  status: CampaignStatus;
}

export function CampaignRowActions({ campaignId, status }: CampaignRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (confirm('Send this campaign to all active subscribers now?')) {
      startTransition(async () => {
        const res = await sendCampaignAction(campaignId);
        if (res.warning) {
          alert(res.warning);
        } else if (res.error) {
          alert(`Couldn't send: ${res.error}`);
        }
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this campaign permanently? This cannot be undone.')) {
      startTransition(async () => {
        await deleteCampaignAction(campaignId);
      });
    }
  };

  if (isPending) {
    return <span className="font-sans text-[0.71875rem] text-ink-3">Working…</span>;
  }

  const isEditable = status === CampaignStatus.DRAFT || status === CampaignStatus.FAILED;

  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
      {isEditable && (
        <Link href={`/admin/campaigns/${campaignId}/edit`} className="row-action">
          Edit
        </Link>
      )}
      <Link href={`/admin/campaigns/${campaignId}/preview`} className="row-action">
        Preview
      </Link>
      {isEditable && (
        <button type="button" onClick={handleSend} className="row-action">
          Send
        </button>
      )}
      {isEditable && (
        <button type="button" onClick={handleDelete} className="row-action-danger">
          Delete
        </button>
      )}
    </div>
  );
}
