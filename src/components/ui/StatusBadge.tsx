import React from 'react';
import { cn } from '@/lib/utils';
import { ArticleStatus } from '@/types';

interface StatusBadgeProps {
  status: ArticleStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config: Record<ArticleStatus, { label: string; styles: string; dot: string }> = {
    DRAFT: {
      label: 'Draft',
      styles: 'bg-editorial-sand text-ink-body border-editorial-hairline',
      dot: 'bg-ink-muted',
    },
    IN_REVIEW: {
      label: 'In Review',
      styles: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500 animate-pulse',
    },
    SCHEDULED: {
      label: 'Scheduled',
      styles: 'bg-sky-50 text-sky-800 border-sky-300',
      dot: 'bg-sky-500',
    },
    PUBLISHED: {
      label: 'Published',
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500',
    },
    ARCHIVED: {
      label: 'Archived',
      styles: 'bg-stone-100 text-stone-600 border-stone-300',
      dot: 'bg-stone-400',
    },
  };

  const item = config[status] || config.DRAFT;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-semibold tracking-wide border font-sans uppercase',
        item.styles,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', item.dot)} aria-hidden="true" />
      {item.label}
    </span>
  );
};
