import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CategoryItem } from '@/types';

interface CategoryBadgeProps {
  category: Pick<CategoryItem, 'name' | 'slug' | 'color'>;
  clickable?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  clickable = true,
  size = 'sm',
  className,
}) => {
  const content = (
    <span
      className={cn(
        'inline-flex items-center font-bold tracking-wider uppercase font-sans transition-editorial',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1',
        'bg-editorial-sand text-ink-high border border-editorial-hairline hover:border-ink-high hover:bg-editorial-stone rounded-xs',
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: category.color || '#D49A3D' }}
        aria-hidden="true"
      />
      {category.name}
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/category/${category.slug}`} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export const CategoryLabel = CategoryBadge;
