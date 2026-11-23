'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { deadlineInfo, opportunityTypeLabel, shortEquity } from '@/lib/labels';

export interface OpportunityItem {
  id: string;
  title: string;
  slug: string;
  organization: string;
  category: string;
  fundingAmount: string | null;
  equityTaken: string | null;
  location: string | null;
  description: string;
  eligibilitySummary: string | null;
  eligibilityCriteria: any; // string[]
  benefits?: any; // string[]
  requirements?: any; // string[]
  status: string;
  isExpired?: boolean;
  deadline: string | null;
  applicationUrl: string;
  sourceName: string;
  sourceUrl?: string | null;
  verifiedAt: string;
  verifiedBy?: string | null;
  isFeatured: boolean;
  isPublished?: boolean;
  categoryRel?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface PillarOption {
  slug: string;
  name: string;
  color: string;
}

interface OpportunityDirectoryProps {
  initialOpportunities: OpportunityItem[];
  availablePillars?: PillarOption[];
  initialQuery?: string;
  initialCategory?: string;
  initialPillar?: string;
  initialStatus?: string;
  initialEligibility?: string;
  initialSort?: string;
}

const CATEGORY_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Grants', value: 'GRANT' },
  { label: 'Accelerators', value: 'ACCELERATOR' },
  { label: 'Subsidies', value: 'SUBSIDY' },
  { label: 'Government programmes', value: 'GOVERNMENT_PROGRAM' },
  { label: 'Incubators', value: 'INCUBATOR' },
  { label: 'Credits & perks', value: 'SUBSIDIZED_PERK' },
  { label: 'Hackathons', value: 'HACKATHON' },
];

const ELIGIBILITY_OPTIONS = [
  { label: 'Any', value: 'ALL' },
  { label: 'Non-dilutive (0% equity)', value: 'NON_DILUTIVE' },
  { label: 'Needs a Saudi CR', value: 'SAUDI_CR' },
  { label: 'Pre-revenue or MVP', value: 'PRE_REVENUE_MVP' },
];

const STATUS_OPTIONS = [
  { label: 'All listings', value: 'ALL' },
  { label: 'Open (hide closed)', value: 'ACTIVE_ONLY' },
  { label: 'Open now', value: 'OPEN' },
  { label: 'Closing within 14 days', value: 'CLOSING_SOON' },
  { label: 'Rolling', value: 'ROLLING' },
  { label: 'Closed', value: 'CLOSED' },
];

const SORT_OPTIONS = [
  { label: 'Deadline, soonest first', value: 'deadline-asc' },
  { label: 'Recently checked', value: 'verified-desc' },
  { label: 'Name, A–Z', value: 'title-asc' },
];

const COLS = 'md:grid-cols-[8.5rem_minmax(0,1fr)_12rem_4.5rem_6.5rem_2rem]';

