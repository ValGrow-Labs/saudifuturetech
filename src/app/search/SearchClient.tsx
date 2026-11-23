'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UnifiedSearchResponse } from '@/lib/founder-intelligence';
import { formatReadingTime, cn } from '@/lib/utils';
import { stageLabel, businessModelLabel, investorTypeLabel, opportunityTypeLabel, deadlineInfo } from '@/lib/labels';

const POPULAR_SEARCH_TAGS = [
  'NTDP MVPLab',
  'Tamara',
  'STV',
  'Impact46',
  'Mozn AI',
  'SAMA Sandbox',
  'Series A',
  'FinTech',
  'Debt',
  'Clean Energy',
];

type Category = 'all' | 'startups' | 'investors' | 'opportunities' | 'articles';

const TABS: { value: Category; label: string; noun: [string, string] }[] = [
  { value: 'all', label: 'All', noun: ['result', 'results'] },
  { value: 'startups', label: 'Startups', noun: ['startup', 'startups'] },
  { value: 'investors', label: 'Investors', noun: ['investor', 'investors'] },
  { value: 'opportunities', label: 'Opportunities', noun: ['opportunity', 'opportunities'] },
  { value: 'articles', label: 'Reporting', noun: ['article', 'articles'] },
];

interface SearchClientProps {
  initialData: UnifiedSearchResponse;
}

const shortDate = (iso?: string | Date | null) =>
  iso
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
    : '';

