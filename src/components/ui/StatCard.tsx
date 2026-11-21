import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from '@/types';

interface StatCardProps extends StatItem {
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 rounded-none bg-editorial-pure border border-editorial-hairline transition-editorial hover:border-ink-high/30 shadow-xs',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink-muted font-sans">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-none bg-editorial-sand flex items-center justify-center text-ink-high border border-editorial-hairline">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-black text-ink-high tracking-tight font-serif">
          {value}
        </span>

        <div
          className={cn(
            'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-none font-sans',
            trend === 'up' && 'text-emerald-800 bg-emerald-50 border border-emerald-200',
            trend === 'down' && 'text-rose-800 bg-rose-50 border border-rose-200',
            trend === 'neutral' && 'text-ink-body bg-editorial-sand border border-editorial-hairline'
          )}
        >
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
          {change}
        </div>
      </div>

      <p className="text-xs text-ink-muted mt-2.5 truncate font-sans">{description}</p>
    </div>
  );
};
