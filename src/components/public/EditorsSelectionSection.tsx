import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Award } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { ArticlePreview } from '@/types';
import { formatDate, formatReadingTime } from '@/lib/utils';

interface EditorsSelectionSectionProps {
  articles: ArticlePreview[];
}

export const EditorsSelectionSection: React.FC<EditorsSelectionSectionProps> = ({ articles }) => {
  // Present the top 3 curated long-form investigative pieces
  const curatedArticles = articles.slice(0, 3);

  return (
    <section aria-label="Editor's Selection" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2.5 border-b-2 border-ink-high">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-brand-gold shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink-high tracking-tight">
              Editor&apos;s Curated Long-Form
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted font-sans pl-6">
            In-depth narrative investigations hand-selected for architectural and strategic depth.
          </p>
        </div>

        <div className="pl-6 sm:pl-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-high bg-brand-yellow px-2 py-0.5 rounded-xs font-sans">
            Deep Dives
          </span>
        </div>
      </div>

      {/* Balanced 3-Column Curated Grid (Equal Heights, Zero Unwanted Gaps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {curatedArticles.map((article, index) => {
          const isPrimary = index === 0;

          return (
            <article
              key={article.id}
              className="bg-editorial-pure rounded-xs border border-editorial-hairline overflow-hidden group transition-editorial hover:shadow-xs flex flex-col justify-between h-full"
            >
              <div>
                {/* Visual Cover Container */}
                <div className="relative aspect-[16/10] bg-editorial-stone overflow-hidden">
                  <Link href={`/article/${article.slug}`} className="relative block h-full w-full">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-editorial duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <CategoryBadge category={article.category} size="sm" />
                  </div>
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs font-sans ${
                        isPrimary
                          ? 'bg-brand-yellow text-ink-high'
                          : 'bg-editorial-sand/90 text-brand-gold border border-editorial-hairline'
                      }`}
                    >
                      {isPrimary ? "Editor's Pick" : 'Curated Pick'}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-ink-muted font-sans">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-ink-muted" />
                      {formatReadingTime(article.readingTimeMinutes)}
                    </span>
                  </div>

                  <Link href={`/article/${article.slug}`}>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-ink-high group-hover:text-brand-gold transition-editorial leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-ink-body font-sans leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Byline & Read Story Footer */}
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-editorial-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {article.author.avatarUrl && (
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-editorial-sand border border-editorial-hairline shrink-0">
                        <Image
                          src={article.author.avatarUrl}
                          alt={article.author.displayName}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-ink-high font-sans block leading-tight">
                        {article.author.displayName}
                      </span>
                      <span className="text-[10px] text-ink-muted font-sans block truncate max-w-[140px]">
                        {article.author.title}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/article/${article.slug}`}
                    className="text-xs font-bold text-ink-high hover:text-brand-gold transition-editorial inline-flex items-center gap-1 font-sans uppercase tracking-wider shrink-0"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
