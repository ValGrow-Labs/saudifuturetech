'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Building2, 
  X,
  Info,
  Sparkles,
  ArrowRight,
  MapPin,
  Check
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

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
  { label: 'All Opportunities', value: 'ALL' },
  { label: 'Non-Dilutive Grants', value: 'GRANT' },
  { label: 'Accelerators', value: 'ACCELERATOR' },
  { label: 'Subsidies & Vouchers', value: 'SUBSIDY' },
  { label: 'Regulatory Sandboxes', value: 'GOVERNMENT_PROGRAM' },
  { label: 'Incubators', value: 'INCUBATOR' },
  { label: 'Compute Credits', value: 'SUBSIDIZED_PERK' },
  { label: 'Hackathons', value: 'HACKATHON' },
];

const ELIGIBILITY_OPTIONS = [
  { label: 'All Founder Terms', value: 'ALL' },
  { label: '100% Non-Dilutive (0% Equity)', value: 'NON_DILUTIVE' },
  { label: 'Saudi Commercial Registration (CR)', value: 'SAUDI_CR' },
  { label: 'Pre-Revenue / Working MVP', value: 'PRE_REVENUE_MVP' },
];

const STATUS_OPTIONS = [
  { label: 'All Tracked Programs', value: 'ALL' },
  { label: 'Open Admission Only', value: 'ACTIVE_ONLY' },
  { label: 'Open Now', value: 'OPEN' },
  { label: 'Closing Soon (< 14 Days)', value: 'CLOSING_SOON' },
  { label: 'Rolling Admission', value: 'ROLLING' },
  { label: 'Cohort Closed / Between Batches', value: 'CLOSED' },
];

const SORT_OPTIONS = [
  { label: 'Application Deadline (Soonest)', value: 'deadline-asc' },
  { label: 'Recently Verified', value: 'verified-desc' },
  { label: 'Program Name (A to Z)', value: 'title-asc' },
];

