import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Small mono label above the title. */
  kicker?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  /** @deprecated colour comes from the system now */
  accentColor?: string;
  className?: string;
  as?: 'h2' | 'h3';
}

/**
 * Section opener: a heavy ink rule, then a serif title with an optional
 * standfirst on the left and a quiet "more" link on the right.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  kicker,
  viewAllHref,
  viewAllLabel = 'See all',
  className,
  as: Tag = 'h2',
}) => (
  <div className={cn('rule-dot-t pt-4 mb-8', className)}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {kicker && <p className="kicker mb-2">{kicker}</p>}
        <Tag className="font-serif text-display-sm md:text-display-md text-ink">{title}</Tag>
        {subtitle && <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="group shrink-0 inline-flex items-center gap-2 text-sm text-ink">
          <span className="link-rule">{viewAllLabel}</span>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  </div>
);

export default SectionHeading;
