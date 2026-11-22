'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-rule">
        <div className="min-w-0">
          <Link href="/admin/campaigns" className="meta hover:text-ink transition-colors">
            ← Campaigns
          </Link>
          <h1 className="mt-2 font-serif text-display-sm text-ink line-clamp-2">
            {isNew ? 'New campaign' : title || 'Untitled campaign'}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {!isNew && initialData?.id && (
            <Link href={`/admin/campaigns/${initialData.id}/preview`} className="row-action">
              Preview
            </Link>
          )}
          <Button type="button" variant="primary" size="md" disabled={isPending} onClick={() => handleSubmit('save')}>
            {isPending ? 'Saving…' : 'Save draft'}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <p role="alert" className="border-l-2 border-clay pl-3 text-sm text-ink-2">
          {errorMsg}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="campaign-title" className="field-label">
            Internal name <span className="text-ink-4">*</span>
          </label>
          <input
            id="campaign-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly briefing, issue 03"
            className="field"
          />
          <p className="field-hint">Only shown in the CMS.</p>
        </div>

        <div>
          <label htmlFor="campaign-subject" className="field-label">
            Subject line <span className="text-ink-4">*</span>
          </label>
          <input
            id="campaign-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What readers see in their inbox"
            className="field font-serif !text-[1.25rem] !py-2.5"
          />
        </div>

        <div>
          <label htmlFor="campaign-preview" className="field-label">
            Preview text
          </label>
          <input
            id="campaign-preview"
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="The line shown after the subject in most inboxes"
            className="field"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="campaign-content" className="field-label">
              Body <span className="text-ink-4">*</span>
            </label>
            <span className="font-sans text-[0.6875rem] text-ink-3 tabular">{wordCount} words</span>
          </div>
          <textarea
            id="campaign-content"
            rows={16}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the issue. Leave a blank line between paragraphs."
            className="field font-serif !text-[1.0625rem] !leading-[1.75] !px-5 !py-4"
          />
          <p className="field-hint">
            The header and each reader&rsquo;s unsubscribe link are added automatically when the email is sent.
          </p>
        </div>

        {!isNew && (
          <div className="pt-2">
            <Button type="button" variant="outline" size="md" disabled={isPending} onClick={() => handleSubmit('preview')}>
              Save and preview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
