'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { stageLabel, businessModelLabel } from '@/lib/labels';

export interface StartupItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  hqCity: string;
  foundingYear: number;
  stage: string;
  businessModel: string;
  verified: boolean;
  crVerified?: boolean;
  crNumber?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  verifiedAt: string;
  verifiedBy?: string | null;
  isFeatured: boolean;
  isPublished?: boolean;
  products?: any; // string[]
  fundingDisclosed?: string | null;
  investorsDisclosed?: any; // string[]
  techStack: any; // string[]
  keyMetrics: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  accentColor: string | null;
}

interface StartupDirectoryProps {
  initialStartups: StartupItem[];
  categories?: CategoryOption[];
  initialFilters?: {
    q: string;
    pillar: string;
    city: string;
    model: string;
    stage: string;
    crVerified: boolean;
    sort: string;
  };
}

const STAGE_FILTERS = [
  { label: 'All stages', value: 'ALL' },
  { label: 'Pre-seed', value: 'PRE_SEED' },
  { label: 'Seed', value: 'SEED' },
  { label: 'Series A', value: 'SERIES_A' },
  { label: 'Series B', value: 'SERIES_B' },
  { label: 'Series C+', value: 'SERIES_C' },
  { label: 'Growth', value: 'GROWTH' },
];

const MODEL_FILTERS = [
  { label: 'Any model', value: 'ALL' },
  { label: 'B2B', value: 'B2B' },
  { label: 'B2C', value: 'B2C' },
  { label: 'B2B2C', value: 'B2B2C' },
  { label: 'B2G', value: 'B2G' },
];

const CITY_FILTERS = [
  { label: 'Any city', value: 'ALL' },
  { label: 'Riyadh', value: 'Riyadh' },
  { label: 'Jeddah', value: 'Jeddah' },
  { label: 'Tabuk / NEOM', value: 'Tabuk' },
  { label: 'Dhahran / Khobar', value: 'Dhahran' },
];

const SORT_OPTIONS = [
  { label: 'Recently checked', value: 'RECENT' },
  { label: 'Name, A–Z', value: 'NAME' },
  { label: 'Stage, latest first', value: 'STAGE' },
  { label: 'Founded, newest first', value: 'FOUNDING_YEAR' },
];

const COLS = 'md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_7.5rem_4.5rem_6.5rem]';

