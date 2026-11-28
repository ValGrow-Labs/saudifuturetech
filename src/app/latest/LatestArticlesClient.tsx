'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleDetail } from '@/types';
import { CategoryWithTags } from '@/lib/constants';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { cn, formatDate, formatReadingTime } from '@/lib/utils';

interface LatestArticlesClientProps {
  initialArticles: ArticleDetail[];
  categories: CategoryWithTags[];
}

export const LatestArticlesClient: React.FC<LatestArticlesClientProps> = ({ initialArticles, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredArticles = initialArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category.slug === selectedCategory;
    const matchesSearch =
      !searchFilter.trim() ||
      article.title.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      article.excerpt.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      article.author.displayName.toLowerCase().includes(searchFilter.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const selectedName = categories.find((c) => c.slug === selectedCategory)?.name;

  const tab = (active: boolean) =>
    cn(
      'shrink-0 -mb-px border-b-2 py-3 text-sm transition-colors cursor-pointer whitespace-nowrap',
      active ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink',
    );

  return (
    <div>
      {/* Filters: section tabs on the left, a text filter on the right */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-rule">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none]">
          <div role="tablist" aria-label="Filter by section" className="flex gap-6">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              className={tab(selectedCategory === 'all')}
            >
              All <span className="font-sans text-[0.75rem] text-ink-4 tabular">{initialArticles.length}</span>
            </button>
            {categories.map((cat) => {
              const count = initialArticles.filter((a) => a.category.slug === cat.slug).length;
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={tab(active)}
                >
                  {cat.name} <span className="font-sans text-[0.75rem] text-ink-4 tabular">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="relative mb-3 flex items-center gap-2 rule-dot-b focus-within:border-clay lg:w-72 shrink-0 transition-colors">
          <span className="sr-only">Filter by headline, summary or writer</span>
          <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4 text-ink-3" fill="none" stroke="currentColor" strokeWidth={1.25}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by headline or writer"
            className="w-full bg-transparent py-2 px-1.5 text-[0.9375rem] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-clay/70 rounded-xs"
          />
        </label>
      </div>

      <p className="meta mt-4" aria-live="polite">
        {filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'}
        {selectedName && <> in {selectedName}</>}
        {searchFilter.trim() && <> matching “{searchFilter.trim()}”</>} · newest first
      </p>

      {filteredArticles.length === 0 ? (
        <div className="py-16 max-w-xl">
          <p className="font-serif text-display-sm text-ink">Nothing matches that filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchFilter('');
            }}
            className="group mt-4 inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
          >
            <span className="link-rule">Show every story</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      ) : (
        <ul className="mt-2">
          {filteredArticles.map((article) => (
            <li key={article.id} className="group border-b border-rule">
              <article className="grid grid-cols-[1fr_6.5rem] sm:grid-cols-[6.5rem_1fr_10rem] lg:grid-cols-[8rem_1fr_13rem] gap-x-6 lg:gap-x-10 gap-y-2 py-7">
                <div className="hidden sm:block pt-1">
                  <time dateTime={article.publishedAt} className="meta block">
                    {formatDate(article.publishedAt)}
                  </time>
                  {(article.isFeatured || article.isEditorsPick) && (
                    <p className="meta mt-1 text-ink-4">{article.isFeatured ? 'Lead story' : 'Editors’ pick'}</p>
                  )}
                </div>
                <div className="min-w-0">
                  <CategoryBadge category={article.category} />
                  <h2 className="mt-1.5 font-serif text-[1.3125rem] md:text-[1.5rem] leading-snug text-ink">
                    <Link href={`/article/${article.slug}`} className="headline-link">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-2">{article.excerpt}</p>
                  <p className="meta mt-3">
                    <span className="text-ink-2">{article.author.displayName}</span>
                    <span className="sm:hidden"> · {formatDate(article.publishedAt)}</span> ·{' '}
                    {formatReadingTime(article.readingTimeMinutes)}
                  </p>
                </div>
                {article.coverImageUrl && (
                  <Link
                    href={`/article/${article.slug}`}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block aspect-square sm:aspect-[4/3] overflow-hidden rounded-md bg-paper-band self-start"
                  >
                    <Image
                      src={article.coverImageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 104px, 208px"
                      className="object-cover img-warm"
                    />
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
