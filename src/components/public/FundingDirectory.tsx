'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Coins, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Briefcase,
  Landmark,
  Building2,
  Users2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
  Layers
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
  { label: 'Sovereign Wealth & Gov', value: 'GOVERNMENT_FUND' },
  { label: 'Corporate VC', value: 'CORPORATE_VC' },
  { label: 'Angel Syndicates', value: 'ANGEL_NETWORK' },
  { label: 'Family Offices', value: 'FAMILY_OFFICE' },
  { label: 'Accelerator Funds', value: 'ACCELERATOR_FUND' },
];

const STAGE_FILTERS = [
  'ALL',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Growth',
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
        return type;
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
    activeOnly;

  return (
    <div className="space-y-6">
      {/* 1. Filter and Search Controls Box */}
      <div className="bg-[#F1F5F2] p-5 sm:p-6 rounded-lg border border-[#E2E8E4] shadow-xs space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search funds, sectors, portfolio champions, or CMA license (e.g. STV, Raed, FinTech, Tamara, 17188-37)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E2E8E4] rounded-md text-[#111827] placeholder:text-[#4B5563] focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] focus:border-[#0B6E4F] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#111827] p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Typology Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
              Capital Typology
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#0B6E4F] hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-all cursor-pointer',
                  selectedType === type.value
                    ? 'bg-[#0B6E4F] text-white shadow-xs font-bold'
                    : 'bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#E8F5EF] border border-[#E2E8E4] font-medium'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters: Stage & Regulatory Flags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8E4]">
          {/* Target Stage selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B5563] whitespace-nowrap">
              Target Stage:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {STAGE_FILTERS.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStage(st)}
                  className={cn(
                    'px-2.5 py-0.5 text-xs rounded-md transition-all cursor-pointer',
                    selectedStage === st
                      ? 'bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227] font-bold'
                      : 'bg-white text-[#4B5563] hover:text-[#111827] border border-[#E2E8E4]'
                  )}
                >
                  {st}
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
                'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all cursor-pointer',
                cmaOnly
                  ? 'bg-[#0B6E4F] text-white border-[#0B6E4F] font-bold shadow-xs'
                  : 'bg-white text-[#0B6E4F] border-[#0B6E4F]/30 hover:bg-[#E8F5EF] font-medium'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CMA Authorized Only</span>
            </button>

            {/* SVC Partner Toggle */}
            <button
              onClick={() => setSvcOnly(!svcOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all cursor-pointer',
                svcOnly
                  ? 'bg-[#C9A227] text-white border-[#C9A227] font-bold shadow-xs'
                  : 'bg-white text-[#9A7B1C] border-[#C9A227]/40 hover:bg-[#FDF8EC] font-medium'
              )}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>SVC Partner Funds</span>
            </button>

            {/* Active Investing Toggle */}
            <button
              onClick={() => setActiveOnly(!activeOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-all cursor-pointer',
                activeOnly
                  ? 'bg-[#19B5A3] text-white border-[#19B5A3] font-bold shadow-xs'
                  : 'bg-white text-[#0E7A6E] border-[#19B5A3]/40 hover:bg-[#E6FAF7] font-medium'
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

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#4B5563]">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="text-xs bg-white border border-[#E2E8E4] rounded-md px-2.5 py-1 text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0B6E4F]"
          >
            <option value="FEATURED">Featured &amp; Pillar Champions</option>
            <option value="NAME">Name (A–Z)</option>
            <option value="RECENT">Recently Verified</option>
          </select>
        </div>
      </div>

      {/* 3. Investors Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-[#E2E8E4] space-y-3">
          <Briefcase className="w-10 h-10 text-[#4B5563] mx-auto" />
          <h3 className="font-heading font-bold text-lg text-[#111827]">
            No institutional investors match your selected criteria
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-md mx-auto">
            Try resetting your regulatory, stage, or typology filters to browse active venture funds and sovereign vehicles in Saudi Arabia.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 text-xs font-semibold px-4 py-2 rounded-md bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-all cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const stages = Array.isArray(item.targetStages) ? item.targetStages : [];
            const sectors = Array.isArray(item.targetSectors) ? item.targetSectors : [];
            const portfolio = Array.isArray(item.portfolioHighlights) ? item.portfolioHighlights : [];

            return (
              <div
                key={item.id}
                className="group bg-white rounded-lg border border-[#E2E8E4] hover:border-[#0B6E4F]/50 hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Name, Typology, and Clear Regulatory Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/investor/${item.slug}`}
                          className="font-heading font-bold text-lg text-[#111827] group-hover:text-[#0B6E4F] hover:underline transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227]/40">
                            Pillar Lead
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#4B5563]">
                        <span className="font-semibold text-[#0B6E4F]">
                          {formatType(item.type)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#4B5563]" />
                          {item.hqLocation}
                        </span>
                        {item.isActiveInvesting && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B6E4F]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E4F] animate-pulse" />
                              Actively Deploying
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Strict Regulatory Badges (CMA vs SVC separated) */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {item.isCmaAuthorized && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/30">
                          <ShieldCheck className="w-3 h-3 text-[#0B6E4F]" />
                          CMA Authorized
                        </span>
                      )}

                      {item.isSvcPartner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227]/40">
                          <Landmark className="w-3 h-3 text-[#C9A227]" />
                          SVC Partner
                        </span>
                      )}

                      {!item.isCmaAuthorized && !item.isSvcPartner && item.regulatoryCategory && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F1F5F2] text-[#4B5563] border border-[#E2E8E4]">
                          {item.regulatoryCategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CMA License details if verified */}
                  {item.cmaLicenseNumber && (
                    <div className="text-[11px] text-[#0B6E4F] bg-[#E8F5EF] px-2.5 py-1 rounded-md border border-[#0B6E4F]/20 font-mono">
                      CMA: {item.cmaLicenseNumber}
                    </div>
                  )}

                  {/* Check Size & Target Stages Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#F1F5F2] rounded-md border border-[#E2E8E4] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4B5563] block">
                        Disclosed Check Size
                      </span>
                      <span className="font-bold text-[#111827]">
                        {item.checkSizeRange || 'Unspecified (Confidential)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4B5563] block">
                        Target Stages
                      </span>
                      <span className="font-medium text-[#111827]">
                        {stages.length > 0 ? stages.join(', ') : 'Early to Growth'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Target Sectors Chips */}
                  {sectors.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Sovereign Pillar &amp; Sector Focus:
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {sectors.map((sec: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[10px] font-semibold text-[#111827] border border-[#E2E8E4]"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Highlights */}
                  {portfolio.length > 0 && (
                    <div className="text-xs pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">
                        Verified Portfolio:
                      </span>
                      <span className="text-[#111827] font-medium text-[11px]">
                        {portfolio.join(' • ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Provenance + Actions */}
                <div className="pt-4 mt-4 border-t border-[#E2E8E4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[10px] text-slate-400">
                    <span>Verified {formatDate(item.verifiedAt)}</span>
                    {item.sourceName && (
                      <span className="block text-slate-400 truncate max-w-[220px]">
                        via {item.sourceName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/investor/${item.slug}`}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0B6E4F] hover:bg-[#08533C] text-white transition-all shadow-xs flex items-center gap-1"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-[#E2E8E4] text-[#111827] hover:bg-[#F1F5F2] font-medium transition-colors"
                    >
                      Website
                    </a>

                    {item.pitchUrl && (
                      <a
                        href={item.pitchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] hover:bg-[#E8F5EF] text-[#0B6E4F] font-semibold transition-all shadow-xs"
                      >
                        <span>Pitch</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
