'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
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
    if (confirm('Publish this article now? It will go live on the site immediately.')) {
      startTransition(async () => {
        await publishArticleAction(articleId);
      });
    }
  };

  const handleUnpublish = () => {
    if (confirm('Move this article back to draft? It will be removed from the public site.')) {
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
    if (confirm('Delete this article permanently? This cannot be undone.')) {
      startTransition(async () => {
        await deleteArticleAction(articleId);
      });
    }
  };

  if (isPending) {
    return <span className="font-sans text-[0.71875rem] text-ink-3">Updating…</span>;
  }

  return (
    <div className="flex items-center justify-end gap-x-3 whitespace-nowrap">
      {canEdit && (
        <Link href={`/admin/articles/${articleId}/edit`} className="row-action">
          Edit
        </Link>
      )}

      <Link href={`/admin/articles/${articleId}/preview`} className="row-action">
        Preview
      </Link>

      {status === 'DRAFT' && (
        <button type="button" onClick={handleSubmitForReview} className="row-action" title="Submit for review">
          Submit
        </button>
      )}

      {canPublish && (status === 'DRAFT' || status === 'IN_REVIEW' || status === 'SCHEDULED') && (
        <button
          type="button"
          onClick={handlePublish}
          className="row-action"
          title={status === 'SCHEDULED' ? 'Publish now, ignoring the schedule' : 'Publish now'}
        >
          Publish
        </button>
      )}

      {canPublish && (status === 'PUBLISHED' || status === 'SCHEDULED') && (
        <button
          type="button"
          onClick={handleUnpublish}
          className="row-action"
          title={status === 'SCHEDULED' ? 'Cancel the schedule and move back to draft' : 'Move back to draft'}
        >
          {status === 'SCHEDULED' ? 'Unschedule' : 'Unpublish'}
        </button>
      )}

      {canDelete && (
        <button type="button" onClick={handleDelete} className="row-action-danger">
          Delete
        </button>
      )}
    </div>
  );
}
