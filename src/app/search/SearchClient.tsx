'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search as SearchIcon,
  X,
  Building2,
  TrendingUp,
  Coins,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { UnifiedSearchResponse, UnifiedSearchCounts } from '@/lib/founder-intelligence';
import { formatDate, formatReadingTime, cn } from '@/lib/utils';

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

interface SearchClientProps {
  initialData: UnifiedSearchResponse;
}

export const SearchClient: React.FC<SearchClientProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get('q') || '';
  const urlCategory = (searchParams.get('category') || 'all') as
    | 'all'
    | 'startups'
    | 'investors'
    | 'opportunities'
    | 'articles';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(urlQuery || initialData.query || '');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'startups' | 'investors' | 'opportunities' | 'articles'
  >(urlCategory || initialData.category || 'all');
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
  const executeSearch = useCallback(
    async (targetQuery: string, targetCat: string, targetPage: number) => {
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
        setErrorMessage('Unable to retrieve search results. Please check your connection and retry.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Trigger search on query / filter / page changes
  useEffect(() => {
    // Avoid double fetch on initial SSR render if params match initialData
    if (
      query === initialData.query &&
      activeCategory === initialData.category &&
      currentPage === initialData.page
    ) {
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

  const handleCategorySelect = (cat: 'all' | 'startups' | 'investors' | 'opportunities' | 'articles') => {
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

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Interactive Command Search Bar */}
      <div className="bg-[#F1F5F2] p-5 sm:p-6 rounded-xl border border-[#E2E8E4] shadow-xs space-y-4">
        <form onSubmit={handleFormSubmit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search Saudi startups, VCs, grants, ticket sizes, or tech (e.g. Tamara, NTDP, Mozn, Series A)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
              updateUrl(e.target.value, activeCategory, 1);
            }}
            className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base bg-white border-2 border-[#E2E8E4] rounded-lg text-[#111827] placeholder:text-[#4B5563] focus:outline-none focus:border-[#0B6E4F] focus:bg-white transition-all"
            autoFocus
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#4B5563] hover:text-[#111827] rounded-full hover:bg-[#F1F5F2] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#0B6E4F] text-white text-xs font-heading font-bold rounded-md hover:bg-[#08533C] transition-all uppercase tracking-wider shadow-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Suggestion Tags */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs pt-1 border-t border-[#E2E8E4]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Suggested:</span>
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={cn(
                'text-[11px] px-2.5 py-0.5 rounded-full border transition-all font-medium cursor-pointer',
                query.toLowerCase() === tag.toLowerCase()
                  ? 'bg-[#0B6E4F] text-white border-[#0B6E4F] font-semibold'
                  : 'bg-white text-[#4B5563] hover:bg-[#E8F5EF] border-[#E2E8E4] hover:text-[#111827]'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'all'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Results</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#4B5563]'
              )}
            >
              {data.counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('startups')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'startups'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Startups</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                activeCategory === 'startups' ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#4B5563]'
              )}
            >
              {data.counts.startups}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('investors')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'investors'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Investors &amp; Funding</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                activeCategory === 'investors' ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#4B5563]'
              )}
            >
              {data.counts.investors}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('opportunities')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'opportunities'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Opportunities &amp; Grants</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                activeCategory === 'opportunities' ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#4B5563]'
              )}
            >
              {data.counts.opportunities}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySelect('articles')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-heading font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'articles'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligence &amp; News</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                activeCategory === 'articles' ? 'bg-white/20 text-white' : 'bg-[#F1F5F2] text-[#4B5563]'
              )}
            >
              {data.counts.articles}
            </span>
          </button>
        </div>

        {/* Loading Indicator */}
        {(isLoading || isPending) && (
          <div className="flex items-center gap-2 text-xs text-[#0B6E4F] font-medium shrink-0 animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B6E4F]" />
            <span className="hidden sm:inline">Searching ecosystem...</span>
          </div>
        )}
      </div>

      {/* 3. Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => executeSearch(query, activeCategory, currentPage)}
            className="underline font-bold hover:text-red-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Empty State */}
      {data.totalCount === 0 && !isLoading && !errorMessage && (
        <div className="py-14 px-6 text-center bg-white rounded-xl border border-[#E2E8E4] space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F2] flex items-center justify-center mx-auto text-[#4B5563]">
            <SearchIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-heading font-bold text-[#111827]">
              No verified records match &ldquo;{query}&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              We couldn&apos;t find matching startups, investors, or grants with that specific term.
              Try adjusting your query or browse the dedicated directories below.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/opportunities"
              className="px-3.5 py-2 rounded-lg bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#0B6E4F] border border-[#E2E8E4] transition-all font-heading font-bold flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Browse Opportunities</span>
            </Link>
            <Link
              href="/startups"
              className="px-3.5 py-2 rounded-lg bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#0B6E4F] border border-[#E2E8E4] transition-all font-heading font-bold flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Browse Startups</span>
            </Link>
            <Link
              href="/funding"
              className="px-3.5 py-2 rounded-lg bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#0B6E4F] border border-[#E2E8E4] transition-all font-heading font-bold flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Browse Investors</span>
            </Link>
          </div>
        </div>
      )}

      {/* 5. Grouped Results View (When activeCategory === 'all') */}
      {activeCategory === 'all' && data.totalCount > 0 && (
        <div className="space-y-10">
          {/* A. Matching Opportunities */}
          {data.opportunities.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-2.5">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#0B6E4F]" />
                  <h3 className="font-heading font-bold text-lg text-[#111827]">
                    Matching Opportunities &amp; Grants
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#0B6E4F]">
                    {data.counts.opportunities}
                  </span>
                </div>
                {data.counts.opportunities > data.opportunities.length && (
                  <button
                    onClick={() => handleCategorySelect('opportunities')}
                    className="text-xs font-bold text-[#0B6E4F] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {data.counts.opportunities} Opportunities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.opportunities.map((opp) => (
                  <OpportunitySearchCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </section>
          )}

          {/* B. Matching Startups */}
          {data.startups.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#19B5A3]" />
                  <h3 className="font-heading font-bold text-lg text-[#111827]">
                    Matching Saudi Startups
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E6FAF7] text-[#0E7A6E]">
                    {data.counts.startups}
                  </span>
                </div>
                {data.counts.startups > data.startups.length && (
                  <button
                    onClick={() => handleCategorySelect('startups')}
                    className="text-xs font-bold text-[#0B6E4F] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {data.counts.startups} Startups</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {data.startups.map((startup) => (
                  <StartupSearchCard key={startup.id} startup={startup} />
                ))}
              </div>
            </section>
          )}

          {/* C. Matching Investors & Funding Intelligence */}
          {data.investors.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C9A227]" />
                  <h3 className="font-heading font-bold text-lg text-[#111827]">
                    Matching Investors &amp; Funding Sources
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FDF8EC] text-[#9A7B1C]">
                    {data.counts.investors}
                  </span>
                </div>
                {data.counts.investors > data.investors.length && (
                  <button
                    onClick={() => handleCategorySelect('investors')}
                    className="text-xs font-bold text-[#0B6E4F] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {data.counts.investors} Investors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.investors.map((inv) => (
                  <InvestorSearchCard key={inv.id} investor={inv} />
                ))}
              </div>
            </section>
          )}

          {/* D. Matching Intelligence Briefings */}
          {data.articles.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B6E4F]" />
                  <h3 className="font-heading font-bold text-lg text-[#111827]">
                    Intelligence Briefings &amp; Reports
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F2] text-[#111827]">
                    {data.counts.articles}
                  </span>
                </div>
                {data.counts.articles > data.articles.length && (
                  <button
                    onClick={() => handleCategorySelect('articles')}
                    className="text-xs font-bold text-[#0B6E4F] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {data.counts.articles} Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {data.articles.map((art) => (
                  <ArticleSearchCard key={art.id} article={art} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 6. Filtered Category View (Startups) */}
      {activeCategory === 'startups' && data.startups.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.startups.map((startup) => (
              <StartupSearchCard key={startup.id} startup={startup} />
            ))}
          </div>

          <PaginationBar
            currentPage={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            limit={data.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 7. Filtered Category View (Investors) */}
      {activeCategory === 'investors' && data.investors.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.investors.map((inv) => (
              <InvestorSearchCard key={inv.id} investor={inv} />
            ))}
          </div>

          <PaginationBar
            currentPage={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            limit={data.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 8. Filtered Category View (Opportunities) */}
      {activeCategory === 'opportunities' && data.opportunities.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.opportunities.map((opp) => (
              <OpportunitySearchCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          <PaginationBar
            currentPage={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            limit={data.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 9. Filtered Category View (Articles) */}
      {activeCategory === 'articles' && data.articles.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-3">
            {data.articles.map((art) => (
              <ArticleSearchCard key={art.id} article={art} />
            ))}
          </div>

          <PaginationBar
            currentPage={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            limit={data.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// RESULT CARD SUB-COMPONENTS
// ------------------------------------------------------------------------------

const StartupSearchCard: React.FC<{ startup: any }> = ({ startup }) => {
  return (
    <div className="bg-white rounded-lg border border-[#E2E8E4] p-5 hover:border-[#0B6E4F]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B6E4F] text-white uppercase tracking-wider">
              {startup.stage}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F2] text-[#4B5563] border border-[#E2E8E4]">
              {startup.businessModel}
            </span>
          </div>

          {startup.crVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B6E4F] bg-[#E8F5EF] border border-[#0B6E4F]/30 px-2 py-0.5 rounded-full shrink-0">
              <ShieldCheck className="w-3 h-3 text-[#0B6E4F]" />
              <span>CR Verified</span>
            </span>
          )}
        </div>

        <Link href={`/startup/${startup.slug}`} className="block group">
          <h4 className="font-heading font-black text-lg text-[#111827] group-hover:text-[#0B6E4F] transition-colors">
            {startup.name}
          </h4>
        </Link>

        <p className="text-xs text-[#4B5563] line-clamp-1 font-medium">{startup.tagline}</p>

        {startup.fundingDisclosed && (
          <div className="p-2 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] text-xs font-medium text-[#111827]">
            <span className="font-bold text-[10px] uppercase text-[#4B5563] block">
              Disclosed Funding
            </span>
            <span className="text-[11px] font-semibold text-[#0B6E4F]">
              {startup.fundingDisclosed}
            </span>
          </div>
        )}

        <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
          {startup.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#4B5563] font-medium">{startup.hqCity}, KSA</span>
        <Link
          href={`/startup/${startup.slug}`}
          className="font-heading font-bold text-[#0B6E4F] hover:text-[#08533C] inline-flex items-center gap-1 transition-colors"
        >
          <span>Venture Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

const InvestorSearchCard: React.FC<{ investor: any }> = ({ investor }) => {
  const formatType = (type: string) => {
    switch (type) {
      case 'VENTURE_CAPITAL':
        return 'Venture Capital';
      case 'GOVERNMENT_FUND':
        return 'Sovereign / Gov Fund';
      case 'CORPORATE_VC':
        return 'Corporate VC';
      case 'ANGEL_NETWORK':
        return 'Angel Network';
      default:
        return type;
    }
  };

  const portfolio = Array.isArray(investor.portfolioHighlights)
    ? (investor.portfolioHighlights as string[]).slice(0, 3)
    : [];

  return (
    <div className="bg-white rounded-lg border border-[#E2E8E4] p-5 hover:border-[#0B6E4F]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B6E4F] text-white uppercase tracking-wider">
            {formatType(investor.type)}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {investor.isCmaAuthorized && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B6E4F] bg-[#E8F5EF] border border-[#0B6E4F]/30 px-2 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#0B6E4F]" />
                <span>CMA Authorized</span>
              </span>
            )}
            {investor.isSvcPartner && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A7B1C] bg-[#FDF8EC] border border-[#C9A227]/40 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3 text-[#C9A227]" />
                <span>SVC Partner</span>
              </span>
            )}
          </div>
        </div>

        <Link href={`/investor/${investor.slug}`} className="block group">
          <h4 className="font-heading font-black text-lg text-[#111827] group-hover:text-[#0B6E4F] transition-colors">
            {investor.name}
          </h4>
        </Link>

        {investor.checkSizeRange && (
          <div className="p-2 rounded-md bg-[#FDF8EC] border border-[#C9A227]/30 text-xs text-[#111827]">
            <span className="font-bold text-[10px] uppercase text-[#9A7B1C] block">
              Investment Ticket Policy
            </span>
            <span className="text-[11px] font-semibold text-[#111827] line-clamp-1">
              {investor.checkSizeRange}
            </span>
          </div>
        )}

        <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
          {investor.description}
        </p>

        {portfolio.length > 0 && (
          <div className="text-[11px] text-[#4B5563] pt-1">
            <span className="font-semibold text-[#111827]">Portfolio: </span>
            <span>{portfolio.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#4B5563] font-medium">{investor.hqLocation}</span>
        <Link
          href={`/investor/${investor.slug}`}
          className="font-heading font-bold text-[#0B6E4F] hover:text-[#08533C] inline-flex items-center gap-1 transition-colors"
        >
          <span>Investor Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

const OpportunitySearchCard: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  const isExpired = Boolean(opportunity.isExpired || opportunity.effectiveStatus === 'CLOSED');

  return (
    <div className="bg-white rounded-lg border border-[#E2E8E4] p-5 hover:border-[#0B6E4F]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-bold text-[#4B5563] text-xs truncate max-w-[200px]">
            {opportunity.organization}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
              isExpired
                ? 'bg-stone-200 text-stone-600'
                : 'bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/30'
            )}
          >
            {isExpired ? 'Closed / Expired' : opportunity.deadline ? formatDate(opportunity.deadline) : 'Rolling Open'}
          </span>
        </div>

        <Link href={`/opportunity/${opportunity.slug}`} className="block group">
          <h4 className="font-heading font-black text-lg text-[#111827] group-hover:text-[#0B6E4F] transition-colors">
            {opportunity.title}
          </h4>
        </Link>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {opportunity.fundingAmount && (
            <span className="px-2 py-0.5 rounded-md bg-[#E8F5EF] text-[#0B6E4F] text-xs font-bold border border-[#0B6E4F]/30">
              {opportunity.fundingAmount}
            </span>
          )}
          {opportunity.equityTaken && (
            <span className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[#4B5563] text-[11px] font-medium border border-[#E2E8E4]">
              {opportunity.equityTaken}
            </span>
          )}
        </div>

        <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#4B5563] font-medium">{opportunity.location || 'Saudi Arabia'}</span>
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="font-heading font-bold text-[#0B6E4F] hover:text-[#08533C] inline-flex items-center gap-1 transition-colors"
        >
          <span>Opportunity Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

const ArticleSearchCard: React.FC<{ article: any }> = ({ article }) => {
  return (
    <article className="bg-white rounded-lg border border-[#E2E8E4] p-5 hover:border-[#0B6E4F]/60 hover:shadow-md transition-all space-y-2">
      <div className="flex items-center gap-2 text-xs text-[#4B5563]">
        {article.category && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
            style={{ backgroundColor: article.category.color || '#0B6E4F' }}
          >
            {article.category.name}
          </span>
        )}
        <span>•</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[#C9A227]" />
          <span>{formatDate(article.publishedAt)}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#4B5563]" />
          <span>{formatReadingTime(article.readingTime)}</span>
        </span>
      </div>

      <Link href={`/article/${article.slug}`} className="block group">
        <h4 className="font-heading font-bold text-base text-[#111827] group-hover:text-[#0B6E4F] transition-colors">
          {article.title}
        </h4>
      </Link>

      <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
        {article.excerpt}
      </p>

      <div className="pt-2 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#4B5563] font-medium">
          By {article.author?.displayName || 'Intelligence Desk'}
        </span>
        <Link
          href={`/article/${article.slug}`}
          className="font-heading font-bold text-[#0B6E4F] hover:text-[#08533C] inline-flex items-center gap-1"
        >
          <span>Read Briefing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};

// ------------------------------------------------------------------------------
// PAGINATION COMPONENT
// ------------------------------------------------------------------------------

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pt-6 border-t border-[#E2E8E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      <span className="text-[#4B5563] font-medium">
        Showing page <span className="font-bold text-[#111827]">{currentPage}</span> of{' '}
        <span className="font-bold text-[#111827]">{totalPages}</span> ({totalCount} verified results)
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-[#E2E8E4] bg-white text-[#111827] hover:bg-[#F1F5F2] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 rounded-md font-heading font-bold text-xs transition-all cursor-pointer',
              currentPage === p
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'border border-[#E2E8E4] bg-white text-[#111827] hover:bg-[#F1F5F2]'
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-[#E2E8E4] bg-white text-[#111827] hover:bg-[#F1F5F2] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
