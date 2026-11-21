import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  accentColor?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All',
  accentColor = '#141517',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2.5 mb-6 border-b-2 border-ink-high',
        className
      )}
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink-high tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-ink-muted font-sans mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-ink-high transition-editorial gap-1 font-sans shrink-0"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};