export const SearchClient: React.FC<SearchClientProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get('q') || '';
  const urlCategory = (searchParams.get('category') || 'all') as Category;
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(urlQuery || initialData.query || '');
  const [activeCategory, setActiveCategory] = useState<Category>(urlCategory || initialData.category || 'all');
  const [currentPage, setCurrentPage] = useState<number>(urlPage || initialData.page || 1);

  const [data, setData] = useState<UnifiedSearchResponse>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with URL if user navigates back/forward
  useEffect(() => {
    setQuery(urlQuery);
    setActiveCategory(urlCategory);
    setCurrentPage(urlPage);
  }, [urlQuery, urlCategory, urlPage]);

  // Push URL changes
  const updateUrl = useCallback(
    (newQuery: string, newCat: string, newPage: number) => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set('q', newQuery.trim());
      if (newCat && newCat !== 'all') params.set('category', newCat);
      if (newPage > 1) params.set('page', newPage.toString());

      const qs = params.toString();
      const target = `/search${qs ? `?${qs}` : ''}`;
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    },
    [router]
  );

  // Execute Search API query
  const executeSearch = useCallback(async (targetQuery: string, targetCat: string, targetPage: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      if (targetQuery.trim()) params.set('q', targetQuery.trim());
      if (targetCat && targetCat !== 'all') params.set('category', targetCat);
      if (targetPage > 1) params.set('page', targetPage.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Search request failed with status ${res.status}`);
      }
      const json: UnifiedSearchResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('[SearchClient] Error querying unified search API:', err);
      setErrorMessage('We couldn’t load results. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search on query / filter / page changes
  useEffect(() => {
    // Avoid double fetch on initial SSR render if params match initialData
    if (query === initialData.query && activeCategory === initialData.category && currentPage === initialData.page) {
      setData(initialData);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(query, activeCategory, currentPage);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, activeCategory, currentPage, initialData, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl(query, activeCategory, 1);
    executeSearch(query, activeCategory, 1);
  };

  const handleCategorySelect = (cat: Category) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    updateUrl(query, cat, 1);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setActiveCategory('all');
    setCurrentPage(1);
    updateUrl(tag, 'all', 1);
  };

  const handleClear = () => {
    setQuery('');
    setCurrentPage(1);
    updateUrl('', activeCategory, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages) return;
    setCurrentPage(newPage);
    updateUrl(query, activeCategory, newPage);
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const busy = isLoading || isPending;
  const trimmed = query.trim();

  const pagination = (
    <PaginationBar
      currentPage={data.page}
      totalPages={data.totalPages}
      totalCount={data.totalCount}
      limit={data.limit}
      onPageChange={handlePageChange}
    />
  );

  return (
    <div>
      {/* Search field */}
      <form onSubmit={handleFormSubmit} role="search">
        <label htmlFor="search-page-input" className="kicker block mb-3">
          Search reporting, startups, investors and grants
        </label>
        <div className="flex items-end gap-3 sm:gap-4 rule-dot-b focus-within:border-clay transition-colors pb-2">
          <input
            id="search-page-input"
            type="search"
            placeholder="Try “Tamara”, “NTDP” or “Series A”"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
              updateUrl(e.target.value, activeCategory, 1);
            }}
            className="flex-1 min-w-0 bg-transparent font-serif text-2xl md:text-4xl text-ink placeholder:text-ink-4 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 pb-1.5 text-sm text-ink-3 hover:text-ink transition-colors"
            >
              Clear
            </button>
          )}
          <button type="submit" className="btn-primary shrink-0">
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pt-4">
          <span className="meta">Often searched</span>
          {POPULAR_SEARCH_TAGS.map((tag) => {
            const active = query.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                aria-pressed={active}
                className={cn('text-sm link-rule transition-colors', active ? 'text-clay' : 'text-ink-2 hover:text-ink')}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </form>

      {/* Type tabs */}
      <div className="mt-12 flex items-end justify-between gap-6 border-b border-rule">
        <div role="tablist" aria-label="Result type" className="flex gap-x-7 -mb-px overflow-x-auto [scrollbar-width:none] min-w-0">
          {TABS.map((tab) => {
            const active = activeCategory === tab.value;
            const count = data.counts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleCategorySelect(tab.value)}
                className={cn(
                  'py-3 text-[0.9375rem] border-b whitespace-nowrap transition-colors',
                  active ? 'text-ink border-clay' : 'text-ink-3 border-transparent hover:text-ink'
                )}
              >
                {tab.label}
                <span className="ml-1.5 font-sans text-[0.6875rem] tabular text-ink-4">{count}</span>
              </button>
            );
          })}
        </div>
        <span className="meta shrink-0 pb-3.5" aria-live="polite">
          {busy ? 'Searching…' : ''}
        </span>
      </div>

      {/* Error */}
      {errorMessage && (
        <div role="alert" className="mt-8 border-l-2 border-clay pl-4 py-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-[0.9375rem] text-clay">{errorMessage}</p>
          <button
            type="button"
            onClick={() => executeSearch(query, activeCategory, currentPage)}
            className="text-sm text-ink link-rule"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {data.totalCount === 0 && !isLoading && !errorMessage && (
        <div className="mt-10 border-b border-rule pb-14">
          <p className="font-serif text-display-sm text-ink max-w-2xl">
            {trimmed ? <>Nothing matches &ldquo;{trimmed}&rdquo;.</> : 'Type a name, programme or technology to search.'}
          </p>
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-3">
            {trimmed
              ? 'Check the spelling, try a shorter term, or browse the directories directly.'
              : 'Or browse the directories directly.'}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink">
            {[
              { href: '/opportunities', label: 'Open grants and programmes' },
              { href: '/startups', label: 'The startup register' },
              { href: '/funding', label: 'Investors' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-2">
                  <span className="link-rule">{l.label}</span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grouped results */}
      {activeCategory === 'all' && data.totalCount > 0 && (
        <div className={cn('mt-12 space-y-16 transition-opacity', busy && 'opacity-60')}>
          {data.opportunities.length > 0 && (
            <ResultGroup
              title="Opportunities"
              count={data.counts.opportunities}
              shown={data.opportunities.length}
              noun="opportunities"
              onViewAll={() => handleCategorySelect('opportunities')}
            >
              {data.opportunities.map((opp) => (
                <OpportunityRow key={opp.id} opportunity={opp} />
              ))}
            </ResultGroup>
          )}

          {data.startups.length > 0 && (
            <ResultGroup
              title="Startups"
              count={data.counts.startups}
              shown={data.startups.length}
              noun="startups"
              onViewAll={() => handleCategorySelect('startups')}
            >
              {data.startups.map((startup) => (
                <StartupRow key={startup.id} startup={startup} />
              ))}
            </ResultGroup>
          )}

          {data.investors.length > 0 && (
            <ResultGroup
              title="Investors"
              count={data.counts.investors}
              shown={data.investors.length}
              noun="investors"
              onViewAll={() => handleCategorySelect('investors')}
            >
              {data.investors.map((inv) => (
                <InvestorRow key={inv.id} investor={inv} />
              ))}
            </ResultGroup>
          )}

          {data.articles.length > 0 && (
            <ResultGroup
              title="Reporting"
              count={data.counts.articles}
              shown={data.articles.length}
              noun="articles"
              onViewAll={() => handleCategorySelect('articles')}
            >
              {data.articles.map((art) => (
                <ArticleRow key={art.id} article={art} />
              ))}
            </ResultGroup>
          )}
        </div>
      )}

      {/* Single-type views */}
      {activeCategory !== 'all' && data.totalCount > 0 && (
        <div className={cn('mt-8 transition-opacity', busy && 'opacity-60')}>
          <p className="meta mb-3">
            {data.totalCount}{' '}
            {data.totalCount === 1
              ? TABS.find((t) => t.value === activeCategory)!.noun[0]
              : TABS.find((t) => t.value === activeCategory)!.noun[1]}
            {trimmed && <> for &ldquo;{trimmed}&rdquo;</>}
          </p>
          <ul className="rule-dot-t">
            {activeCategory === 'startups' && data.startups.map((s) => <StartupRow key={s.id} startup={s} />)}
            {activeCategory === 'investors' && data.investors.map((i) => <InvestorRow key={i.id} investor={i} />)}
            {activeCategory === 'opportunities' &&
              data.opportunities.map((o) => <OpportunityRow key={o.id} opportunity={o} />)}
            {activeCategory === 'articles' && data.articles.map((a) => <ArticleRow key={a.id} article={a} />)}
          </ul>
          {pagination}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// Groups and rows
// ------------------------------------------------------------------------------

function ResultGroup({
  title,
  count,
  shown,
  noun,
  onViewAll,
  children,
}: {
  title: string;
  count: number;
  shown: number;
  noun: string;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="rule-dot-t pt-4 pb-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-serif text-display-sm text-ink">
          {title}
          <span className="ml-3 font-sans text-sm tabular text-ink-4 align-middle">{count}</span>
        </h2>
        {count > shown && (
          <button type="button" onClick={onViewAll} className="group inline-flex items-center gap-2 text-sm text-ink">
            <span className="link-rule">
              All {count} {noun}
            </span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </button>
        )}
      </div>
      <ul>{children}</ul>
    </section>
  );
}

const rowLink = 'block py-5 -mx-3 px-3 transition-colors hover:bg-paper-sheet/60';

const StartupRow: React.FC<{ startup: any }> = ({ startup }) => (
  <li className="group border-b border-rule">
    <Link href={`/startup/${startup.slug}`} className={cn(rowLink, 'md:grid md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:gap-x-8 md:items-baseline')}>
      <p>
        <span className="font-serif font-bold text-[1.25rem] leading-snug text-ink headline-link">{startup.name}</span>
        {startup.crVerified && (
          <span className="ml-2 font-sans text-[0.65rem] text-moss align-middle" title="Commercial registration confirmed">
            CR ✓
          </span>
        )}
      </p>
      <p className="mt-1 md:mt-0 text-[0.9375rem] leading-snug text-ink-2">{startup.tagline}</p>
      <p className="meta mt-2 md:mt-0 md:text-right md:whitespace-nowrap">
        {startup.hqCity} · {businessModelLabel(startup.businessModel)} ·{' '}
        <span className="text-ink">{stageLabel(startup.stage)}</span>
      </p>
    </Link>
  </li>
);

const InvestorRow: React.FC<{ investor: any }> = ({ investor }) => {
  const portfolio = Array.isArray(investor.portfolioHighlights)
    ? (investor.portfolioHighlights as string[]).slice(0, 3)
    : [];
  const flags = [investor.isCmaAuthorized && 'CMA authorised', investor.isSvcPartner && 'SVC partner'].filter(Boolean);

  return (
    <li className="group border-b border-rule">
      <Link href={`/investor/${investor.slug}`} className={cn(rowLink, 'md:grid md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:gap-x-8 md:items-baseline')}>
        <div>
          <p className="font-serif font-bold text-[1.25rem] leading-snug text-ink headline-link">{investor.name}</p>
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            {[investorTypeLabel(investor.type), investor.hqLocation].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          {investor.checkSizeRange && <p className="text-[0.9375rem] text-ink-2">Cheques: {investor.checkSizeRange}</p>}
          {portfolio.length > 0 && <p className="mt-1 text-[0.8125rem] text-ink-3">Backed {portfolio.join(', ')}</p>}
        </div>
        {flags.length > 0 && <p className="mt-2 md:mt-0 font-sans text-[0.71875rem] text-moss md:text-right">{flags.join(' · ')}</p>}
      </Link>
    </li>
  );
};

const OpportunityRow: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  const closed = Boolean(opportunity.isExpired || opportunity.effectiveStatus === 'CLOSED');
  const d = deadlineInfo(opportunity.deadline, closed ? 'CLOSED' : opportunity.effectiveStatus || opportunity.status);

  return (
    <li className="group border-b border-rule">
      <Link
        href={`/opportunity/${opportunity.slug}`}
        className={cn(rowLink, 'grid gap-x-8 gap-y-2 md:grid-cols-[8.5rem_minmax(0,1fr)_13rem] md:items-baseline')}
      >
        <div className="font-sans tabular text-sm">
          <span className={closed ? 'text-ink-3' : 'text-ink'}>{d.date}</span>
          <span className={cn('block text-[0.71875rem] mt-0.5', d.urgent ? 'text-alert' : 'text-ink-3')}>
            {d.urgent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-alert mr-1.5 align-middle" />}
            {d.note}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-serif font-bold text-[1.25rem] leading-snug text-ink headline-link">{opportunity.title}</p>
          <p className="mt-1 text-sm text-ink-3">
            {[opportunity.organization, opportunity.category && opportunityTypeLabel(opportunity.category)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <p className="text-sm text-ink-2 leading-snug">{opportunity.fundingAmount ?? '—'}</p>
      </Link>
    </li>
  );
};

const ArticleRow: React.FC<{ article: any }> = ({ article }) => (
  <li className="group border-b border-rule">
    <Link href={`/article/${article.slug}`} className={cn(rowLink, 'max-w-4xl')}>
      {article.category?.name && <p className="kicker mb-1.5">{article.category.name}</p>}
      <p className="font-serif font-bold text-[1.375rem] leading-snug text-ink headline-link">{article.title}</p>
      {article.excerpt && (
        <p className="mt-2 max-w-measure text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-2">{article.excerpt}</p>
      )}
      <p className="meta mt-2.5">
        {[article.author?.displayName, shortDate(article.publishedAt), article.readingTime && formatReadingTime(article.readingTime)]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </Link>
  </li>
);

// ------------------------------------------------------------------------------
// Pagination
// ------------------------------------------------------------------------------

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalPages, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="meta">
        Page {currentPage} of {totalPages} · {totalCount} results
      </span>
      <div className="flex items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-ink hover:text-clay disabled:text-ink-4 disabled:pointer-events-none transition-colors"
        >
          ← Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={currentPage === p ? 'page' : undefined}
            className={cn(
              'min-w-[2rem] px-2 py-1 font-sans tabular border-b transition-colors',
              currentPage === p ? 'text-ink border-clay' : 'text-ink-3 border-transparent hover:text-ink'
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-ink hover:text-clay disabled:text-ink-4 disabled:pointer-events-none transition-colors"
        >
          Next →
        </button>
      </div>
    </nav>
  );
};
