import React from 'react';
import { cn } from '@/lib/utils';
import { StatItem } from '@/types';

interface StatCardProps extends Partial<Omit<StatItem, 'value' | 'label'>> {
  label: string;
  value: string | number;
  /** Ignored — kept for API compatibility. */
  icon?: React.ReactNode;
  className?: string;
}

/** A figure with a label: big serif number, mono label, quiet change note. No box. */
export const StatCard: React.FC<StatCardProps> = ({ label, value, change, trend, description, className }) => (
  <div className={cn('border-t border-ink pt-3', className)}>
    <p className="meta">{label}</p>
    <div className="mt-2 flex items-baseline gap-3">
      <span className="font-serif text-[2.25rem] leading-none text-ink tabular">{value}</span>
      {change && (
        <span
          className={cn(
            'font-sans text-[0.71875rem] tabular',
            trend === 'up' ? 'text-moss' : trend === 'down' ? 'text-clay' : 'text-ink-3'
          )}
        >
          {trend === 'up' ? '↑ ' : trend === 'down' ? '↓ ' : ''}
          {change}
        </span>
      )}
    </div>
    {description && <p className="mt-2 text-[0.8125rem] text-ink-3 leading-snug">{description}</p>}
  </div>
);

export default StatCard;
