'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { Eye, Edit2, Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { sendCampaignAction, deleteCampaignAction } from '@/actions/campaigns';
import { CampaignStatus } from '@prisma/client';

interface CampaignRowActionsProps {
  campaignId: string;
  status: CampaignStatus;
}

export function CampaignRowActions({ campaignId, status }: CampaignRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (confirm('Transmit this executive briefing to all active subscribers now?')) {
      startTransition(async () => {
        const res = await sendCampaignAction(campaignId);
        if (res.warning) {
          alert(res.warning);
        } else if (res.error) {
          alert(`Dispatch Error: ${res.error}`);
        }
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Permanently delete this campaign draft?')) {
      startTransition(async () => {
        await deleteCampaignAction(campaignId);
      });
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-end gap-1.5 text-brand-yellow font-mono text-[11px]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Processing...</span>
      </div>
    );
  }

  const isEditable = status === CampaignStatus.DRAFT || status === CampaignStatus.FAILED;

  return (
    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
      <Link
        href={`/admin/campaigns/${campaignId}/preview`}
        className="p-1.5 rounded-sm bg-brand-dark/80 hover:bg-brand-surface text-sft-text-muted hover:text-brand-yellow border border-sft transition-colors"
        title="Preview Email Template"
      >
        <Eye className="w-3.5 h-3.5" />
      </Link>

      {isEditable && (
        <Link
          href={`/admin/campaigns/${campaignId}/edit`}
          className="p-1.5 rounded-sm bg-brand-dark/80 hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud border border-sft transition-colors"
          title="Edit Campaign"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Link>
      )}

      {isEditable && (
        <button
          type="button"
          onClick={handleSend}
          className="p-1.5 rounded-sm bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 transition-colors cursor-pointer"
          title="Dispatch Campaign"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      )}

      {isEditable && (
        <button
          type="button"
          onClick={handleDelete}
          className="p-1.5 rounded-sm hover:bg-red-950/20 text-red-400/80 hover:text-red-300 border border-transparent hover:border-red-900/40 transition-colors"
          title="Delete Campaign"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

