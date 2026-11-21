import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { 
  getStartupBySlug, 
  getAllStartupSlugs, 
  getRelatedStartups 
} from '@/lib/founder-intelligence';
import { formatDate, cn } from '@/lib/utils';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Code2, 
  TrendingUp, 
  Layers, 
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Info,
  Package,
  Coins,
  Shield,
  FileText
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllStartupSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    return {
      title: 'Startup Not Found | Saudi Future Tech',
    };
  }

  return {
    title: `${startup.name} (${startup.stage}) | Saudi Tech Directory`,
    description: startup.tagline,
    openGraph: {
      title: `${startup.name} — Verified Saudi Tech Venture`,
      description: startup.description.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    notFound();
  }

  const related = await getRelatedStartups(startup.categoryId, startup.id, 3);
  const techList = Array.isArray(startup.techStack) ? (startup.techStack as string[]) : [];
  const productList = Array.isArray(startup.products) ? (startup.products as string[]) : [];
  const investorList = Array.isArray(startup.investorsDisclosed) ? (startup.investorsDisclosed as string[]) : [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Startups', href: '/startups' },
    { label: startup.name, current: true },
  ];

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

  // Structured Data (Schema.org Corporation)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: startup.name,
    description: startup.description,
    url: startup.websiteUrl,
    foundingDate: `${startup.foundingYear}-01-01`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: startup.hqCity,
      addressCountry: 'SA',
    },
    knowsAbout: techList,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827] font-sans">
      <SiteHeader />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 pb-24">
        {/* 1. Header Banner & Company Masthead */}
        <div className="bg-[#F1F5F2] border-b border-[#E2E8E4] py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="space-y-3 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#111827] border border-[#E2E8E4]">
                  <Building2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
                  <span>Saudi Venture Registry</span>
                </span>

                {startup.category && (
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${startup.category.color}15`,
                      color: startup.category.color,
                      border: `1px solid ${startup.category.color}30`
                    }}
                  >
                    {startup.category.name}
                  </span>
                )}

                {startup.crVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F5EF] border border-[#0B6E4F]/30 text-xs text-[#0B6E4F] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                    <span>Commercial Registration (CR) Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-[#4B5563]">
                    <Info className="w-3.5 h-3.5" />
                    <span>Self-Disclosed Registry Profile</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                {startup.name}
              </h1>

              <p className="text-base sm:text-lg text-[#111827] font-medium leading-relaxed">
                {startup.tagline}
              </p>
            </div>

            {/* 4-Stat Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <div className="p-4 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                  Funding Stage
                </span>
                <span className="text-sm sm:text-base font-heading font-black text-[#0B6E4F] block pt-1">
                  {formatStage(startup.stage)}
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  {startup.fundingDisclosed || 'Disclosed Round'}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                  Business Model
                </span>
                <span className="text-sm sm:text-base font-heading font-black text-[#111827] block pt-1">
                  {startup.businessModel}
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Commercial Structure
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                  Headquarters
                </span>
                <span className="text-sm sm:text-base font-heading font-bold text-[#111827] block pt-1">
                  {startup.hqCity}, KSA
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Kingdom Jurisdiction
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                  Founding Year
                </span>
                <span className="text-sm sm:text-base font-heading font-bold text-[#111827] block pt-1">
                  {startup.foundingYear}
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Operational Track Record
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Content Split */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Dossier Details (8 Cols) */}
            <div className="lg:col-span-8 space-y-10">
              {/* Executive Summary */}
              <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#19B5A3]" />
                  <span>Company Executive Summary</span>
                </h2>
                <p className="text-sm sm:text-base text-[#111827] leading-relaxed whitespace-pre-line">
                  {startup.description}
                </p>
              </section>

              {/* Verified Products & Solutions */}
              {productList.length > 0 && (
                <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#0B6E4F]" />
                      <span>Verified Products &amp; Solutions</span>
                    </h2>
                    <span className="text-xs text-[#0B6E4F] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{productList.length} Offerings</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Commercial software products, developer APIs, and sovereign solutions actively deployed to customers.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {productList.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] space-y-1 flex items-start gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-[#0B6E4F] shrink-0 mt-0.5 text-xs font-bold">
                          ✓
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#111827] block">
                            {prod}
                          </span>
                          <span className="text-[11px] text-[#4B5563] block pt-0.5">
                            Production deployment in Saudi market
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Architectural Tech Stack & Infrastructure */}
              <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#0B6E4F]" />
                    <span>Architectural Tech Stack &amp; Sovereign Cloud</span>
                  </h2>
                  <span className="text-xs text-[#4B5563] font-medium">
                    Verified Technical Disclosures
                  </span>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Languages, telemetry meshes, database architectures, and sovereign cloud regions in production use.
                </p>

                {techList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {techList.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-md bg-[#F1F5F2] text-xs font-mono font-medium text-[#111827] border border-[#E2E8E4]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#4B5563]">Tech stack disclosure undergoing technical review.</p>
                )}
              </section>

              {/* Verified Funding & Institutional Capital */}
              {(startup.fundingDisclosed || investorList.length > 0) && (
                <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                      <Coins className="w-5 h-5 text-[#C9A227]" />
                      <span>Verified Funding &amp; Institutional Capital</span>
                    </h2>
                    <span className="text-xs text-[#4B5563] font-medium">
                      Zero Speculation Policy
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Disclosed funding stage and institutional venture capital partners confirmed through regulatory filings or verified press announcements. Saudi Future Tech never displays speculative private valuations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {startup.fundingDisclosed && (
                      <div className="p-4 rounded-md bg-[#F1F5F2] border border-[#E2E8E4]">
                        <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                          Disclosed Round Status
                        </span>
                        <span className="text-sm font-heading font-bold text-[#111827] block pt-1">
                          {startup.fundingDisclosed}
                        </span>
                      </div>
                    )}

                    {startup.crNumber && (
                      <div className="p-4 rounded-md bg-[#F1F5F2] border border-[#E2E8E4]">
                        <span className="text-[10px] uppercase font-bold text-[#4B5563] block tracking-wider">
                          Commercial Registration (CR)
                        </span>
                        <span className="text-sm font-mono font-bold text-[#111827] block pt-1">
                          CR #{startup.crNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {investorList.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563] block">
                        Verified Institutional Backers &amp; Accelerators
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {investorList.map((inv, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#111827] border border-[#E2E8E4]"
                          >
                            {inv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Operating Traction / Regulatory Milestone */}
              {startup.keyMetrics && (
                <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-4 shadow-xs">
                  <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0B6E4F]" />
                    <span>Verified Operating Traction &amp; Regulatory Standing</span>
                  </h2>
                  <div className="p-4 rounded-md bg-[#E8F5EF] border border-[#0B6E4F]/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B6E4F]/15 flex items-center justify-center text-[#0B6E4F] shrink-0 font-bold">
                      ⚡
                    </div>
                    <div>
                      <span className="font-heading font-bold text-base text-[#111827] block">
                        {startup.keyMetrics}
                      </span>
                      <span className="text-xs text-[#4B5563] block pt-0.5">
                        Verified via official regulatory registers, capital filings, or institutional confirmation.
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* Data Provenance Box (Deep Midnight Luxury Base) */}
              <section className="bg-[#0A1F2C] text-white rounded-lg border border-[#1E3A4C] p-6 sm:p-8 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#19B5A3]" />
                    <span>Sovereign Registry Verification &amp; Data Provenance</span>
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    Verified {formatDate(startup.verifiedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200 pt-1">
                  <div>
                    <span className="text-slate-400 block font-medium">Headquarters City:</span>
                    <span className="font-bold text-white">{startup.hqCity}, Saudi Arabia</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Commercial Entity Type:</span>
                    <span className="font-bold text-white">Saudi Registered Tech Venture</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Official Source Provenance:</span>
                    {startup.sourceUrl ? (
                      <a
                        href={startup.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#19B5A3] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{startup.sourceName || 'View Source Document'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="font-bold text-white">{startup.sourceName || 'SFT Research Desk'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Auditing Body:</span>
                    <span className="text-white font-medium">{startup.verifiedBy || 'SFT Editorial Board'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E3A4C] text-[11px] text-slate-400 leading-relaxed">
                  Notice: Saudi Future Tech clearly distinguishes verified regulatory facts (Commercial Registration, SAMA/NCA licensing, Tadawul disclosures) from self-reported company metrics.
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Action Rail (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* Company Website Card */}
              <div className="bg-white rounded-lg border-2 border-[#0B6E4F] p-6 space-y-5 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#0B6E4F] block">
                    Official Corporate Portal
                  </span>
                  <h3 className="text-lg font-heading font-black text-[#111827]">
                    Explore {startup.name}
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Direct routing to the verified company domain. View commercial software products, customer portals, and enterprise APIs.
                  </p>
                </div>

                <a
                  href={startup.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  <span>Visit Official Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Profile Claim Action */}
                <div className="pt-4 border-t border-[#E2E8E4] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#111827] font-bold">
                    <Info className="w-4 h-4 text-[#19B5A3]" />
                    <span>Founder Profile Claim</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    Are you a founder or verified executive of {startup.name}? Contact our editorial board to update architectural tech stacks, product launches, or funding announcements.
                  </p>
                  <Link
                    href="/newsletter"
                    className="inline-block text-xs font-semibold text-[#0B6E4F] hover:underline pt-1"
                  >
                    Initiate Profile Claim &rarr;
                  </Link>
                </div>
              </div>

              {/* Related Startups */}
              {related.length > 0 && (
                <div className="bg-white rounded-lg border border-[#E2E8E4] p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                    More Startups in {startup.category?.name || 'Saudi Arabia'}
                  </h4>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/startup/${rel.slug}`}
                        className="group block p-3 rounded-md bg-[#F1F5F2] hover:bg-[#E8F5EF] border border-[#E2E8E4] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#111827]">{rel.name}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white text-[#4B5563] font-medium border border-[#E2E8E4]">
                            {formatStage(rel.stage)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B5563] line-clamp-1">
                          {rel.tagline}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>{rel.hqCity}</span>
                          <span className="text-[#0B6E4F] font-semibold group-hover:underline flex items-center gap-0.5">
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
