'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import { ArticleDetail } from '@/types';
import { CategoryWithTags } from '@/lib/constants';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { formatDate, formatReadingTime } from '@/lib/utils';

interface LatestArticlesClientProps {
  initialArticles: ArticleDetail[];
  categories: CategoryWithTags[];
}

export const LatestArticlesClient: React.FC<LatestArticlesClientProps> = ({
  initialArticles,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredArticles = initialArticles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' || article.category.slug === selectedCategory;
    const matchesSearch =
      !searchFilter.trim() ||
      article.title.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      article.excerpt.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      article.author.displayName.toLowerCase().includes(searchFilter.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Filter and Search Controls Bar */}
      <div className="bg-[#F1F5F2] p-4 sm:p-5 rounded-lg border border-[#E2E8E4] space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] font-sans flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#111827]" />
              Filter:
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-full font-sans font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#E8F5EF] border border-[#E2E8E4]'
              }`}
            >
              All Stories ({initialArticles.length})
            </button>

            {categories.map((cat) => {
              const count = initialArticles.filter((a) => a.category.slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-xs px-3 py-1.5 rounded-full font-sans font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-[#0B6E4F] text-white shadow-xs'
                      : 'bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#E8F5EF] border border-[#E2E8E4]'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: selectedCategory === cat.slug ? '#FFFFFF' : cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Inline Quick Search Field */}
          <div className="relative shrink-0 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search in stream..."
              className="w-full bg-white border border-[#E2E8E4] text-[#111827] text-xs rounded-md pl-8 pr-3 py-2 placeholder:text-[#4B5563] focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] focus:border-[#0B6E4F] font-sans"
            />
          </div>
        </div>
      </div>

      {/* Stream Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#4B5563] font-sans border-b border-[#E2E8E4] pb-3">
        <span>
          Showing <span className="text-[#111827] font-semibold">{filteredArticles.length}</span> reports
          {selectedCategory !== 'all' && (
            <span> in <span className="text-[#111827] font-semibold">{categories.find((c) => c.slug === selectedCategory)?.name}</span></span>
          )}
        </span>
        <span className="font-sans uppercase tracking-wider text-[11px] text-[#C9A227] font-bold">
          Chronological Feed
        </span>
      </div>

      {/* Articles Stream */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-[#E2E8E4] space-y-3">
          <p className="text-base text-[#111827] font-serif font-bold">
            No matching dispatches found
          </p>
          <p className="text-xs text-[#4B5563] max-w-sm mx-auto font-sans">
            No articles match the current filter criteria. Try resetting your filter to view all coverage.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchFilter('');
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B6E4F] text-white rounded-md text-xs font-bold font-sans uppercase tracking-wider hover:bg-[#08533C] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-lg border border-[#E2E8E4] overflow-hidden hover:border-[#0B6E4F]/50 hover:shadow-md transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Thumbnail Visual */}
                <div className="relative aspect-[16/9] md:aspect-auto md:col-span-4 lg:col-span-3 bg-[#F1F5F2] overflow-hidden min-h-[180px]">
                  <Link href={`/article/${article.slug}`} className="block h-full w-full">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-2.5 left-2.5">
                    <CategoryBadge category={article.category} size="sm" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 sm:p-6 md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#4B5563] font-sans">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#C9A227]" />
                        {formatDate(article.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatReadingTime(article.readingTimeMinutes)}
                      </span>
                      {article.isFeatured && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] uppercase font-bold text-[#C9A227] tracking-wider font-sans">
                            Lead Feature
                          </span>
                        </>
                      )}
                      {article.isEditorsPick && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] uppercase font-bold text-[#0B6E4F] tracking-wider font-sans">
                            Editor’s Choice
                          </span>
                        </>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827] group-hover:text-[#0B6E4F] transition-colors leading-snug">
                      <Link href={`/article/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#4B5563] font-sans leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8E4] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      {article.author.avatarUrl && (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#F1F5F2] border border-[#E2E8E4] shrink-0">
                          <Image
                            src={article.author.avatarUrl}
                            alt={article.author.displayName}
                            fill
                            sizes="24px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="font-semibold text-[#111827] font-sans text-[11px]">
                        {article.author.displayName}
                      </span>
                      <span className="text-[#4B5563] text-[11px] hidden sm:inline font-sans">
                        • {article.author.title}
                      </span>
                    </div>

                    <Link
                      href={`/article/${article.slug}`}
                      className="text-xs font-bold text-[#0B6E4F] hover:text-[#08533C] transition-colors inline-flex items-center gap-1 font-sans uppercase tracking-wider"
                    >
                      <span>Read Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
