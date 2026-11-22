import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Optional; most empty states read better without one. */
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/** A short serif line, a sentence of explanation, and a next step. No box, no illustration. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}) => {
  const action = actionLabel ? (
    actionHref ? (
      <Link href={actionHref} className="group inline-flex items-center gap-2 text-sm text-ink">
        <span className="link-rule">{actionLabel}</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </Link>
    ) : (
      <button type="button" onClick={onAction} className="group inline-flex items-center gap-2 text-sm text-ink">
        <span className="link-rule">{actionLabel}</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </button>
    )
  ) : null;

  return (
    <div className={cn('border-y border-rule py-12 md:py-16', className)}>
      <div className="max-w-xl">
        {icon && <div className="mb-4 text-ink-4">{icon}</div>}
        <p className="font-serif text-display-sm text-ink">{title}</p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
};
