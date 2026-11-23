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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#E2E8E4] dark:border-[#1E3A4C]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] font-sans">
              Editorial Investigations
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111827] dark:text-[#FAF9F6] tracking-tight">
            Editor&apos;s Curated Long-Form
          </h2>
          <p className="text-sm text-[#4B5563] dark:text-[#94A3B8] font-sans">
            In-depth narrative investigations hand-selected for architectural and strategic depth.
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B1C] dark:text-[#F4C542] bg-[#FDF8EC] dark:bg-[#C9A227]/20 border border-[#C9A227]/40 px-3 py-1 rounded-full font-sans">
            Deep Dives
          </span>
        </div>
      </div>

      {/* Balanced 3-Column Curated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {curatedArticles.map((article, index) => {
          const isPrimary = index === 0;

          return (
            <article
              key={article.id}
              className="bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] overflow-hidden group hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full"
            >
              <div>
                {/* Visual Cover Container */}
                <div className="relative aspect-[16/10] bg-[#F1F5F2] dark:bg-[#132B3D] overflow-hidden">
                  <Link href={`/article/${article.slug}`} className="relative block h-full w-full">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute top-3 left-3 z-10">
                    <CategoryBadge category={article.category} size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans shadow-xs ${
                        isPrimary
                          ? 'bg-[#0B6E4F] dark:bg-[#10B981] text-white'
                          : 'bg-white/95 dark:bg-[#102433]/95 text-[#111827] dark:text-[#FAF9F6] border border-[#E2E8E4] dark:border-[#1E3A4C]'
                      }`}
                    >
                      {isPrimary ? "Editor's Pick" : 'Curated Pick'}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#4B5563] dark:text-[#94A3B8] font-sans">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#94A3B8]" />
                      {formatReadingTime(article.readingTimeMinutes)}
                    </span>
                  </div>

                  <Link href={`/article/${article.slug}`}>
                    <h3 className="text-xl font-heading font-black text-[#111827] dark:text-[#FAF9F6] group-hover:text-[#0B6E4F] dark:group-hover:text-[#19B5A3] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-[#374151] dark:text-[#CBD5E1] font-sans leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Byline & Read Story Footer */}
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {article.author.avatarUrl && (
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] shrink-0">
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
                      <span className="text-xs font-bold text-[#111827] dark:text-[#FAF9F6] font-sans block leading-tight">
                        {article.author.displayName}
                      </span>
                      <span className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-sans block truncate max-w-[140px]">
                        {article.author.title}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/article/${article.slug}`}
                    className="text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3] hover:text-[#08533C] dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 font-sans uppercase tracking-wider shrink-0"
                  >
                    <span>Read Briefing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
