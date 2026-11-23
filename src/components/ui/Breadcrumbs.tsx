import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Mono breadcrumb trail with "/" separators. A leading "Home" is added if the caller left it out. */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const first = items[0];
  const trail: BreadcrumbItem[] =
    first && (first.href === '/' || first.label.toLowerCase() === 'home') ? items : [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className={cn('meta min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((item, idx) => {
          const isLast = idx === trail.length - 1 || item.current;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2 min-w-0">
              {idx > 0 && (
                <span aria-hidden className="text-ink-4">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span className="text-ink truncate max-w-[16rem]" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="truncate max-w-[12rem] hover:text-ink transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
