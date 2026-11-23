import React from 'react';
import { cn } from '@/lib/utils';
import { ArticleStatus } from '@/types';

interface StatusBadgeProps {
  status: ArticleStatus;
  className?: string;
}

const CONFIG: Record<ArticleStatus, { label: string; text: string; dot: string }> = {
  DRAFT: { label: 'Draft', text: 'text-ink-3', dot: 'bg-ink-4' },
  IN_REVIEW: { label: 'In review', text: 'text-alert', dot: 'bg-alert' },
  SCHEDULED: { label: 'Scheduled', text: 'text-ink', dot: 'bg-ink' },
  PUBLISHED: { label: 'Published', text: 'text-moss', dot: 'bg-moss' },
  ARCHIVED: { label: 'Archived', text: 'text-ink-4', dot: 'bg-rule' },
};

/** Article status as a word with a 6px dot — not a pill. */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const item = CONFIG[status] ?? CONFIG.DRAFT;
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-sans text-[0.71875rem] whitespace-nowrap', item.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', item.dot)} aria-hidden="true" />
      {item.label}
    </span>
  );
};

export default StatusBadge;