export const OpportunityDirectory: React.FC<OpportunityDirectoryProps> = ({
  initialOpportunities,
  availablePillars = [],
  initialQuery = '',
  initialCategory = 'ALL',
  initialPillar = 'ALL',
  initialStatus = 'ALL',
  initialEligibility = 'ALL',
  initialSort = 'deadline-asc',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPillar, setSelectedPillar] = useState(initialPillar);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedEligibility, setSelectedEligibility] = useState(initialEligibility);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [openId, setOpenId] = useState<string | null>(null);

  // Sync state to URL searchParams without page reload
  const updateUrlParams = useCallback(
    (updates: Record<string, string>) => {
      const current = new URLSearchParams(Array.from(searchParams?.entries() || []));

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'ALL' || (key === 'sort' && value === 'deadline-asc')) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams({ q: val });
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    updateUrlParams({ category: val });
  };
  const handlePillarChange = (val: string) => {
    setSelectedPillar(val);
    updateUrlParams({ pillar: val });
  };
  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    updateUrlParams({ status: val });
  };
  const handleEligibilityChange = (val: string) => {
    setSelectedEligibility(val);
    updateUrlParams({ eligibility: val });
  };
  const handleSortChange = (val: string) => {
    setSelectedSort(val);
    updateUrlParams({ sort: val });
  };

  // Reset returns to the same state a clean URL loads with.
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPillar('ALL');
    setSelectedStatus('ALL');
    setSelectedEligibility('ALL');
    setSelectedSort('deadline-asc');
    router.replace(pathname, { scroll: false });
  };

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'ALL' ||
    selectedPillar !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedEligibility !== 'ALL' ||
    selectedSort !== 'deadline-asc';

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialOpportunities.length };
    initialOpportunities.forEach((o) => {
      counts[o.category] = (counts[o.category] ?? 0) + 1;
    });
    return counts;
  }, [initialOpportunities]);

  const filteredItems = useMemo(() => {
    let result = [...initialOpportunities];

    // 1. Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.organization.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.eligibilitySummary && item.eligibilitySummary.toLowerCase().includes(q))
      );
    }

    // 2. Type
    if (selectedCategory !== 'ALL') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 3. Section
    if (selectedPillar !== 'ALL') {
      result = result.filter((item) => item.categoryRel?.slug === selectedPillar);
    }

    // 4. Status
    if (selectedStatus === 'ACTIVE_ONLY') {
      result = result.filter((item) => !item.isExpired && item.status !== 'CLOSED');
    } else if (selectedStatus !== 'ALL') {
      result = result.filter((item) => {
        if (selectedStatus === 'CLOSED') {
          return item.isExpired || item.status === 'CLOSED';
        }
        return item.status === selectedStatus && !item.isExpired;
      });
    }

    // 5. Eligibility
    if (selectedEligibility !== 'ALL') {
      if (selectedEligibility === 'NON_DILUTIVE') {
        result = result.filter(
          (item) =>
            item.equityTaken?.includes('0%') ||
            item.equityTaken?.toLowerCase().includes('non-dilutive') ||
            item.category === 'GRANT' ||
            item.category === 'SUBSIDY'
        );
      } else if (selectedEligibility === 'SAUDI_CR') {
        result = result.filter((item) => {
          const criteriaStr = Array.isArray(item.eligibilityCriteria)
            ? (item.eligibilityCriteria as string[]).join(' ')
            : '';
          return (
            criteriaStr.toLowerCase().includes('cr') ||
            criteriaStr.toLowerCase().includes('commercial registration') ||
            item.eligibilitySummary?.toLowerCase().includes('cr') ||
            item.eligibilitySummary?.toLowerCase().includes('saudi entity')
          );
        });
      } else if (selectedEligibility === 'PRE_REVENUE_MVP') {
        result = result.filter((item) => {
          const text = `${item.title} ${item.description} ${item.eligibilitySummary}`.toLowerCase();
          return (
            text.includes('mvp') ||
            text.includes('prototype') ||
            text.includes('seed') ||
            text.includes('pre-seed') ||
            text.includes('early')
          );
        });
      }
    }

    // 6. Sorting
    if (selectedSort === 'verified-desc') {
      result.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
    } else if (selectedSort === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'deadline-asc') {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return result;
  }, [initialOpportunities, searchQuery, selectedCategory, selectedPillar, selectedStatus, selectedEligibility, selectedSort]);

  const sortLabel = SORT_OPTIONS.find((s) => s.value === selectedSort)?.label.toLowerCase() ?? '';

  return (
    <div>
      {/* Filter bar */}
      <div className="space-y-6">
        <label className="flex items-center gap-3 rule-dot-b pb-2 focus-within:border-clay transition-colors">
          <span className="sr-only">Search programmes</span>
          <SearchGlyph />
          <input
            type="search"
            placeholder="Search programmes and organisations"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-base text-ink placeholder:text-ink-4 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="meta hover:text-ink transition-colors"
            >
              Clear
            </button>
          )}
        </label>

        <div role="tablist" aria-label="Programme type" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-rule">
          {CATEGORY_TABS.filter((t) => (typeCounts[t.value] ?? 0) > 0 || t.value === selectedCategory).map((tab) => {
            const active = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                onClick={() => handleCategoryChange(tab.value)}
                className={cn(
                  '-mb-px border-b-2 py-2.5 text-sm transition-colors',
                  active ? 'border-clay text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                )}
              >
                {tab.label}
                <span className="ml-1.5 font-sans text-[0.6875rem] tabular text-ink-4">{typeCounts[tab.value] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <FilterSelect label="Section" value={selectedPillar} onChange={handlePillarChange}>
            <option value="ALL">All sections</option>
            {availablePillars.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Eligibility" value={selectedEligibility} onChange={handleEligibilityChange}>
            {ELIGIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Status" value={selectedStatus} onChange={handleStatusChange}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Order" value={selectedSort} onChange={handleSortChange}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      {/* Result line */}
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
        <p className="meta" aria-live="polite">
          {filteredItems.length} of {initialOpportunities.length}{' '}
          {initialOpportunities.length === 1 ? 'programme' : 'programmes'} · {sortLabel}
        </p>
        {isFilteringActive && (
          <button type="button" onClick={handleResetFilters} className="group meta text-ink hover:text-clay transition-colors">
            <span className="link-rule">Clear filters</span> →
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-3 rule-dot-t py-14">
          <p className="font-serif text-[1.5rem] leading-snug text-ink">No programmes match these filters.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="group mt-3 inline-flex items-center gap-2 text-sm text-ink"
          >
            <span className="link-rule">Clear filters</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className={cn('hidden md:grid gap-6 rule-dot-t border-b border-rule py-3 meta', COLS)}>
            <span>Deadline</span>
            <span>Programme</span>
            <span>Value</span>
            <span className="text-right">Equity</span>
            <span>Status</span>
            <span className="sr-only">Details</span>
          </div>

          <ul className="rule-dot-t md:border-t-0">
            {filteredItems.map((item) => {
              const d = deadlineInfo(item.deadline, item.isExpired ? 'CLOSED' : item.status);
              const st = statusWord(item, d.urgent, d.closed);
              const open = openId === item.id;
              const panelId = `opp-${item.id}`;
              const criteria = Array.isArray(item.eligibilityCriteria) ? (item.eligibilityCriteria as string[]) : [];
              const benefits = Array.isArray(item.benefits) ? (item.benefits as string[]) : [];

              return (
                <li key={item.id} className={cn('border-b border-rule', open && 'bg-paper-sheet/60')}>
                  <div
                    className={cn(
                      'grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 py-5 md:items-baseline -mx-3 px-3 transition-colors hover:bg-paper-sheet/60',
                      COLS
                    )}
                  >
                    {/* Deadline */}
                    <div className="font-sans tabular text-sm">
                      <span className={cn(d.closed ? 'text-ink-4' : 'text-ink')}>{d.date}</span>
                      <span className={cn('block text-[0.71875rem] mt-0.5', d.urgent ? 'text-alert' : 'text-ink-3')}>
                        {d.urgent && (
                          <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-clay mr-1.5 align-middle" />
                        )}
                        {d.note}
                      </span>
                    </div>

                    {/* Mobile: status + toggle beside the date */}
                    <div className="flex items-baseline gap-4 md:hidden">
                      <StatusWord {...st} />
                    </div>

                    {/* Programme */}
                    <div className="col-span-2 md:col-span-1 min-w-0">
                      <Link
                        href={`/opportunity/${item.slug}`}
                        className="font-serif font-bold text-[1.25rem] leading-snug text-ink headline-link"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-3">
                        {item.organization} · {opportunityTypeLabel(item.category)}
                      </p>
                    </div>

                    {/* Value */}
                    <p className="col-span-2 md:col-span-1 text-sm text-ink-2 leading-snug">
                      <span className="meta mr-2 md:hidden">Value</span>
                      {item.fundingAmount ?? '—'}
                    </p>

                    {/* Equity */}
                    <p className="font-sans tabular text-sm text-ink-2 md:text-right">
                      <span className="meta mr-2 md:hidden">Equity</span>
                      {shortEquity(item.equityTaken)}
                    </p>

                    {/* Status (desktop) */}
                    <div className="hidden md:block">
                      <StatusWord {...st} />
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="justify-self-end font-sans text-sm text-ink-3 hover:text-clay transition-colors md:w-8 md:text-right"
                    >
                      <span className="md:hidden mr-1.5 text-[0.71875rem]">{open ? 'Less' : 'Details'}</span>
                      <span aria-hidden>{open ? '−' : '+'}</span>
                      <span className="sr-only">{open ? 'Hide details' : `Show details for ${item.title}`}</span>
                    </button>
                  </div>

                  {open && (
                    <div id={panelId} className="grid gap-8 pb-8 pt-1 md:grid-cols-12 md:pl-[10rem]">
                      <div className="md:col-span-7 space-y-5">
                        <p className="text-[0.9375rem] leading-relaxed text-ink-2">{item.description}</p>
                        {criteria.length > 0 && (
                          <div>
                            <p className="meta mb-2">Who can apply</p>
                            <NumberedList items={criteria} />
                          </div>
                        )}
                        {benefits.length > 0 && (
                          <div>
                            <p className="meta mb-2">What you get</p>
                            <NumberedList items={benefits} />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-5 md:border-l md:border-rule md:pl-8">
                        <dl className="text-sm">
                          <FactRow label="Location">{item.location ?? '—'}</FactRow>
                          <FactRow label="Source">
                            {item.sourceUrl ? (
                              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                                {item.sourceName} ↗
                              </a>
                            ) : (
                              item.sourceName
                            )}
                          </FactRow>
                          <FactRow label="Last checked">
                            <span className="font-sans tabular">{shortDate(item.verifiedAt)}</span>
                          </FactRow>
                        </dl>
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                          <a
                            href={item.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-quiet"
                          >
                            {d.closed ? 'Programme site' : 'Apply'} <span aria-hidden>↗</span>
                          </a>
                          <Link href={`/opportunity/${item.slug}`} className="group inline-flex items-center gap-2 text-ink">
                            <span className="link-rule">Full listing</span>
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

function statusWord(item: OpportunityItem, urgent: boolean, closed: boolean): { word: string; tone: 'moss' | 'clay' | 'faint' } {
  if (closed || item.isExpired || item.status === 'CLOSED') return { word: 'Closed', tone: 'faint' };
  if (urgent || item.status === 'CLOSING_SOON') return { word: 'Closing', tone: 'clay' };
  if (item.status === 'ROLLING') return { word: 'Rolling', tone: 'moss' };
  return { word: 'Open', tone: 'moss' };
}

function StatusWord({ word, tone }: { word: string; tone: 'moss' | 'clay' | 'faint' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-sans text-[0.75rem]',
        tone === 'moss' && 'text-moss',
        tone === 'clay' && 'text-alert',
        tone === 'faint' && 'text-ink-4'
      )}
    >
      {tone !== 'faint' && (
        <span className={cn('inline-block w-1.5 h-1.5 rounded-full', tone === 'moss' ? 'bg-moss' : 'bg-alert')} />
      )}
      {word}
    </span>
  );
}

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
  return (
    <label className="block min-w-0">
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

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="border-t border-rule">
      {items.map((t, i) => (
        <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-b border-rule py-2 text-sm text-ink-2 leading-snug">
          <span className="font-sans tabular text-[0.71875rem] text-ink-4 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
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
