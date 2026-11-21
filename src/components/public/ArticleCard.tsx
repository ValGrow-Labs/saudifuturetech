import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { cn, formatDate, formatReadingTime } from '@/lib/utils';
import { ArticlePreview } from '@/types';
import { CategoryBadge } from './CategoryBadge';

interface ArticleCardProps {
  article: ArticlePreview;
  priority?: boolean;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  priority = false,
  className,
}) => {
  return (
    <article
      className={cn(
        'group flex flex-col justify-between bg-white rounded-lg border border-[#E0E7E3] overflow-hidden transition-all hover:border-[#0B6E4F]/50 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div>
        {/* Thumbnail Image Container */}
        <div className="relative block w-full aspect-[16/10] overflow-hidden bg-[#F1F5F2]">
          <Link
            href={`/article/${article.slug}`}
            className="relative block w-full h-full"
            tabIndex={-1}
          >
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-editorial duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="absolute top-2.5 left-2.5 z-10">
            <CategoryBadge category={article.category} size="sm" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-ink-high group-hover:text-[#0B6E4F] transition-colors leading-snug mb-2.5">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-ink-body leading-relaxed line-clamp-3 mb-4 font-sans">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Card Footer / Metadata Byline */}
      <div className="px-5 pb-4 pt-3 border-t border-[#E0E7E3] flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          {article.author.avatarUrl && (
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-editorial-sand border border-[#E0E7E3] shrink-0">
              <Image
                src={article.author.avatarUrl}
                alt={article.author.displayName}
                fill
                sizes="20px"
                className="object-cover"
              />
            </div>
          )}
          <span className="font-semibold text-ink-high truncate max-w-[120px] font-sans text-[11px]">
            {article.author.displayName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] font-sans">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="text-editorial-hairline">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-ink-muted" />
            {formatReadingTime(article.readingTimeMinutes)}
          </span>
        </div>
      </div>
    </article>
  );
};
