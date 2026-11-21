'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Building, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  X, 
  Code2, 
  TrendingUp,
  Package,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Coins
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
  { label: 'Growth / Public', value: 'GROWTH' },
];

const MODEL_FILTERS = [
  { label: 'All Models', value: 'ALL' },
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

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Filter and Search Controls */}
      <div className="bg-[#F1F5F2] p-5 sm:p-6 rounded-lg border border-[#E2E8E4] shadow-xs space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search Saudi startups, technology stacks, products, or founders (e.g. Mozn, Tamara, PyTorch, Open Banking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-[#E2E8E4] rounded-md text-[#111827] placeholder:text-[#4B5563] focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] focus:border-[#0B6E4F] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#111827]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stage Pills Navigation */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
            Funding Stage Classification
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGE_FILTERS.map((stage) => (
              <button
                key={stage.value}
                onClick={() => setSelectedStage(stage.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer',
                  selectedStage === stage.value
                    ? 'bg-[#0B6E4F] text-white shadow-xs font-semibold'
                    : 'bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#E8F5EF] border border-[#E2E8E4]'
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns Row: Pillar, City, Model, Sort & CR Verification */}
        <div className="pt-4 border-t border-[#E2E8E4] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Sovereign Pillar Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
              Sovereign Pillar
            </label>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E8E4] text-[#111827] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              <option value="ALL">All Pillars (6 Desks)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
              Headquarters City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E8E4] text-[#111827] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {CITY_FILTERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Business Model Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
              Business Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E8E4] text-[#111827] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              {MODEL_FILTERS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
              Sort Order
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full text-xs bg-white border border-[#E2E8E4] text-[#111827] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0B6E4F] cursor-pointer"
            >
              <option value="RECENT">Recently Verified</option>
              <option value="NAME">Venture Name (A–Z)</option>
              <option value="STAGE">Funding Stage (Highest)</option>
              <option value="FOUNDING_YEAR">Founding Year (Newest)</option>
            </select>
          </div>

          {/* CR Verification Toggle */}
          <div className="space-y-1 pt-4 sm:pt-0 flex items-center justify-start lg:justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111827] select-none">
              <input
                type="checkbox"
                checked={crOnly}
                onChange={(e) => setCrOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2E8E4] text-[#0B6E4F] focus:ring-[#0B6E4F] cursor-pointer"
              />
              <span className="flex items-center gap-1 text-[#111827]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B6E4F]" />
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
        <div className="flex items-center gap-1.5 text-[11px] text-[#0B6E4F] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B6E4F]" />
          <span>Strict CR Provenance • Zero Fabricated Valuations</span>
        </div>
      </div>

      {/* 3. Startup Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-[#E2E8E4] space-y-3">
          <Building className="w-8 h-8 text-[#4B5563] mx-auto" />
          <h3 className="font-heading font-bold text-lg text-[#111827]">No startups match your search</h3>
          <p className="text-sm text-[#4B5563] max-w-md mx-auto">
            Try adjusting your search criteria, stage filter, or headquarters city to explore the registry.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 text-xs font-semibold px-4 py-2 rounded-md bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const techList = Array.isArray(item.techStack) ? item.techStack : [];
            const productList = Array.isArray(item.products) ? item.products : [];

            return (
              <article
                key={item.id}
                data-testid="startup-card"
                className="group bg-white rounded-lg border border-[#E2E8E4] hover:border-[#0B6E4F]/50 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Top Header: Name, Verified CR Badge & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/startup/${item.slug}`}>
                          <h3 className="font-heading font-bold text-lg text-[#111827] hover:text-[#0B6E4F] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.crVerified ? (
                          <span
                            title="Commercial Registration (CR) Verified with Ministry of Commerce / Wathiq"
                            className="text-[#0B6E4F] inline-flex"
                          >
                            <ShieldCheck className="w-4 h-4 fill-[#0B6E4F]/10 text-[#0B6E4F]" />
                          </span>
                        ) : (
                          <span
                            title="Self-Disclosed Registry Listing"
                            className="text-slate-400 inline-flex text-[10px]"
                          >
                            (Registry)
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#4B5563] line-clamp-1">
                        {item.tagline}
                      </p>
                    </div>

                    {item.category && (
                      <span
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F2] shrink-0 border border-[#E2E8E4]"
                        style={{ color: item.category.color }}
                      >
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  {/* Metadata Chips: Stage, Model, HQ, Founding Year */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[#111827] font-semibold border border-[#E2E8E4]">
                      {formatStage(item.stage)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[#4B5563] font-medium border border-[#E2E8E4]">
                      {item.businessModel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#4B5563] px-1.5 py-0.5">
                      <MapPin className="w-3 h-3 text-[#4B5563]" />
                      <span>{item.hqCity}</span>
                    </span>
                    <span className="text-slate-400 px-1">
                      Est. {item.foundingYear}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Verified Products */}
                  {productList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#4B5563]" />
                        <span>Core Products</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {productList.slice(0, 3).map((prod: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F1F5F2] text-[10px] font-medium text-[#111827] border border-[#E2E8E4]"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Pills */}
                  {techList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-[#4B5563]" />
                        <span>Verified Tech Stack</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {techList.slice(0, 4).map((tech: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded-md bg-[#F1F5F2] text-[10px] font-mono text-[#111827] border border-[#E2E8E4]"
                          >
                            {tech}
                          </span>
                        ))}
                        {techList.length > 4 && (
                          <span className="text-[10px] font-mono text-slate-400 pl-0.5">
                            +{techList.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Metrics / Regulatory Milestone */}
                  {item.keyMetrics && (
                    <div className="flex items-start gap-1.5 p-2.5 rounded-md bg-[#E8F5EF] border border-[#0B6E4F]/20 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0B6E4F] shrink-0 mt-0.5" />
                      <span className="text-[11px] font-medium text-[#111827] leading-snug">
                        {item.keyMetrics}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Audit Strip */}
                <div className="pt-4 mt-4 border-t border-[#E2E8E4] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">
                      Audited {formatDate(item.verifiedAt)}
                    </span>
                    {item.sourceName && (
                      <span className="text-[10px] text-[#4B5563] line-clamp-1 font-medium">
                        {item.sourceName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/startup/${item.slug}`}
                      className="px-3 py-1.5 rounded-md bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#111827] font-semibold text-xs border border-[#E2E8E4] transition-colors"
                    >
                      Dossier
                    </Link>
                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white text-xs font-semibold transition-colors"
                    >
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
