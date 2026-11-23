'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Briefcase,
  Landmark,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Coins
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

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
  { label: 'All Typologies', value: 'ALL' },
  { label: 'Venture Capital', value: 'VENTURE_CAPITAL' },
  { label: 'Sovereign & Gov Funds', value: 'GOVERNMENT_FUND' },
  { label: 'Corporate VC', value: 'CORPORATE_VC' },
  { label: 'Angel Syndicates', value: 'ANGEL_NETWORK' },
  { label: 'Family Offices', value: 'FAMILY_OFFICE' },
  { label: 'Accelerator Funds', value: 'ACCELERATOR_FUND' },
];

const STAGE_FILTERS = [
  { label: 'All Stages', value: 'ALL' },
  { label: 'Pre-Seed', value: 'Pre-Seed' },
  { label: 'Seed', value: 'Seed' },
  { label: 'Series A', value: 'Series A' },
  { label: 'Series B', value: 'Series B' },
  { label: 'Growth', value: 'Growth' },
];

export const FundingDirectory: React.FC<FundingDirectoryProps> = ({
  initialInvestors,
  initialQuery = '',
  initialType = 'ALL',
  initialStage = 'ALL',
  initialSector = 'ALL',
  initialCmaOnly = false,
  initialSvcOnly = false,
  initialActiveOnly = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [cmaOnly, setCmaOnly] = useState(initialCmaOnly);
  const [svcOnly, setSvcOnly] = useState(initialSvcOnly);
  const [activeOnly, setActiveOnly] = useState(initialActiveOnly);
  const [sortOption, setSortOption] = useState<'FEATURED' | 'NAME' | 'RECENT'>('FEATURED');

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

  const filteredItems = useMemo(() => {
    let list = initialInvestors.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesHq = item.hqLocation.toLowerCase().includes(query);
        const matchesRegCat = Boolean(item.regulatoryCategory && item.regulatoryCategory.toLowerCase().includes(query));
        const matchesCma = Boolean(item.cmaLicenseNumber && item.cmaLicenseNumber.toLowerCase().includes(query));
        const matchesSectors = Array.isArray(item.targetSectors) &&
          item.targetSectors.some((s: string) => s.toLowerCase().includes(query));
        const matchesPortfolio = Array.isArray(item.portfolioHighlights) &&
          item.portfolioHighlights.some((p: string) => p.toLowerCase().includes(query));

        if (!matchesName && !matchesDesc && !matchesHq && !matchesRegCat && !matchesCma && !matchesSectors && !matchesPortfolio) {
          return false;
        }
      }

      // 2. Typology Filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // 3. Stage Filter
      if (selectedStage !== 'ALL') {
        const stages = Array.isArray(item.targetStages) ? (item.targetStages as string[]) : [];
        const matchesStage = stages.some((st) => st.toLowerCase().includes(selectedStage.toLowerCase()));
        if (!matchesStage) return false;
      }

      // 4. Regulatory: CMA-Authorized Only
      if (cmaOnly && !item.isCmaAuthorized) {
        return false;
      }

      // 5. Regulatory: SVC Partner Only
      if (svcOnly && !item.isSvcPartner) {
        return false;
      }

      // 6. Active Investing Only
      if (activeOnly && !item.isActiveInvesting) {
        return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortOption === 'NAME') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'RECENT') {
        return new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime();
      }
      // FEATURED
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [initialInvestors, searchQuery, selectedType, selectedStage, cmaOnly, svcOnly, activeOnly, sortOption]);

  const formatType = (type: string) => {
    switch (type) {
      case 'VENTURE_CAPITAL':
        return 'Venture Capital';
      case 'GOVERNMENT_FUND':
        return 'Sovereign / Gov Fund';
      case 'CORPORATE_VC':
        return 'Corporate VC (CVC)';
      case 'ANGEL_NETWORK':
        return 'Angel Syndicate';
      case 'FAMILY_OFFICE':
        return 'Family Office';
      case 'ACCELERATOR_FUND':
        return 'Accelerator Seed Fund';
      default:
        return type.replace(/_/g, ' ');
    }
  };

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
    Boolean(searchQuery) ||
    selectedType !== 'ALL' ||
    selectedStage !== 'ALL' ||
    cmaOnly ||
    svcOnly ||
    activeOnly ||
    sortOption !== 'FEATURED';

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Filter and Search Controls Box */}
      <div className="bg-[#F1F5F2] dark:bg-[#102433] p-5 sm:p-6 rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] shadow-xs space-y-5">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] dark:text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search funds, sectors, portfolio champions, or CMA license (e.g. STV, Raed, FinTech, Tamara, 17188-37)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] rounded-lg text-[#111827] dark:text-[#FAF9F6] placeholder:text-[#4B5563]/70 dark:placeholder:text-[#94A3B8]/70 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Typology Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] dark:text-[#94A3B8] uppercase tracking-wider">
            <span>Capital Typology</span>
            {hasActiveFilters && (
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
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer',
                  selectedType === type.value
                    ? 'bg-[#0B6E4F] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#132B3D] text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#1A374D] border border-[#E2E8E4] dark:border-[#1E3A4C]'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters: Stage & Regulatory Flags */}
        <div className="pt-4 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex flex-wrap items-center justify-between gap-4">
          {/* Target Stage selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8]">
              Target Stage:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {STAGE_FILTERS.map((st) => (
                <button
                  key={st.value}
                  onClick={() => setSelectedStage(st.value)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-all cursor-pointer font-medium',
                    selectedStage === st.value
                      ? 'bg-[#FDF8EC] dark:bg-[#C9A227]/25 text-[#9A7B1C] dark:text-[#F4C542] border border-[#C9A227] font-bold shadow-2xs'
                      : 'bg-white dark:bg-[#132B3D] text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white border border-[#E2E8E4] dark:border-[#1E3A4C]'
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Strict Regulatory Toggles: CMA vs SVC vs Active */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CMA Authorized Toggle */}
            <button
              onClick={() => setCmaOnly(!cmaOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer',
                cmaOnly
                  ? 'bg-[#0B6E4F] text-white border-[#0B6E4F] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#132B3D] text-[#0B6E4F] dark:text-[#19B5A3] border-[#0B6E4F]/30 hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] font-semibold'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CMA Authorized Only</span>
            </button>

            {/* SVC Partner Toggle */}
            <button
              onClick={() => setSvcOnly(!svcOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer',
                svcOnly
                  ? 'bg-[#C9A227] text-white border-[#C9A227] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#132B3D] text-[#9A7B1C] dark:text-[#F4C542] border-[#C9A227]/40 hover:bg-[#FDF8EC] dark:hover:bg-[#1A374D] font-semibold'
              )}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>SVC Partner Funds</span>
            </button>

            {/* Active Investing Toggle */}
            <button
              onClick={() => setActiveOnly(!activeOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer',
                activeOnly
                  ? 'bg-[#0B6E4F] text-white border-[#0B6E4F] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#132B3D] text-[#0B6E4F] dark:text-[#19B5A3] border-[#0B6E4F]/30 hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] font-semibold'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Actively Deploying</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Results Count & Sort Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#4B5563] px-1">
        <p>
          Showing <span className="font-bold text-[#111827]">{filteredItems.length}</span> verified{' '}
          {filteredItems.length === 1 ? 'institutional investor' : 'institutional investors'}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#4B5563]">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-[#E2E8E4] rounded-lg px-3 py-1.5 text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
          >
            <option value="FEATURED">Featured &amp; Pillar Champions</option>
            <option value="NAME">Name (A–Z)</option>
            <option value="RECENT">Recently Verified</option>
          </select>
        </div>
      </div>

      {/* 3. Investors Grid (Clean 2-Column Structure for Optimal Readability) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#E2E8E4] space-y-3">
          <Briefcase className="w-10 h-10 text-[#4B5563] mx-auto" />
          <h3 className="font-heading font-bold text-lg text-[#111827]">
            No institutional investors match your selected criteria
          </h3>
          <p className="text-sm text-[#4B5563] max-w-md mx-auto">
            Try resetting your regulatory, stage, or typology filters to browse active venture funds and sovereign vehicles in Saudi Arabia.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-all cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const stages = Array.isArray(item.targetStages) ? item.targetStages : [];
            const sectors = Array.isArray(item.targetSectors) ? item.targetSectors : [];
            const portfolio = Array.isArray(item.portfolioHighlights) ? item.portfolioHighlights : [];

            return (
              <article
                key={item.id}
                className="group bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Zone 1: Investor Name, Typology & Regulatory Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/investor/${item.slug}`}
                          className="font-heading font-black text-xl text-[#111827] dark:text-[#FAF9F6] group-hover:text-[#0B6E4F] dark:group-hover:text-[#19B5A3] transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.isFeatured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FDF8EC] dark:bg-[#C9A227]/25 text-[#9A7B1C] dark:text-[#F4C542] border border-[#C9A227]/40">
                            Pillar Lead
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#4B5563] dark:text-[#94A3B8]">
                        <span className="font-bold text-[#0B6E4F] dark:text-[#19B5A3]">
                          {formatType(item.type)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#94A3B8]" />
                          {item.hqLocation}
                        </span>
                        {item.isActiveInvesting && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3]">
                              <span className="w-2 h-2 rounded-full bg-[#0B6E4F] dark:bg-[#19B5A3] animate-pulse" />
                              Actively Deploying
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Strict Regulatory Badges (CMA vs SVC separated) */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {item.isCmaAuthorized && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/30 dark:border-[#19B5A3]/30">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#19B5A3]" />
                          CMA Authorized
                        </span>
                      )}

                      {item.isSvcPartner && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FDF8EC] dark:bg-[#C9A227]/20 text-[#9A7B1C] dark:text-[#F4C542] border border-[#C9A227]/40 dark:border-[#C9A227]/50">
                          <Landmark className="w-3.5 h-3.5 text-[#C9A227]" />
                          SVC Partner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Zone 2: Check Size & Target Stages (Clean Box Architecture) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F1F5F2] dark:bg-[#132B3D] rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4B5563] dark:text-[#94A3B8] block">
                        Typical Ticket Size
                      </span>
                      <span className="font-black text-sm text-[#111827] dark:text-[#FAF9F6] pt-0.5 block">
                        {item.checkSizeRange || 'Unspecified (Confidential)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4B5563] dark:text-[#94A3B8] block">
                        Target Stages
                      </span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {stages.length > 0 ? (
                          stages.map((st: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white dark:bg-[#102433] text-[11px] font-bold text-[#111827] dark:text-[#FAF9F6] border border-[#E2E8E4] dark:border-[#1E3A4C]"
                            >
                              {st}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B5563] dark:text-[#94A3B8] font-medium">Early to Growth</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Zone 3: Investment Focus & Thesis Description */}
                  <p className="text-sm text-[#374151] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                    {item.thesisSummary || item.description}
                  </p>

                  {/* Zone 4: Target Sectors & Portfolio Highlights */}
                  {(sectors.length > 0 || portfolio.length > 0) && (
                    <div className="space-y-2 pt-1 border-t border-[#E2E8E4] dark:border-[#1E3A4C]">
                      {sectors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] mr-1">
                            Sectors:
                          </span>
                          {sectors.map((sec: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] text-[11px] font-bold text-[#111827] dark:text-[#FAF9F6] border border-[#E2E8E4] dark:border-[#1E3A4C]"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      )}

                      {portfolio.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] mr-1">
                            Backed:
                          </span>
                          <span className="text-[#111827] dark:text-[#FAF9F6] font-semibold text-xs">
                            {portfolio.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Zone 5: Card Footer (Clear Action Buttons & Verification) */}
                <div className="pt-4 mt-5 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-xs text-[#4B5563] dark:text-[#94A3B8] space-y-0.5">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      Audited {formatDate(item.verifiedAt)}
                    </span>
                    {item.cmaLicenseNumber ? (
                      <span className="text-[10px] text-[#0B6E4F] dark:text-[#19B5A3] font-mono font-bold block">
                        CMA: {item.cmaLicenseNumber}
                      </span>
                    ) : item.sourceName ? (
                      <span className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-medium block truncate max-w-[200px]">
                        via {item.sourceName}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C] text-[#111827] dark:text-[#FAF9F6] bg-[#F1F5F2] dark:bg-[#132B3D] hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] text-xs font-bold transition-colors"
                    >
                      Website
                    </a>

                    {item.pitchUrl && (
                      <a
                        href={item.pitchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] text-[#0B6E4F] dark:text-[#19B5A3] text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Pitch</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <Link
                      href={`/investor/${item.slug}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0B6E4F] hover:bg-[#08533C] text-white transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};