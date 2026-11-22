import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeadingProps {
  title: string;
  description?: string;
  /** Small mono label above the title. */
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

/** Admin page header: kicker, serif title, one-line description, actions on the right. */
export const PageHeading: React.FC<PageHeadingProps> = ({ title, description, badge, size = 'md', children, className }) => (
  <div className={cn('flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-rule', className)}>
    <div className="min-w-0">
      {badge && <p className="kicker mb-1.5">{badge}</p>}
      <h1
        className={cn(
          'font-serif text-ink',
          size === 'lg' ? 'text-display-md' : size === 'sm' ? 'text-[1.5rem] leading-tight' : 'text-display-sm'
        )}
      >
        {title}
      </h1>
      {description && <p className="mt-1.5 text-sm text-ink-3 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
  </div>
);

export default PageHeading;
