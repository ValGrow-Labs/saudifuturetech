import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-bold tracking-widest uppercase rounded-sm font-heading transition-editorial';

  const variants = {
    default: 'bg-brand-surface text-sft-text-body border border-sft',
    accent: 'bg-brand-yellow text-brand-graphite shadow-sm',
    outline: 'bg-transparent border border-sft text-brand-cloud',
    subtle: 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
