'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { publishArticleAction } from '@/actions/articles';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

interface ArticlePreviewBannerProps {
  articleId: string;
  status: string;
  canPublish: boolean;
}

export function ArticlePreviewBanner({ articleId, status, canPublish }: ArticlePreviewBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (confirm('Publish this article now? It will go live on the site immediately.')) {
      startTransition(async () => {
        await publishArticleAction(articleId);
      });
    }
  };

  return (
    <div className="sticky top-14 z-30 bg-paper-band/95 backdrop-blur-[6px] border-b border-rule px-4 sm:px-6 lg:px-10 py-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-ink-2">
          <span className="text-ink font-medium">Preview</span>
          <span className="text-ink-4" aria-hidden>
            ·
          </span>
          <StatusBadge status={status as any} />
          <span className="hidden md:inline text-ink-3">Readers see this layout once the article is published.</span>
        </p>

        <div className="flex items-center gap-4 shrink-0">
          <Link href="/admin/articles" className="row-action">
            ← All articles
          </Link>
          <Link href={`/admin/articles/${articleId}/edit`} className="row-action">
            Edit
          </Link>
          {canPublish && status !== 'PUBLISHED' && (
            <Button type="button" variant="primary" size="sm" onClick={handlePublish} disabled={isPending}>
              {isPending ? 'Publishing…' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
