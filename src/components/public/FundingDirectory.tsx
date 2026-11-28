'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { investorTypeLabel } from '@/lib/labels';

export interface InvestorItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  hqLocation: string;
  logoUrl: string | null;
  websiteUrl: string;
  pitchUrl: string | null;
  isCmaAuthorized: boolean;
  cmaLicenseNumber: string | null;
  isSvcPartner: boolean;
  svcProgramDetails: string | null;
  regulatoryCategory: string | null;
  saudiRegulated: boolean;
  licenseDetails: string | null;
  isActiveInvesting: boolean;
  targetStages: any; // string[]
  targetSectors: any; // string[]
  checkSizeRange: string | null;
  portfolioHighlights: any; // string[]
  description: string;
  thesisSummary?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  verifiedAt: string;
  isFeatured: boolean;
}

interface FundingDirectoryProps {
  initialInvestors: InvestorItem[];
  initialQuery?: string;
  initialType?: string;
  initialStage?: string;
  initialSector?: string;
  initialCmaOnly?: boolean;
  initialSvcOnly?: boolean;
  initialActiveOnly?: boolean;
}

const TYPE_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Venture capital', value: 'VENTURE_CAPITAL' },
  { label: 'Government funds', value: 'GOVERNMENT_FUND' },
  { label: 'Corporate VC', value: 'CORPORATE_VC' },
  { label: 'Angel networks', value: 'ANGEL_NETWORK' },
  { label: 'Family offices', value: 'FAMILY_OFFICE' },
  { label: 'Accelerator funds', value: 'ACCELERATOR_FUND' },
];

const STAGE_FILTERS = ['ALL', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];

const SORT_OPTIONS = [
  { label: 'Featured first', value: 'FEATURED' },
  { label: 'Name, A–Z', value: 'NAME' },
  { label: 'Recently checked', value: 'RECENT' },
] as const;

const COLS = 'md:grid-cols-[minmax(0,1fr)_13rem_10rem_7rem_6.5rem_2rem]';

