import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

/**
 * A status word in mono — not a pill. `accent` is clay (urgent / highlighted),
 * `subtle` is moss (open / confirmed), `outline` adds a hairline underline.
 */
export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', size = 'sm', children, ...props }) => {
  const variants = {
    default: 'text-ink-3',
    accent: 'text-clay',
    outline: 'text-ink-2 border-b border-rule',
    subtle: 'text-moss',
  };

  const sizes = {
    sm: 'text-[0.6875rem]',
    md: 'text-xs',
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-sans tabular leading-none', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
