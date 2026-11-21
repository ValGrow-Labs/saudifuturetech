import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-editorial-hairline rounded-none bg-editorial-pure shadow-xs',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-editorial-sand flex items-center justify-center text-ink-muted mb-4 border border-editorial-hairline">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold text-ink-high font-serif mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-ink-muted max-w-sm mb-6 font-sans">{description}</p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="secondary" size="sm">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
