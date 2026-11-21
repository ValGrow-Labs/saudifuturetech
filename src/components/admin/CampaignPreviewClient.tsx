'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit2, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sendCampaignAction } from '@/actions/campaigns';
import { CampaignStatus } from '@prisma/client';

interface CampaignPreviewClientProps {
  campaign: {
    id: string;
    title: string;
    subject: string;
    previewText: string | null;
    content: string;
    status: CampaignStatus;
    recipientCount: number;
    failureReason: string | null;
  };
  activeSubscribersCount: number;
  siteUrl: string;
}

export function CampaignPreviewClient({
  campaign,
  activeSubscribersCount,
  siteUrl,
}: CampaignPreviewClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (
      confirm(
        `Are you sure you want to dispatch this campaign to all ${activeSubscribersCount} active subscribers?`
      )
    ) {
      startTransition(async () => {
        const res = await sendCampaignAction(campaign.id);
        if (res.warning) {
          alert(res.warning);
        } else if (res.error) {
          alert(`Dispatch Error: ${res.error}`);
        } else if (res.success) {
          alert('Campaign successfully transmitted to eligible subscribers!');
        }
      });
    }
  };

  const isEditable = campaign.status === CampaignStatus.DRAFT || campaign.status === CampaignStatus.FAILED;
  const paragraphs = campaign.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sft">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="p-1.5 rounded-sm bg-brand-dark hover:bg-brand-surface border border-sft text-sft-text-muted hover:text-brand-cloud transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-yellow" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-yellow font-heading">
                Email Dispatch Preview
              </span>
              <span className="text-sft-text-muted">&bull;</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-brand-dark border border-sft text-brand-cloud">
                Status: {campaign.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-cloud font-heading tracking-tight">
              {campaign.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <Link href={`/admin/campaigns/${campaign.id}/edit`}>
              <Button variant="secondary" size="sm" className="font-heading uppercase text-xs flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Content</span>
              </Button>
            </Link>
          )}

          {isEditable && (
            <Button
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={handleSend}
              className="font-heading uppercase text-xs flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to {activeSubscribersCount} Subscribers</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {campaign.failureReason && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-sm text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-heading uppercase tracking-wide text-[11px] block">
              Provider Delivery Note
            </span>
            <p className="font-sans leading-relaxed text-amber-300">{campaign.failureReason}</p>
          </div>
        </div>
      )}

      {/* Email Inbox Envelope Metadata */}
      <div className="p-4 bg-brand-surface border border-sft rounded-sm text-xs space-y-1.5 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-sft-text-muted font-bold font-heading uppercase text-[10px] w-24">
            Sender:
          </span>
          <span className="text-brand-cloud font-mono">
            Saudi Future Tech &lt;briefing@saudifuturetech.com&gt;
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sft-text-muted font-bold font-heading uppercase text-[10px] w-24">
            Subject:
          </span>
          <span className="text-brand-cloud font-semibold">{campaign.subject}</span>
        </div>
        {campaign.previewText && (
          <div className="flex items-center gap-2">
            <span className="text-sft-text-muted font-bold font-heading uppercase text-[10px] w-24">
              Preheader:
            </span>
            <span className="text-sft-text-muted italic">{campaign.previewText}</span>
          </div>
        )}
      </div>

      {/* Rendered Email Canvas Container */}
      <div className="bg-brand-dark/60 p-4 sm:p-8 rounded-sm border border-sft flex justify-center">
        <div className="w-full max-w-xl bg-white text-zinc-900 rounded-sm shadow-2xl overflow-hidden font-sans border border-zinc-200">
          {/* Email Top Header */}
          <div className="bg-[#25282B] p-6 sm:p-8 border-b-4 border-[#F4C542]">
            <div className="inline-block bg-[#F4C542] text-[#25282B] font-black text-xs font-heading px-2 py-0.5 rounded-xs tracking-wider uppercase mb-2">
              Saudi Future Tech
            </div>
            <h2 className="text-white font-extrabold text-xl sm:text-2xl font-heading tracking-tight leading-snug">
              {campaign.subject}
            </h2>
            {campaign.previewText && (
              <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1.5 leading-relaxed">
                {campaign.previewText}
              </p>
            )}
          </div>

          {/* Email Body */}
          <div className="p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-zinc-800">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Email Footer with Mandatory Unsubscribe */}
          <div className="bg-[#F5F6F3] p-6 border-t border-zinc-200 text-xs text-zinc-600 space-y-2">
            <p className="font-bold font-heading text-[#25282B] uppercase tracking-wider text-[11px]">
              Saudi Future Tech &bull; Executive Briefing
            </p>
            <p className="leading-relaxed">
              You are receiving this intelligence dispatch because you subscribed with verified consent at saudifuturetech.com.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono">
              <span className="underline cursor-not-allowed" title="Dynamic per-recipient unsubscribe link">
                Unsubscribe from this briefing
              </span>
              <span>&bull;</span>
              <a href={`${siteUrl}/privacy`} target="_blank" rel="noopener noreferrer" className="underline">
                Privacy Policy
              </a>
              <span>&bull;</span>
              <span>Riyadh, Kingdom of Saudi Arabia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

