'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Building2, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Code2, 
  TrendingUp,
  Package,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

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
  { label: 'All Stages', value: 'ALL' },
  { label: 'Pre-Seed', value: 'PRE_SEED' },
  { label: 'Seed', value: 'SEED' },
  { label: 'Series A', value: 'SERIES_A' },
  { label: 'Series B', value: 'SERIES_B' },
  { label: 'Series C+', value: 'SERIES_C' },
  { label: 'Growth / Scale', value: 'GROWTH' },
];

const MODEL_FILTERS = [
  { label: 'All Business Models', value: 'ALL' },
  { label: 'B2B', value: 'B2B' },
  { label: 'B2C', value: 'B2C' },
  { label: 'B2B2C', value: 'B2B2C' },
  { label: 'B2G', value: 'B2G' },
];

const CITY_FILTERS = [
  { label: 'All Cities', value: 'ALL' },
  { label: 'Riyadh', value: 'Riyadh' },
  { label: 'Jeddah', value: 'Jeddah' },
  { label: 'Tabuk / NEOM', value: 'Tabuk' },
  { label: 'Dhahran / Khobar', value: 'Dhahran' },
];

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
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.hqCity.toLowerCase().includes(q) ||
        (Array.isArray(item.products) &&
          item.products.some((p: string) => p.toLowerCase().includes(q))) ||
        (Array.isArray(item.techStack) &&
          item.techStack.some((t: string) => t.toLowerCase().includes(q)));

      // Stage
      const matchesStage = selectedStage === 'ALL' || item.stage === selectedStage;

      // Model
      const matchesModel = selectedModel === 'ALL' || item.businessModel === selectedModel;

      // Pillar
      const matchesPillar = selectedPillar === 'ALL' || item.category?.slug === selectedPillar;

      // City
      const matchesCity = selectedCity === 'ALL' || item.hqCity.toLowerCase().includes(selectedCity.toLowerCase());

      // CR Verified
      const matchesCr = !crOnly || item.crVerified === true;

      return matchesSearch && matchesStage && matchesModel && matchesPillar && matchesCity && matchesCr;
    });

    // Sorting
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

  const formatStage = (st: string) => {
    switch (st) {
      case 'PRE_SEED':
        return 'Pre-Seed';
      case 'SEED':
        return 'Seed';
      case 'SERIES_A':
        return 'Series A';
      case 'SERIES_B':
        return 'Series B';
      case 'SERIES_C':
        return 'Series C+';
      case 'GROWTH':
        return 'Growth / Scale';
      case 'BOOTSTRAPPED':
        return 'Bootstrapped';
      default:
        return st;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('ALL');
    setSelectedModel('ALL');
    setSelectedPillar('ALL');
    setSelectedCity('ALL');
    setCrOnly(false);
    setSelectedSort('RECENT');
  };

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedStage !== 'ALL' ||
    selectedModel !== 'ALL' ||
    selectedPillar !== 'ALL' ||
    selectedCity !== 'ALL' ||
    crOnly ||
    selectedSort !== 'RECENT';

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Filter and Search Controls Matrix */}
      <div className="bg-[#F1F5F2] p-5 sm:p-6 rounded-xl border border-[#E2E8E4] shadow-xs space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search Saudi startups, technology stacks, products, or founders (e.g. Mozn, Tamara, PyTorch, Open Banking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-[#E2E8E4] rounded-lg text-[#111827] placeholder:text-[#4B5563]/70 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#111827] p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Funding Stage Pills Navigation */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] uppercase tracking-wider">
            <span>Funding Stage</span>
            {isFilteringActive && (
              <button
                onClick={handleResetFilters}
                className="text-[#0B6E4F] hover:underline font-bold text-xs capitalize flex items-center gap-1 cursor-pointer"
              >
                <span>Reset All Filters</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STAGE_FILTERS.map((stage) => (
              <button
                key={stage.value}
                onClick={() => setSelectedStage(stage.value)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer',
                  selectedStage === stage.value
                    ? 'bg-[#0B6E4F] text-white shadow-xs font-bold'
                    : 'bg-white text-[#4B5563] hover:text-[#111827] hover:bg-white/80 border border-[#E2E8E4]'
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns Row: Pillar, City, Model, Sort & CR Verification */}
        <div className="pt-4 border-t border-[#E2E8E4] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Sovereign Pillar Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
              Sovereign Pillar
            </label>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#E2E8E4] text-[#111827] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              <option value="ALL">All Sovereign Pillars (6 Desks)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
              Headquarters City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#E2E8E4] text-[#111827] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {CITY_FILTERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Business Model Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
              Business Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#E2E8E4] text-[#111827] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {MODEL_FILTERS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
              Sort Order
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#E2E8E4] text-[#111827] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              <option value="RECENT">Recently Verified</option>
              <option value="NAME">Venture Name (A–Z)</option>
              <option value="STAGE">Funding Stage (Highest)</option>
              <option value="FOUNDING_YEAR">Founding Year (Newest)</option>
            </select>
          </div>

          {/* CR Verification Toggle */}
          <div className="h-10 flex items-center justify-start lg:justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111827] select-none bg-white px-3 py-2 rounded-lg border border-[#E2E8E4] hover:border-[#0B6E4F]/40 transition-colors">
              <input
                type="checkbox"
                checked={crOnly}
                onChange={(e) => setCrOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2E8E4] text-[#0B6E4F] focus:ring-[#0B6E4F] cursor-pointer accent-[#0B6E4F]"
              />
              <span className="flex items-center gap-1.5 text-[#111827]">
                <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                <span>CR Audited Only</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Directory Count & Provenance Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#4B5563] px-1">
        <p>
          Showing <span className="font-bold text-[#111827]">{filteredItems.length}</span> verified{' '}
          {filteredItems.length === 1 ? 'venture' : 'ventures'}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[#0B6E4F] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
          <span>Strict CR Provenance • Verified with Ministry of Commerce &amp; Wathiq</span>
        </div>
      </div>

      {/* 3. Startup Cards Grid (2-Column Architecture for Maximum Readability) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#E2E8E4] space-y-3">
          <Building2 className="w-10 h-10 text-[#4B5563] mx-auto" />
          <h3 className="font-heading font-bold text-lg text-[#111827]">No startups match your search</h3>
          <p className="text-sm text-[#4B5563] max-w-md mx-auto">
            Try adjusting your search criteria, stage filter, or headquarters city to explore the registry.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const techList = Array.isArray(item.techStack) ? item.techStack : [];
            const productList = Array.isArray(item.products) ? item.products : [];

            return (
              <article
                key={item.id}
                data-testid="startup-card"
                className="group bg-white rounded-xl border border-[#E2E8E4] hover:border-[#0B6E4F]/40 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Zone 1: Name, Tagline, CR Badge & Sector */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/startup/${item.slug}`} className="group/name">
                          <h3 className="font-heading font-black text-xl text-[#111827] group-hover/name:text-[#0B6E4F] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.crVerified && (
                          <span
                            title="Commercial Registration (CR) Audited via Ministry of Commerce / Wathiq"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/25"
                          >
                            <ShieldCheck className="w-3 h-3 text-[#0B6E4F]" />
                            <span>CR Audited</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#4B5563] line-clamp-1">
                        {item.tagline}
                      </p>
                    </div>

                    {item.category && (
                      <span
                        className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#F1F5F2] shrink-0 border border-[#E2E8E4]"
                        style={{ color: item.category.color }}
                      >
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  {/* Zone 2: Key Operational Metrics Ribbon */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-[#F1F5F2] text-[#111827] font-bold border border-[#E2E8E4]">
                      {formatStage(item.stage)}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#F1F5F2] text-[#4B5563] font-semibold border border-[#E2E8E4]">
                      {item.businessModel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#4B5563] bg-[#F1F5F2] px-2.5 py-1 rounded-md border border-[#E2E8E4] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#4B5563]" />
                      <span>{item.hqCity}</span>
                    </span>
                    <span className="text-xs text-[#4B5563] bg-[#F1F5F2] px-2.5 py-1 rounded-md border border-[#E2E8E4] font-medium">
                      Est. {item.foundingYear}
                    </span>
                  </div>

                  {/* Zone 3: Description */}
                  <p className="text-sm text-[#374151] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Zone 4: Key Milestone / Verified Traction */}
                  {item.keyMetrics && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#E8F5EF] border border-[#0B6E4F]/25 text-xs">
                      <TrendingUp className="w-4 h-4 text-[#0B6E4F] shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-[#111827] leading-snug">
                        {item.keyMetrics}
                      </span>
                    </div>
                  )}

                  {/* Zone 5: Products & Tech Stack Highlights */}
                  {(productList.length > 0 || techList.length > 0) && (
                    <div className="space-y-2 pt-1 border-t border-[#E2E8E4]">
                      {productList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mr-1 flex items-center gap-1">
                            <Package className="w-3 h-3 text-[#4B5563]" />
                            <span>Products:</span>
                          </span>
                          {productList.slice(0, 3).map((prod: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[11px] font-medium text-[#111827] border border-[#E2E8E4]"
                            >
                              {prod}
                            </span>
                          ))}
                          {productList.length > 3 && (
                            <span className="text-[11px] text-[#4B5563] font-medium">
                              +{productList.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {techList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mr-1 flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-[#4B5563]" />
                            <span>Tech:</span>
                          </span>
                          {techList.slice(0, 4).map((tech: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[11px] font-mono text-[#111827] border border-[#E2E8E4]"
                            >
                              {tech}
                            </span>
                          ))}
                          {techList.length > 4 && (
                            <span className="text-[11px] font-mono text-[#4B5563]">
                              +{techList.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Zone 6: Card Footer (Clear Action Button) */}
                <div className="pt-4 mt-5 border-t border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-xs text-[#4B5563] space-y-0.5">
                    <span className="text-[11px] text-slate-400 block">
                      Audited {formatDate(item.verifiedAt)}
                    </span>
                    {item.sourceName && (
                      <span className="text-[11px] text-[#4B5563] font-medium block truncate max-w-[200px]">
                        via {item.sourceName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#111827] text-xs font-bold border border-[#E2E8E4] transition-colors"
                    >
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link
                      href={`/startup/${item.slug}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0B6E4F] hover:bg-[#08533C] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>View Startup Dossier</span>
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