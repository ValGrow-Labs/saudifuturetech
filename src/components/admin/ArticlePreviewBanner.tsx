'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { publishArticleAction } from '@/actions/articles';

interface ArticlePreviewBannerProps {
  articleId: string;
  status: string;
  canPublish: boolean;
}

export function ArticlePreviewBanner({
  articleId,
  status,
  canPublish,
}: ArticlePreviewBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (confirm('Publish this story immediately to the live public site?')) {
      startTransition(async () => {
        await publishArticleAction(articleId);
      });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-50/95 backdrop-blur-md border-b border-amber-200 px-4 py-2.5 text-xs text-ink-high shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold font-sans uppercase tracking-wider text-amber-800 text-[11px] mr-2">
              Backstage Editorial Preview:
            </span>
            <span className="text-ink-body font-sans text-xs">
              This preview reflects production layout. Status is{' '}
              <span className="font-mono font-bold text-ink-high uppercase">[{status}]</span>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-editorial-pure hover:bg-editorial-sand border border-editorial-hairline text-ink-high text-xs font-sans font-medium transition-editorial shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-ink-high" />
            <span>Article List</span>
          </Link>

          <Link
            href={`/admin/articles/${articleId}/edit`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-editorial-pure hover:bg-editorial-sand border border-editorial-hairline text-ink-high text-xs font-sans font-bold transition-editorial shadow-xs"
          >
            <Edit className="w-3.5 h-3.5 text-ink-high" />
            <span>Edit Article</span>
          </Link>

          {canPublish && status !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-brand-yellow hover:bg-brand-yellow/90 text-ink-high border border-ink-high/20 font-sans font-bold text-xs transition-editorial cursor-pointer shadow-xs"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-high" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-ink-high" />
              )}
              <span>Approve & Publish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

