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

/** Section label set as a mono kicker. No pill, no dot — just the word, in clay. */
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, clickable = true, size = 'sm', className }) => {
  const classes = cn('kicker inline-block', size === 'md' && '!text-xs', clickable && 'hover:text-clay-dark', className);
  if (!clickable) return <span className={classes}>{category.name}</span>;
  return (
    <Link href={`/category/${category.slug}`} className={classes}>
      {category.name}
    </Link>
  );
};

export const CategoryLabel = CategoryBadge;
export default CategoryBadge;
