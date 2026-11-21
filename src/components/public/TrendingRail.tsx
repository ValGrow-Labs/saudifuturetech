import React from 'react';
import Link from 'next/link';
import { SAMPLE_TRENDING_ITEMS } from '@/lib/constants';
import { ArticleDetail } from '@/types';
import { formatReadingTime } from '@/lib/utils';

interface TrendingRailProps {
  articles?: ArticleDetail[];
}

export const TrendingRail: React.FC<TrendingRailProps> = ({ articles }) => {
  const items =
    articles && articles.length > 0
      ? articles.slice(0, 5).map((art, idx) => ({
          rank: String(idx + 1).padStart(2, '0'),
          title: art.title,
          category: art.category.name,
          readingTime: formatReadingTime(art.readingTimeMinutes),
          slug: art.slug,
        }))
      : SAMPLE_TRENDING_ITEMS.map((item) => ({
          ...item,
          slug: `trending-${item.rank}`,
        }));

  return (
    <div className="bg-white rounded-lg border border-[#E0E7E3] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-ink-high">
        <h3 className="text-base font-serif font-black text-ink-high">
          Most Read This Week
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted font-sans">
          Top Stories
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.rank}
            className="group flex items-start gap-3.5 pb-4 border-b border-[#E0E7E3] last:border-b-0 last:pb-0"
          >
            <span className="text-2xl sm:text-3xl font-serif font-bold text-ink-muted/30 group-hover:text-[#0B6E4F] transition-colors shrink-0 w-8">
              {item.rank}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-ink-muted font-sans">
                <span className="font-bold uppercase tracking-wider text-[#C9A227]">
                  {item.category}
                </span>
                <span>•</span>
                <span>{item.readingTime}</span>
              </div>

              <Link
                href={`/article/${item.slug}`}
                className="text-sm font-serif font-bold text-ink-high group-hover:text-[#C9A227] transition-editorial leading-snug line-clamp-2 block"
              >
                {item.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
