'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Edit,
  CheckCircle2,
  ArrowDownCircle,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  publishArticleAction,
  unpublishArticleAction,
  submitForReviewAction,
  deleteArticleAction,
} from '@/actions/articles';

interface ArticleRowActionsProps {
  articleId: string;
  slug: string;
  status: string;
  canPublish: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function ArticleRowActions({
  articleId,
  slug,
  status,
  canPublish,
  canEdit,
  canDelete,
}: ArticleRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this article immediately to saudifuturetech.com?')) {
      startTransition(async () => {
        await publishArticleAction(articleId);
      });
    }
  };

  const handleUnpublish = () => {
    if (confirm('Revert this article to DRAFT? It will be removed from the public website.')) {
      startTransition(async () => {
        await unpublishArticleAction(articleId);
      });
    }
  };

  const handleSubmitForReview = () => {
    startTransition(async () => {
      await submitForReviewAction(articleId);
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
      startTransition(async () => {
        await deleteArticleAction(articleId);
      });
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-end gap-2 text-sft-text-muted">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-yellow" />
        <span className="text-[11px] font-mono">Updating...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
      {/* Editorial Canvas Preview */}
      <Link
        href={`/admin/articles/${articleId}/preview`}
        className="p-1.5 rounded-sm bg-brand-dark/80 hover:bg-brand-surface text-sft-text-muted hover:text-brand-yellow border border-sft transition-colors"
        title="View Editorial Preview"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      {/* Edit (if permitted) */}
      {canEdit && (
        <Link
          href={`/admin/articles/${articleId}/edit`}
          className="p-1.5 rounded-sm bg-brand-dark/80 hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud border border-sft transition-colors"
          title="Edit Story"
        >
          <Edit className="w-3.5 h-3.5" />
        </Link>
      )}

      {/* Submit for Review (if DRAFT and user is author or editor) */}
      {status === 'DRAFT' && (
        <button
          type="button"
          onClick={handleSubmitForReview}
          className="p-1.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
          title="Submit for Editorial Review"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Publish (Editors & Super Admins) */}
      {canPublish && (status === 'DRAFT' || status === 'IN_REVIEW' || status === 'SCHEDULED') && (
        <button
          type="button"
          onClick={handlePublish}
          className="p-1.5 rounded-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
          title={status === 'SCHEDULED' ? 'Publish Immediately (Override Schedule)' : 'Approve & Publish to Production'}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Unpublish / Cancel Schedule (Editors & Super Admins) */}
      {canPublish && (status === 'PUBLISHED' || status === 'SCHEDULED') && (
        <button
          type="button"
          onClick={handleUnpublish}
          className="p-1.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 transition-colors"
          title={status === 'SCHEDULED' ? 'Cancel Scheduled Release (Revert to Draft)' : 'Unpublish to Draft'}
        >
          <ArrowDownCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Delete (if permitted) */}
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="p-1.5 rounded-sm bg-red-950/20 hover:bg-red-900/40 text-red-400/80 hover:text-red-300 border border-red-900/40 transition-colors"
          title="Delete Article"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

