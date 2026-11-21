import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { ArticlePreview } from '@/types';
import { CategoryBadge } from './CategoryBadge';

interface FeaturedArticleCardProps {
  article: ArticlePreview;
}

export const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article }) => {
  return (
    <article className="group relative bg-editorial-pure rounded-xs border border-editorial-hairline overflow-hidden transition-editorial hover:shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Editorial Visual (7 cols) */}
        <div className="relative lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[440px] bg-editorial-stone overflow-hidden">
          <Link href={`/article/${article.slug}`} className="relative block h-full w-full">
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-editorial duration-700 group-hover:scale-[1.02]"
            />
          </Link>

          {article.coverImageCaption && (
            <div className="absolute bottom-2.5 left-3 right-3 text-[11px] text-editorial-pure bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-xs truncate hidden sm:block font-sans">
              {article.coverImageCaption}
            </div>
          )}
        </div>

        {/* Editorial Text Composition (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-editorial-hairline bg-editorial-pure">
          <div>
            {/* Top Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <CategoryBadge category={article.category} size="md" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-high bg-brand-yellow px-2 py-0.5 rounded-xs font-sans">
                Lead Story
              </span>
              <span className="text-xs text-ink-muted flex items-center gap-1 ml-auto font-sans">
                <Clock className="w-3.5 h-3.5" />
                {formatReadingTime(article.readingTimeMinutes)}
              </span>
            </div>

            {/* Serif Display Headline */}
            <Link href={`/article/${article.slug}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-ink-high group-hover:text-brand-gold transition-editorial leading-[1.18] mb-4">
                {article.title}
              </h2>
            </Link>

            {/* Standfirst / Excerpt */}
            <p className="text-sm sm:text-base text-ink-body font-sans leading-relaxed mb-6">
              {article.excerpt}
            </p>
          </div>

          {/* Byline & Read Story Action */}
          <div className="pt-6 border-t border-editorial-hairline flex items-center justify-between">
            <div className="flex items-center gap-3">
              {article.author.avatarUrl && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-editorial-sand border border-editorial-hairline shrink-0">
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.displayName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-high font-sans">
                  {article.author.displayName}
                </p>
                <p className="text-[11px] text-ink-muted font-sans">
                  {article.author.title} • {formatDate(article.publishedAt)}
                </p>
              </div>
            </div>

            <Link
              href={`/article/${article.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold font-sans uppercase tracking-wider text-ink-high group-hover:text-brand-gold transition-editorial shrink-0"
            >
              <span>Read Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
