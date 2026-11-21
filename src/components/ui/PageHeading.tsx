import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeadingProps {
  title: string;
  description?: string;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  description,
  badge,
  size = 'md',
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-editorial-hairline',
        className
      )}
    >
      <div className="space-y-1.5">
        {badge && (
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-muted font-sans">
              {badge}
            </span>
          </div>
        )}
        <h1
          className={cn(
            'font-black text-ink-high tracking-tight font-serif',
            size === 'lg'
              ? 'text-3xl sm:text-4xl'
              : size === 'sm'
              ? 'text-xl sm:text-2xl'
              : 'text-2xl sm:text-3xl'
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-ink-body font-serif italic max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
};
