'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { renderCampaignEmail } from '@/lib/newsletter/email-template';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { sendCampaignAction } from '@/actions/campaigns';
import { CampaignStatus } from '@prisma/client';
import { CampaignStatusWord } from '@/components/admin/CampaignRowActions';

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
        `Send this campaign to all ${activeSubscribersCount} active subscribers now?`
      )
    ) {
      startTransition(async () => {
        const res = await sendCampaignAction(campaign.id);
        if (res.warning) {
          alert(res.warning);
        } else if (res.error) {
          alert(`Couldn't send: ${res.error}`);
        } else if (res.success) {
          alert('Sent to active subscribers.');
        }
      });
    }
  };

  const isEditable = campaign.status === CampaignStatus.DRAFT || campaign.status === CampaignStatus.FAILED;

  // Same renderer the send action uses, so the preview is exactly what subscribers get.
  const emailHtml = useMemo(
    () =>
      renderCampaignEmail({
        subject: campaign.subject,
        previewText: campaign.previewText,
        content: campaign.content,
        siteUrl,
      }),
    [campaign.subject, campaign.previewText, campaign.content, siteUrl]
  );
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(900);
  const fitFrame = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc?.body) setFrameHeight(doc.body.scrollHeight + 2);
  };
  // srcDoc can finish loading before React attaches onLoad — measure once on mount too.
  useEffect(() => {
    const t = setTimeout(fitFrame, 50);
    return () => clearTimeout(t);
  }, [emailHtml]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-rule">
        <div className="min-w-0">
          <Link href="/admin/campaigns" className="meta hover:text-ink transition-colors">
            ← Campaigns
          </Link>
          <h1 className="mt-2 font-serif text-display-sm text-ink line-clamp-2">{campaign.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CampaignStatusWord status={campaign.status} />
            {campaign.status === CampaignStatus.SENT && (
              <span className="font-sans text-[0.71875rem] text-ink-3 tabular">{campaign.recipientCount} recipients</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {isEditable && (
            <Link href={`/admin/campaigns/${campaign.id}/edit`} className="row-action">
              Edit
            </Link>
          )}
          {isEditable && (
            <Button variant="primary" size="md" disabled={isPending} onClick={handleSend}>
              {isPending ? 'Sending…' : `Send to ${activeSubscribersCount} subscribers`}
            </Button>
          )}
        </div>
      </div>

      {campaign.failureReason && (
        <div className="border-l-2 border-clay pl-3 text-sm text-ink-2 max-w-3xl">
          <p className="text-ink">Delivery note</p>
          <p className="mt-0.5 leading-relaxed">{campaign.failureReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 items-start">
        <dl className="lg:col-span-4 text-[0.8125rem] lg:sticky lg:top-20">
          <div className="border-t-2 border-ink pt-3 pb-3 border-b border-rule">
            <dt className="meta">From</dt>
            <dd className="mt-1 text-ink-2 break-words">Saudi Future Tech &lt;briefing@saudifuturetech.com&gt;</dd>
          </div>
          <div className="py-3 border-b border-rule">
            <dt className="meta">Subject</dt>
            <dd className="mt-1 text-ink">{campaign.subject}</dd>
          </div>
          <div className="py-3 border-b border-rule">
            <dt className="meta">Preview text</dt>
            <dd className="mt-1 text-ink-3">{campaign.previewText || <span className="text-ink-4">None</span>}</dd>
          </div>
          <div className="py-3 border-b border-rule">
            <dt className="meta">Internal name</dt>
            <dd className="mt-1 text-ink-3">{campaign.title}</dd>
          </div>
          <div className="py-3 border-b border-rule">
            <dt className="meta">Audience</dt>
            <dd className="mt-1 text-ink-2">
              <span className="font-sans tabular">{activeSubscribersCount}</span> active subscribers
            </dd>
          </div>
        </dl>

        <div className="lg:col-span-8">
          <iframe
            ref={frameRef}
            title="Email preview"
            srcDoc={emailHtml}
            sandbox="allow-same-origin"
            onLoad={fitFrame}
            className="w-full border border-rule bg-paper"
            style={{ height: frameHeight }}
          />
          <p className="field-hint">Rendered with the same template used to send. Each recipient gets their own unsubscribe link.</p>
        </div>
      </div>
    </div>
  );
}