export const FundingDirectory: React.FC<FundingDirectoryProps> = ({
  initialInvestors,
  initialQuery = '',
  initialType = 'ALL',
  initialStage = 'ALL',
  initialCmaOnly = false,
  initialSvcOnly = false,
  initialActiveOnly = false,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [cmaOnly, setCmaOnly] = useState(initialCmaOnly);
  const [svcOnly, setSvcOnly] = useState(initialSvcOnly);
  const [activeOnly, setActiveOnly] = useState(initialActiveOnly);
  const [sortOption, setSortOption] = useState<'FEATURED' | 'NAME' | 'RECENT'>('FEATURED');
  const [openId, setOpenId] = useState<string | null>(null);

  // Synchronize URL parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');

    if (selectedType !== 'ALL') params.set('type', selectedType);
    else params.delete('type');

    if (selectedStage !== 'ALL') params.set('stage', selectedStage);
    else params.delete('stage');

    if (cmaOnly) params.set('cma', 'true');
    else params.delete('cma');

    if (svcOnly) params.set('svc', 'true');
    else params.delete('svc');

    if (activeOnly) params.set('active', 'true');
    else params.delete('active');

    const newQuery = params.toString();
    const currentUrl = `${pathname}${newQuery ? `?${newQuery}` : ''}`;
    window.history.replaceState(null, '', currentUrl);
  }, [searchQuery, selectedType, selectedStage, cmaOnly, svcOnly, activeOnly, pathname, searchParams]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialInvestors.length };
    initialInvestors.forEach((i) => {
      counts[i.type] = (counts[i.type] ?? 0) + 1;
    });
    return counts;
  }, [initialInvestors]);

  const filteredItems = useMemo(() => {
    const list = initialInvestors.filter((item) => {
      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesHq = item.hqLocation.toLowerCase().includes(query);
        const matchesRegCat = Boolean(item.regulatoryCategory && item.regulatoryCategory.toLowerCase().includes(query));
        const matchesCma = Boolean(item.cmaLicenseNumber && item.cmaLicenseNumber.toLowerCase().includes(query));
        const matchesSectors =
          Array.isArray(item.targetSectors) && item.targetSectors.some((s: string) => s.toLowerCase().includes(query));
        const matchesPortfolio =
          Array.isArray(item.portfolioHighlights) &&
          item.portfolioHighlights.some((p: string) => p.toLowerCase().includes(query));

        if (!matchesName && !matchesDesc && !matchesHq && !matchesRegCat && !matchesCma && !matchesSectors && !matchesPortfolio) {
          return false;
        }
      }

      // 2. Type
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;

      // 3. Stage
      if (selectedStage !== 'ALL') {
        const stages = Array.isArray(item.targetStages) ? (item.targetStages as string[]) : [];
        const matchesStage = stages.some((st) => st.toLowerCase().includes(selectedStage.toLowerCase()));
        if (!matchesStage) return false;
      }

      // 4–6. Licensing and activity
      if (cmaOnly && !item.isCmaAuthorized) return false;
      if (svcOnly && !item.isSvcPartner) return false;
      if (activeOnly && !item.isActiveInvesting) return false;

      return true;
    });

    return list.sort((a, b) => {
      if (sortOption === 'NAME') return a.name.localeCompare(b.name);
      if (sortOption === 'RECENT') return new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime();
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [initialInvestors, searchQuery, selectedType, selectedStage, cmaOnly, svcOnly, activeOnly, sortOption]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStage('ALL');
    setCmaOnly(false);
    setSvcOnly(false);
    setActiveOnly(false);
    setSortOption('FEATURED');
  };

  const hasActiveFilters =
    Boolean(searchQuery) || selectedType !== 'ALL' || selectedStage !== 'ALL' || cmaOnly || svcOnly || activeOnly;

  const sortLabel = SORT_OPTIONS.find((s) => s.value === sortOption)?.label.toLowerCase() ?? '';

  return (
    <div>
      {/* Filter bar */}
      <div className="space-y-6">
        <label className="flex items-center gap-3 rule-dot-b pb-2 focus-within:border-clay transition-colors">
          <span className="sr-only">Search investors</span>
          <SearchGlyph />
          <input
            type="search"
            placeholder="Search funds, sectors or portfolio"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1.5 px-1.5 text-base text-ink placeholder:text-ink-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-clay/70 rounded-xs [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="meta hover:text-ink transition-colors">
              Clear
            </button>
          )}
        </label>

        <div role="tablist" aria-label="Investor type" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-rule">
          {TYPE_FILTERS.filter((t) => (typeCounts[t.value] ?? 0) > 0 || t.value === selectedType).map((type) => {
            const active = selectedType === type.value;
            return (
              <button
                key={type.value}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  '-mb-px border-b-2 py-2.5 text-sm transition-colors',
                  active ? 'border-clay text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                )}
              >
                {type.label}
                <span className="ml-1.5 font-sans text-[0.6875rem] tabular text-ink-4">{typeCounts[type.value] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-12 md:items-end">
          <FilterSelect label="Stage" value={selectedStage} onChange={setSelectedStage} className="md:col-span-3">
            {STAGE_FILTERS.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'Any stage' : st}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Order"
            value={sortOption}
            onChange={(v) => setSortOption(v as 'FEATURED' | 'NAME' | 'RECENT')}
            className="md:col-span-3"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FilterSelect>
          <fieldset className="col-span-2 md:col-span-6">
            <legend className="meta mb-2">Show only</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-rule pb-2 text-sm text-ink-2">
              <Check checked={cmaOnly} onChange={setCmaOnly} label="CMA-licensed" />
              <Check checked={svcOnly} onChange={setSvcOnly} label="SVC partners" />
              <Check checked={activeOnly} onChange={setActiveOnly} label="Investing now" />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Result line */}
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
        <p className="meta" aria-live="polite">
          {filteredItems.length} of {initialInvestors.length} {initialInvestors.length === 1 ? 'investor' : 'investors'} ·{' '}
          {sortLabel}
        </p>
        {hasActiveFilters && (
          <button type="button" onClick={handleResetFilters} className="group meta text-ink hover:text-clay transition-colors">
            <span className="link-rule">Clear filters</span> →
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-3 rule-dot-t py-14">
          <p className="font-serif text-[1.5rem] leading-snug text-ink">No investors match these filters.</p>
          <button type="button" onClick={handleResetFilters} className="group mt-3 inline-flex items-center gap-2 text-sm text-ink">
            <span className="link-rule">Clear filters</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className={cn('hidden md:grid gap-6 rule-dot-t border-b border-rule py-3 meta', COLS)}>
            <span>Investor</span>
            <span>Ticket size</span>
            <span>Stages</span>
            <span>Licensing</span>
            <span>Status</span>
            <span className="sr-only">Details</span>
          </div>

          <ul className="rule-dot-t md:border-t-0">
            {filteredItems.map((item) => {
              const stages = Array.isArray(item.targetStages) ? (item.targetStages as string[]) : [];
              const sectors = Array.isArray(item.targetSectors) ? (item.targetSectors as string[]) : [];
              const portfolio = Array.isArray(item.portfolioHighlights) ? (item.portfolioHighlights as string[]) : [];
              const licences = [item.isCmaAuthorized && 'CMA', item.isSvcPartner && 'SVC'].filter(Boolean) as string[];
              const open = openId === item.id;
              const panelId = `inv-${item.id}`;

              return (
                <li key={item.id} className={cn('border-b border-rule', open && 'bg-paper-sheet/60')}>
                  <div
                    className={cn(
                      'grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 py-5 md:items-baseline -mx-3 px-3 transition-colors hover:bg-paper-sheet/60',
                      COLS
                    )}
                  >
                    {/* Investor */}
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-[1.25rem] leading-snug text-ink">
                        <Link href={`/investor/${item.slug}`} className="headline-link">
                          {item.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-ink-3">
                        {investorTypeLabel(item.type)} · {item.hqLocation}
                      </p>
                    </div>

                    {/* Mobile status */}
                    <div className="md:hidden pt-1.5">
                      <ActiveWord active={item.isActiveInvesting} />
                    </div>

                    {/* Ticket */}
                    <p className="col-span-2 md:col-span-1 text-sm text-ink-2 leading-snug">
                      <span className="meta mr-2 md:hidden">Ticket</span>
                      {item.checkSizeRange ?? 'Not disclosed'}
                    </p>

                    {/* Stages */}
                    <p className="col-span-2 md:col-span-1 text-sm text-ink-2 leading-snug">
                      <span className="meta mr-2 md:hidden">Stages</span>
                      {stages.length ? stages.join(', ') : '—'}
                    </p>

                    {/* Licensing */}
                    <p className={cn('font-sans text-[0.8125rem] text-ink-2', !licences.length && 'hidden md:block')}>
                      <span className="meta mr-2 md:hidden">Licensing</span>
                      {licences.length ? licences.join(' · ') : <span className="text-ink-4">—</span>}
                    </p>

                    {/* Desktop status */}
                    <div className="hidden md:block">
                      <ActiveWord active={item.isActiveInvesting} />
                    </div>

                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="justify-self-end font-sans text-sm text-ink-3 hover:text-clay transition-colors md:w-8 md:text-right"
                    >
                      <span className="md:hidden mr-1.5 text-[0.71875rem]">{open ? 'Less' : 'Details'}</span>
                      <span aria-hidden>{open ? '−' : '+'}</span>
                      <span className="sr-only">{open ? 'Hide details' : `Show details for ${item.name}`}</span>
                    </button>
                  </div>

                  {open && (
                    <div id={panelId} className="grid gap-8 pb-8 pt-1 md:grid-cols-12">
                      <div className="md:col-span-7 space-y-5">
                        <p className="text-[0.9375rem] leading-relaxed text-ink-2">{item.description}</p>
                        {sectors.length > 0 && (
                          <div>
                            <p className="meta mb-2">Sectors</p>
                            <p className="text-sm text-ink-2 leading-relaxed">{sectors.join(' · ')}</p>
                          </div>
                        )}
                        {portfolio.length > 0 && (
                          <div>
                            <p className="meta mb-2">Portfolio includes</p>
                            <p className="text-sm text-ink-2 leading-relaxed">{portfolio.join(' · ')}</p>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-5 md:border-l md:border-rule md:pl-8">
                        <dl className="text-sm">
                          {item.cmaLicenseNumber && (
                            <FactRow label="CMA licence">
                              <span className="font-sans tabular">{item.cmaLicenseNumber}</span>
                            </FactRow>
                          )}
                          {item.regulatoryCategory && <FactRow label="Category">{item.regulatoryCategory}</FactRow>}
                          {item.sourceName && (
                            <FactRow label="Source">
                              {item.sourceUrl ? (
                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                                  {item.sourceName} ↗
                                </a>
                              ) : (
                                item.sourceName
                              )}
                            </FactRow>
                          )}
                          <FactRow label="Last checked">
                            <span className="font-sans tabular">{shortDate(item.verifiedAt)}</span>
                          </FactRow>
                        </dl>
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                          {item.pitchUrl && (
                            <a href={item.pitchUrl} target="_blank" rel="noopener noreferrer" className="btn-quiet">
                              Pitch <span aria-hidden>↗</span>
                            </a>
                          )}
                          <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                            Website ↗
                          </a>
                          <Link href={`/investor/${item.slug}`} className="group inline-flex items-center gap-2 text-ink">
                            <span className="link-rule">Full profile</span>
                            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */

function ActiveWord({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 font-sans text-[0.75rem] text-moss whitespace-nowrap">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss" />
      Investing
    </span>
  ) : (
    <span className="font-sans text-[0.75rem] text-ink-4 whitespace-nowrap">Not active</span>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer hover:text-ink transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded-none accent-clay cursor-pointer"
      />
      <span className={cn(checked && 'text-ink')}>{label}</span>
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="meta block mb-1">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none truncate border-b border-ink bg-transparent py-1.5 pr-6 text-sm text-ink focus:border-clay focus:outline-none cursor-pointer"
        >
          {children}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[0.625rem] text-ink-3">
          ▼
        </span>
      </span>
    </label>
  );
}

function FactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-2.5 first:border-t">
      <dt className="meta pt-0.5">{label}</dt>
      <dd className="text-ink-2 break-words">{children}</dd>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-ink-3 shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}