export const StartupDirectory: React.FC<StartupDirectoryProps> = ({
  initialStartups,
  categories = [],
  initialFilters,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialFilters?.q || searchParams.get('q') || '');
  const [selectedStage, setSelectedStage] = useState(initialFilters?.stage || searchParams.get('stage') || 'ALL');
  const [selectedModel, setSelectedModel] = useState(initialFilters?.model || searchParams.get('model') || 'ALL');
  const [selectedPillar, setSelectedPillar] = useState(initialFilters?.pillar || searchParams.get('pillar') || 'ALL');
  const [selectedCity, setSelectedCity] = useState(initialFilters?.city || searchParams.get('city') || 'ALL');
  const [crOnly, setCrOnly] = useState(initialFilters?.crVerified || searchParams.get('crVerified') === 'true');
  const [selectedSort, setSelectedSort] = useState(initialFilters?.sort || searchParams.get('sort') || 'RECENT');

  // Sync URL query params with debounce
  const syncUrlParams = useCallback(
    (q: string, stage: string, model: string, pillar: string, city: string, cr: boolean, sort: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (stage !== 'ALL') params.set('stage', stage);
      if (model !== 'ALL') params.set('model', model);
      if (pillar !== 'ALL') params.set('pillar', pillar);
      if (city !== 'ALL') params.set('city', city);
      if (cr) params.set('crVerified', 'true');
      if (sort !== 'RECENT') params.set('sort', sort);

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, pathname]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      syncUrlParams(searchQuery, selectedStage, selectedModel, selectedPillar, selectedCity, crOnly, selectedSort);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery, selectedStage, selectedModel, selectedPillar, selectedCity, crOnly, selectedSort, syncUrlParams]);

  const filteredItems = useMemo(() => {
    let result = initialStartups.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.hqCity.toLowerCase().includes(q) ||
        (Array.isArray(item.products) && item.products.some((p: string) => p.toLowerCase().includes(q))) ||
        (Array.isArray(item.techStack) && item.techStack.some((t: string) => t.toLowerCase().includes(q)));

      const matchesStage = selectedStage === 'ALL' || item.stage === selectedStage;
      const matchesModel = selectedModel === 'ALL' || item.businessModel === selectedModel;
      const matchesPillar = selectedPillar === 'ALL' || item.category?.slug === selectedPillar;
      const matchesCity = selectedCity === 'ALL' || item.hqCity.toLowerCase().includes(selectedCity.toLowerCase());
      const matchesCr = !crOnly || item.crVerified === true;

      return matchesSearch && matchesStage && matchesModel && matchesPillar && matchesCity && matchesCr;
    });

    if (selectedSort === 'NAME') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === 'FOUNDING_YEAR') {
      result = [...result].sort((a, b) => b.foundingYear - a.foundingYear);
    } else if (selectedSort === 'STAGE') {
      const stageRank: Record<string, number> = {
        BOOTSTRAPPED: 1,
        PRE_SEED: 2,
        SEED: 3,
        SERIES_A: 4,
        SERIES_B: 5,
        SERIES_C: 6,
        GROWTH: 7,
      };
      result = [...result].sort((a, b) => (stageRank[b.stage] || 0) - (stageRank[a.stage] || 0));
    }

    return result;
  }, [initialStartups, searchQuery, selectedStage, selectedModel, selectedPillar, selectedCity, crOnly, selectedSort]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialStartups.length };
    for (const s of initialStartups) counts[s.stage] = (counts[s.stage] || 0) + 1;
    return counts;
  }, [initialStartups]);

  const trimmedQuery = searchQuery.trim();
  const hasFilters =
    Boolean(trimmedQuery) ||
    selectedStage !== 'ALL' ||
    selectedModel !== 'ALL' ||
    selectedPillar !== 'ALL' ||
    selectedCity !== 'ALL' ||
    crOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('ALL');
    setSelectedModel('ALL');
    setSelectedPillar('ALL');
    setSelectedCity('ALL');
    setCrOnly(false);
    setSelectedSort('RECENT');
  };

  return (
    <div>
      {/* Filters */}
      <div role="search" aria-label="Filter the register" className="space-y-7">
        <div className="flex items-end gap-4 rule-dot-b focus-within:border-clay transition-colors">
          <label htmlFor="startup-search" className="sr-only">
            Search companies
          </label>
          <input
            id="startup-search"
            type="search"
            placeholder="Search by name, product or technology"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent py-3 font-serif text-xl md:text-2xl text-ink placeholder:text-ink-4 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="shrink-0 pb-3.5 text-sm text-ink-3 hover:text-ink transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div>
          <p className="meta mb-2" id="stage-tabs-label">
            Stage
          </p>
          <div role="group" aria-labelledby="stage-tabs-label" className="flex flex-wrap gap-x-6 gap-y-2">
            {STAGE_FILTERS.map((stage) => {
              const active = selectedStage === stage.value;
              const count = stageCounts[stage.value] || 0;
              return (
                <button
                  key={stage.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedStage(stage.value)}
                  className={cn(
                    'relative py-1 text-[0.9375rem] transition-colors',
                    active ? 'text-ink' : count ? 'text-ink-3 hover:text-ink' : 'text-ink-4 hover:text-ink-3'
                  )}
                >
                  {stage.label}
                  <span className="ml-1.5 font-sans text-[0.6875rem] tabular text-ink-4">{count}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 -bottom-px h-px bg-clay transition-all duration-300',
                      active ? 'w-full' : 'w-0'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-end">
          <FilterSelect label="Sector" value={selectedPillar} onChange={setSelectedPillar}>
            <option value="ALL">Any sector</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="City" value={selectedCity} onChange={setSelectedCity}>
            {CITY_FILTERS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Model" value={selectedModel} onChange={setSelectedModel}>
            {MODEL_FILTERS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Sort" value={selectedSort} onChange={setSelectedSort}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FilterSelect>
          <label className="col-span-2 md:col-span-1 inline-flex items-center gap-2.5 pb-2 text-sm text-ink-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={crOnly}
              onChange={(e) => setCrOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--ink)]"
            />
            <span className="whitespace-nowrap">Confirmed CR only</span>
          </label>
        </div>
      </div>

      {/* Count line */}
      <div className="mt-12 mb-3 flex items-baseline justify-between gap-4">
        <p className="meta" aria-live="polite">
          {filteredItems.length === initialStartups.length
            ? `${filteredItems.length} ${filteredItems.length === 1 ? 'company' : 'companies'}`
            : `${filteredItems.length} of ${initialStartups.length} companies`}
        </p>
        {hasFilters && (
          <button type="button" onClick={handleResetFilters} className="text-sm text-ink link-rule">
            Clear filters
          </button>
        )}
      </div>

      {/* Register */}
      {filteredItems.length === 0 ? (
        <div className="rule-dot-t border-b border-b-rule py-14 md:py-20">
          <p className="font-serif text-display-sm text-ink max-w-xl">No companies match these filters.</p>
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-3">
            The register is small and checked by hand, so narrow searches often come up empty. Try a broader stage or
            city, or search the whole site instead.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink">
            <button type="button" onClick={handleResetFilters} className="group inline-flex items-center gap-2">
              <span className="link-rule">Clear all filters</span>
              <span aria-hidden>→</span>
            </button>
            {trimmedQuery && (
              <Link href={`/search?q=${encodeURIComponent(trimmedQuery)}`} className="group inline-flex items-center gap-2">
                <span className="link-rule">Search everything for &ldquo;{trimmedQuery}&rdquo;</span>
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className={cn('hidden md:grid gap-6 rule-dot-t border-b border-b-ink py-3 meta', COLS)}>
            <span>Company</span>
            <span>What it does</span>
            <span>City</span>
            <span className="text-right">Founded</span>
            <span className="text-right">Stage</span>
          </div>
          <ul className="rule-dot-t md:border-t-0">
            {filteredItems.map((item) => (
              <li key={item.id} data-testid="startup-card" className="group border-b border-rule">
                <Link
                  href={`/startup/${item.slug}`}
                  className={cn(
                    'grid gap-x-6 gap-y-1.5 py-5 -mx-3 px-3 md:items-baseline transition-colors hover:bg-paper-sheet/60',
                    COLS
                  )}
                >
                  <div className="min-w-0">
                    {item.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.logoUrl}
                        alt=""
                        width={28}
                        height={28}
                        className="inline-block align-[-0.4rem] mr-2.5 h-7 w-7 object-contain bg-paper-sheet border border-rule"
                      />
                    )}
                    <span className="font-serif font-bold text-[1.3125rem] leading-snug text-ink headline-link">{item.name}</span>
                    {item.crVerified && (
                      <span
                        className="ml-2 font-sans text-[0.65rem] text-moss align-middle whitespace-nowrap"
                        title="Commercial registration confirmed"
                      >
                        CR ✓
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] leading-snug text-ink-2">{item.tagline}</p>
                    <p className="mt-1 text-[0.8125rem] text-ink-3">
                      {[item.category?.name, businessModelLabel(item.businessModel)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {/* Mobile: the facts on one mono line */}
                  <p className="md:hidden meta mt-1">
                    {item.hqCity} · {item.foundingYear} · <span className="text-ink">{stageLabel(item.stage)}</span>
                  </p>
                  <span className="hidden md:block text-sm text-ink-3">{item.hqCity}</span>
                  <span className="hidden md:block font-sans tabular text-sm text-ink-3 text-right">{item.foundingYear}</span>
                  <span className="hidden md:block font-sans text-sm text-ink text-right whitespace-nowrap">
                    {stageLabel(item.stage)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="meta block mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent border-b border-ink py-2 pr-6 text-[0.9375rem] text-ink rounded-none cursor-pointer focus:outline-none focus:border-clay transition-colors truncate"
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[0.5625rem] text-ink-3"
        >
          ▼
        </span>
      </div>
    </div>
  );
}
