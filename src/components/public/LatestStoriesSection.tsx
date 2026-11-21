import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { CategoryBadge } from './CategoryBadge';
import { ArticleCard } from './ArticleCard';
import { ArticlePreview } from '@/types';
import { formatDate, formatReadingTime } from '@/lib/utils';

interface LatestStoriesSectionProps {
  articles: ArticlePreview[];
}

export const LatestStoriesSection: React.FC<LatestStoriesSectionProps> = ({ articles }) => {
  const spotlightStory = articles[0];
  const gridStories = articles.slice(1, 3);
  const wireStory = articles[3];

  return (
    <section aria-label="Latest Technology Stories" className="space-y-6">
      <SectionHeading
        title="Recent Reporting & Essays"
        subtitle="Chronological reports and technical investigations across Saudi Arabia's digital landscape"
        viewAllHref="/latest"
        viewAllLabel="View All Stories"
      />

      {/* 1. Primary Spotlight Story (Asymmetrical Horizontal Composition) */}
      {spotlightStory && (
        <article className="group bg-white rounded-lg border border-[#E0E7E3] p-5 sm:p-6 transition-editorial hover:shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 relative aspect-[16/10] overflow-hidden bg-[#F1F5F2] rounded-md">
              <Link href={`/article/${spotlightStory.slug}`} className="relative block h-full w-full">
                <Image
                  src={spotlightStory.coverImageUrl}
                  alt={spotlightStory.coverImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 35vw"
                  className="object-cover transition-editorial duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="absolute top-2.5 left-2.5 z-10">
                <CategoryBadge category={spotlightStory.category} size="sm" />
              </div>
            </div>

            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-ink-muted font-sans">
                <span className="font-semibold text-[#C9A227] uppercase tracking-wider">
                  Featured Story
                </span>
                <span>•</span>
                <span>{formatDate(spotlightStory.publishedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-ink-muted" />
                  {formatReadingTime(spotlightStory.readingTimeMinutes)}
                </span>
              </div>

              <Link href={`/article/${spotlightStory.slug}`}>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink-high group-hover:text-[#0B6E4F] transition-colors leading-snug">
                  {spotlightStory.title}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-ink-body leading-relaxed line-clamp-2 font-sans">
                {spotlightStory.excerpt}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-editorial-hairline text-xs">
                <div className="flex items-center gap-2">
                  {spotlightStory.author.avatarUrl && (
                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-editorial-sand border border-editorial-hairline shrink-0">
                      <Image
                        src={spotlightStory.author.avatarUrl}
                        alt={spotlightStory.author.displayName}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-semibold text-ink-high text-[11px] font-sans">
                    {spotlightStory.author.displayName}
                  </span>
                  <span className="text-ink-muted text-[11px] hidden sm:inline font-sans">
                    • {spotlightStory.author.title}
                  </span>
                </div>

                <Link
                  href={`/article/${spotlightStory.slug}`}
                  className="text-xs font-bold text-[#0B6E4F] hover:text-[#08573E] transition-colors inline-flex items-center gap-1 font-sans uppercase tracking-wider"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* 2. Side-by-Side Varied Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {gridStories.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* 3. The Wire / Rapid Field Dispatch Strip */}
      {wireStory && (
        <div className="bg-[#F1F5F2] rounded-lg border border-[#E0E7E3] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-editorial">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-high bg-[#C9A227]/20 text-[#8C6D0F] border border-[#C9A227]/30 px-2 py-0.5 rounded-xs font-sans shrink-0">
              Field Wire
            </span>
            <div>
              <Link
                href={`/article/${wireStory.slug}`}
                className="text-sm font-serif font-bold text-[#0B6E4F] hover:text-[#08573E] transition-colors line-clamp-1 block"
              >
                {wireStory.title}
              </Link>
              <div className="flex items-center gap-2 text-[11px] text-ink-muted font-sans mt-0.5">
                <span>{wireStory.category.name}</span>
                <span>•</span>
                <span>{formatDate(wireStory.publishedAt)}</span>
                <span>•</span>
                <span>By {wireStory.author.displayName}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/article/${wireStory.slug}`}
            className="text-xs font-bold text-[#0B6E4F] hover:text-[#08573E] font-sans shrink-0 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Read Wire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
};
