import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatDate, formatReadingTime } from '@/lib/utils';
import { ArticlePreview } from '@/types';
import { CategoryBadge } from './CategoryBadge';

interface ArticleCardProps {
  article: ArticlePreview;
  priority?: boolean;
  className?: string;
  /** Hide the image for text-only lists. */
  showImage?: boolean;
  /** Headline size. */
  size?: 'sm' | 'md' | 'lg';
}

/** A story teaser. No box, no shadow: image, label, headline, standfirst, byline. */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  priority = false,
  className,
  showImage = true,
  size = 'md',
}) => {
  const headline = {
    sm: 'text-[1.1875rem] leading-snug',
    md: 'text-[1.375rem] leading-[1.2]',
    lg: 'text-display-sm',
  }[size];

  return (
    <article className={cn('group flex flex-col', className)}>
      {showImage && article.coverImageUrl && (
        <Link
          href={`/article/${article.slug}`}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[3/2] overflow-hidden rounded-md bg-paper-band mb-4"
        >
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover img-warm transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <CategoryBadge category={article.category} />
      <h3 className={cn('mt-2 font-serif text-ink', headline)}>
        <Link href={`/article/${article.slug}`} className="headline-link">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && (
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-3">{article.excerpt}</p>
      )}
      <p className="meta mt-3">
        {article.author?.displayName && <span className="text-ink-2">{article.author.displayName}</span>}
        {article.author?.displayName && ' · '}
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        {' · '}
        {formatReadingTime(article.readingTimeMinutes)}
      </p>
    </article>
  );
};

export default ArticleCard;