const formatCategoryBadge = (category: string) => {
  switch (category) {
    case 'GRANT':
      return 'Non-Dilutive Grant';
    case 'ACCELERATOR':
      return 'Accelerator Cohort';
    case 'SUBSIDY':
      return 'Government Subsidy';
    case 'GOVERNMENT_PROGRAM':
      return 'Regulatory Sandbox';
    case 'INCUBATOR':
      return 'Incubation Cohort';
    case 'SUBSIDIZED_PERK':
      return 'Compute Credits & Perks';
    case 'HACKATHON':
      return 'National Hackathon';
    default:
      return category.replace(/_/g, ' ');
  }
};

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

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPillar, setSelectedPillar] = useState(initialPillar);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedEligibility, setSelectedEligibility] = useState(initialEligibility);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Modal Detail State
  const [activeModalItem, setActiveModalItem] = useState<OpportunityItem | null>(null);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPillar('ALL');
    setSelectedStatus('ACTIVE_ONLY');
    setSelectedEligibility('ALL');
    setSelectedSort('deadline-asc');
    router.replace(pathname, { scroll: false });
  };

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'ALL' ||
    selectedPillar !== 'ALL' ||
    selectedStatus !== 'ACTIVE_ONLY' ||
    selectedEligibility !== 'ALL' ||
    selectedSort !== 'deadline-asc';

  // Client-Side Computed List
  const filteredItems = useMemo(() => {
    let result = [...initialOpportunities];

    // 1. Text Search
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

    // 2. Category Tab
    if (selectedCategory !== 'ALL') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 3. Sovereign Pillar
    if (selectedPillar !== 'ALL') {
      result = result.filter((item) => item.categoryRel?.slug === selectedPillar);
    }

    // 4. Status Filter
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

    // 5. Eligibility Stage Filter
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
          return text.includes('mvp') || text.includes('prototype') || text.includes('seed') || text.includes('pre-seed') || text.includes('early');
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

  // Format deadline badge helper
  const renderDeadlineBadge = (deadlineStr: string | null, status: string, isExpired?: boolean) => {
    if (isExpired || status === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F2] text-[#4B5563] border border-[#E2E8E4]">
          <Clock className="w-3.5 h-3.5 text-[#4B5563]" />
          <span>Cohort Closed</span>
        </span>
      );
    }

    if (!deadlineStr) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/30">
          <Clock className="w-3.5 h-3.5 text-[#0B6E4F]" />
          <span>Rolling Admission</span>
        </span>
      );
    }

    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F2] text-[#4B5563] border border-[#E2E8E4]">
          <Clock className="w-3.5 h-3.5 text-[#4B5563]" />
          <span>Cohort Closed</span>
        </span>
      );
    } else if (diffDays <= 14) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227]">
          <Clock className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
          <span>Closes in {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/30">
          <Calendar className="w-3.5 h-3.5 text-[#0B6E4F]" />
          <span>Closes {formatDate(deadline)}</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ==================================================================== */}
      {/* 1. FILTER & SEARCH CONTROL MATRIX                                    */}
      {/* ==================================================================== */}
      <div className="bg-[#F1F5F2] dark:bg-[#102433] p-5 sm:p-6 rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] shadow-xs space-y-5">
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] dark:text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search verified grants, accelerator cohorts, or government entities (e.g. NTDP, The Garage, SAMA)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] rounded-lg text-[#111827] dark:text-[#FAF9F6] placeholder:text-[#4B5563]/70 dark:placeholder:text-[#94A3B8]/70 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white p-1"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Opportunity Category Navigation Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] dark:text-[#94A3B8] uppercase tracking-wider">
            <span>Opportunity Classification</span>
            {isFilteringActive && (
              <button
                onClick={handleResetFilters}
                className="text-[#0B6E4F] dark:text-[#19B5A3] hover:underline font-bold text-xs capitalize flex items-center gap-1 cursor-pointer"
              >
                <span>Reset All Filters</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleCategoryChange(tab.value)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer',
                  selectedCategory === tab.value
                    ? 'bg-[#0B6E4F] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#132B3D] text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#1A374D] border border-[#E2E8E4] dark:border-[#1E3A4C]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Detailed Filter Bar (Pillar, Eligibility, Status, Sort) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-[#E2E8E4] dark:border-[#1E3A4C]">
          {/* 1. Technology Pillar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] block">
              Sovereign Pillar
            </label>
            <select
              value={selectedPillar}
              onChange={(e) => handlePillarChange(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] text-[#111827] dark:text-[#FAF9F6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              <option value="ALL">All Sovereign Pillars (6 Desks)</option>
              {availablePillars.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Eligibility Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] block">
              Founder Terms &amp; Equity
            </label>
            <select
              value={selectedEligibility}
              onChange={(e) => handleEligibilityChange(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] text-[#111827] dark:text-[#FAF9F6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {ELIGIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Cohort Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] block">
              Admission Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] text-[#111827] dark:text-[#FAF9F6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sorting */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] block">
              Sort Order
            </label>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] text-[#111827] dark:text-[#FAF9F6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. RESULTS SUMMARY BAR                                               */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4B5563] px-1">
        <p>
          Showing <span className="font-bold text-[#111827]">{filteredItems.length}</span> verified{' '}
          {filteredItems.length === 1 ? 'opportunity' : 'opportunities'}
          {selectedCategory !== 'ALL' && <span> in this category</span>}
        </p>
        <div className="flex items-center gap-2 text-xs text-[#0B6E4F] font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#0B6E4F]" />
          <span>Every program verified directly with official ministerial &amp; accelerator portals</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. OPPORTUNITIES GRID (Clean 2-Column Readable Architecture)           */}
      {/* ==================================================================== */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 text-center rounded-xl border border-[#E2E8E4] space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F2] flex items-center justify-center mx-auto text-[#4B5563]">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-[#111827]">
              No matching verified opportunities found
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              We did not find any opportunities matching your active combination of filters. Try broadening your criteria or reset the search filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-lg bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-all shadow-xs cursor-pointer"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const criteriaList = Array.isArray(item.eligibilityCriteria)
              ? (item.eligibilityCriteria as string[])
              : [];

            return (
              <article
                key={item.id}
                className="group bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between relative"
              >
                <div className="space-y-4">
                  {/* Zone 1: Organization, Type & Status Ribbon */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/20 dark:border-[#19B5A3]/30">
                          {formatCategoryBadge(item.category)}
                        </span>
                        {item.categoryRel && (
                          <span
                            className="text-[11px] uppercase font-bold tracking-wider inline-block px-2 py-0.5 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C]"
                            style={{ color: item.categoryRel.color }}
                          >
                            {item.categoryRel.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] dark:text-[#94A3B8] pt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#0A1F2C] dark:text-[#C9A227]" />
                        <span>{item.organization}</span>
                      </div>
                    </div>
                    <div className="shrink-0">{renderDeadlineBadge(item.deadline, item.status, item.isExpired)}</div>
                  </div>

                  {/* Zone 2: Program Title */}
                  <Link href={`/opportunity/${item.slug}`} className="block focus:outline-none focus:underline group/title">
                    <h3 className="font-heading font-black text-xl text-[#111827] dark:text-[#FAF9F6] group-hover/title:text-[#0B6E4F] dark:group-hover/title:text-[#19B5A3] leading-snug transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Zone 3: Key Offer Strip (Capital / Support & Equity Terms) */}
                  <div className="p-3.5 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-[#FAF9F6]">
                      <div className="w-6 h-6 rounded-md bg-[#E8F5EF] dark:bg-[#0B6E4F]/25 flex items-center justify-center shrink-0 text-[#0B6E4F] dark:text-[#19B5A3]">
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-tight">{item.fundingAmount || 'Non-Cash Advisory & Sandbox Framework'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                      {item.equityTaken && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-white dark:bg-[#102433] text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/30 dark:border-[#19B5A3]/30 shadow-2xs">
                          <Check className="w-3 h-3 text-[#0B6E4F] dark:text-[#19B5A3]" />
                          <span>{item.equityTaken}</span>
                        </span>
                      )}
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#4B5563] dark:text-[#94A3B8] bg-white dark:bg-[#102433] px-2.5 py-0.5 rounded-md border border-[#E2E8E4] dark:border-[#1E3A4C]">
                          <MapPin className="w-3 h-3 text-[#4B5563] dark:text-[#94A3B8]" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Zone 4: Program Description */}
                  <p className="text-sm text-[#374151] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Zone 5: Quick Checklist Pill */}
                  {criteriaList.length > 0 && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F5EF] dark:bg-[#0B6E4F]/25 hover:bg-[#D5EFE3] dark:hover:bg-[#0B6E4F]/40 text-[#0B6E4F] dark:text-[#19B5A3] text-xs font-bold transition-colors cursor-pointer border border-[#0B6E4F]/20 dark:border-[#19B5A3]/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#19B5A3]" />
                        <span>{criteriaList.length} Verified Prerequisites • View Checklist →</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Zone 6: Card Footer (Clear Provenance + Distinct Action Buttons) */}
                <div className="pt-4 mt-5 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-xs text-[#4B5563] dark:text-[#94A3B8] space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="font-medium text-[#4B5563] dark:text-[#94A3B8]">Source:</span>
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#111827] dark:text-[#FAF9F6] hover:text-[#0B6E4F] dark:hover:text-[#19B5A3] hover:underline font-bold inline-flex items-center gap-0.5"
                        >
                          <span className="truncate max-w-[200px]">{item.sourceName}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-bold text-[#111827] dark:text-[#FAF9F6] truncate max-w-[200px]">{item.sourceName}</span>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                      Audited {formatDate(item.verifiedAt)}
                      {item.verifiedBy && ` • ${item.verifiedBy}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/opportunity/${item.slug}`}
                      className="px-4 py-2 rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C] bg-[#F1F5F2] dark:bg-[#132B3D] hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] text-[#111827] dark:text-[#FAF9F6] font-bold transition-colors text-xs"
                    >
                      Dossier
                    </Link>
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B6E4F] hover:bg-[#08533C] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. ELIGIBILITY & BENEFITS POPUP MODAL                                */}
      {/* ==================================================================== */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1F2C]/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E8E4] dark:border-[#1E3A4C]">
              <div>
                <span className="text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3] uppercase tracking-wider block">
                  {activeModalItem.organization}
                </span>
                <h3 className="font-heading font-black text-xl text-[#111827] dark:text-[#FAF9F6] pt-1">
                  {activeModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-lg text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-[#F1F5F2] dark:hover:bg-[#132B3D] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C]">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] dark:text-[#94A3B8] block">Support Value</span>
                <span className="font-bold text-sm text-[#111827] dark:text-[#FAF9F6] pt-0.5 block">{activeModalItem.fundingAmount || 'Non-Cash Program'}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C]">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] dark:text-[#94A3B8] block">Equity Terms</span>
                <span className="font-bold text-sm text-[#0B6E4F] dark:text-[#19B5A3] pt-0.5 block">{activeModalItem.equityTaken || '0% Equity'}</span>
              </div>
            </div>

            {/* Verified Benefits Package */}
            {Array.isArray(activeModalItem.benefits) && activeModalItem.benefits.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-[#FAF9F6] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C9A227]" />
                  <span>Verified Founder Benefits Package</span>
                </h4>
                <div className="space-y-2">
                  {activeModalItem.benefits.map((b: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#111827] dark:text-[#FAF9F6] bg-[#F1F5F2] dark:bg-[#132B3D] p-3 rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C]">
                      <span className="text-[#0B6E4F] dark:text-[#19B5A3] font-black mt-0.5">✦</span>
                      <span className="leading-relaxed font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Criteria Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-[#FAF9F6] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B6E4F] dark:text-[#19B5A3]" />
                <span>Eligibility Prerequisites</span>
              </h4>
              <div className="space-y-2">
                {Array.isArray(activeModalItem.eligibilityCriteria) &&
                  activeModalItem.eligibilityCriteria.map((c: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#111827] dark:text-[#FAF9F6] bg-[#F1F5F2] dark:bg-[#132B3D] p-3 rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C]">
                      <span className="text-[#0B6E4F] dark:text-[#19B5A3] font-black mt-0.5">✓</span>
                      <span className="leading-relaxed font-medium">{c}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex items-center justify-between gap-3">
              <Link
                href={`/opportunity/${activeModalItem.slug}`}
                onClick={() => setActiveModalItem(null)}
                className="text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3] hover:underline flex items-center gap-1"
              >
                <span>Read Full Intelligence Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={activeModalItem.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0B6E4F] hover:bg-[#08533C] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};