'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save, Eye, ArrowLeft, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createCampaignAction, updateCampaignAction } from '@/actions/campaigns';

interface CampaignEditorFormProps {
  initialData?: {
    id: string;
    title: string;
    subject: string;
    previewText?: string | null;
    content: string;
    status: string;
  };
  isNew?: boolean;
}

export function CampaignEditorForm({ initialData, isNew = false }: CampaignEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [previewText, setPreviewText] = useState(initialData?.previewText || '');
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = (actionType: 'save' | 'preview') => {
    setErrorMsg(null);

    const formData = new FormData();
    if (!isNew && initialData?.id) formData.append('id', initialData.id);
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('previewText', previewText);
    formData.append('content', content);

    startTransition(async () => {
      const res = isNew
        ? await createCampaignAction(undefined, formData)
        : await updateCampaignAction(undefined, formData);

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success && res.campaignId) {
        if (actionType === 'preview') {
          router.push(`/admin/campaigns/${res.campaignId}/preview`);
        } else if (isNew) {
          router.push(`/admin/campaigns/${res.campaignId}/edit`);
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sft">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="p-1.5 rounded-sm bg-brand-dark hover:bg-brand-surface border border-sft text-sft-text-muted hover:text-brand-cloud transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-yellow" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-cloud font-heading tracking-tight">
              {isNew ? 'Compose Executive Briefing' : `Edit: ${title || 'Campaign'}`}
            </h1>
            <p className="text-xs text-sft-text-muted">
              Draft weekly intelligence dispatch for verified corporate and executive subscribers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && initialData?.id && (
            <Link
              href={`/admin/campaigns/${initialData.id}/preview`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-brand-dark hover:bg-brand-surface border border-sft text-brand-cloud text-xs font-heading font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Preview Email</span>
            </Link>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isPending}
            onClick={() => handleSubmit('save')}
            className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-sm text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-sans text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Campaign Form Box */}
      <div className="bg-brand-surface rounded-sm border border-sft p-6 space-y-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
            Internal Campaign Title <span className="text-brand-yellow">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Executive Dispatch #03: Sovereign Cloud Topology"
            className="w-full bg-brand-dark border border-sft rounded-sm px-3.5 py-2 text-sm font-heading font-bold text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors"
          />
          <p className="text-[11px] text-sft-text-muted">Used for internal tracking and reporting in the CMS console.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
            Email Subject Line <span className="text-brand-yellow">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Inside Saudi Arabia’s Sovereign Compute Blueprint"
            className="w-full bg-brand-dark border border-sft rounded-sm px-3.5 py-2 text-sm text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
            Inbox Preview Text (Preheader)
          </label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="e.g. ALLaM foundation models, SDAIA compute roadmap, and OXAGON autonomous ports."
            className="w-full bg-brand-dark border border-sft rounded-sm px-3.5 py-2 text-xs text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
              Newsletter Body & Editorial Content <span className="text-brand-yellow">*</span>
            </label>
            <span className="text-[11px] font-mono text-sft-text-muted">
              {content.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={14}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your newsletter dispatch here. Paragraphs separated by double line breaks will format cleanly into email blocks..."
            className="w-full bg-brand-dark border border-sft rounded-sm p-4 text-xs sm:text-sm font-sans text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors leading-relaxed"
          />
          <p className="text-[11px] text-sft-text-muted">
            The publication header, brand logo, and mandatory personalized unsubscribe link are automatically appended during email transmission.
          </p>
        </div>
      </div>
    </div>
  );
}

