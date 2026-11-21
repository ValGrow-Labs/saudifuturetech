import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { 
  getInvestorBySlug, 
  getAllInvestorSlugs, 
  getRelatedInvestors,
  getStartups
} from '@/lib/founder-intelligence';
import { formatDate, cn } from '@/lib/utils';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  ExternalLink, 
  TrendingUp, 
  Layers, 
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Info,
  Coins,
  Shield,
  FileText,
  Landmark,
  Briefcase,
  Users2,
  ArrowRight
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllInvestorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const investor = await getInvestorBySlug(slug);

  if (!investor) {
    return {
      title: 'Investor Not Found | Saudi Future Tech',
    };
  }

  return {
    title: `${investor.name} | Saudi Investor Directory & Funding Intelligence`,
    description: investor.description.slice(0, 160),
    openGraph: {
      title: `${investor.name} — Verified Saudi Institutional Investor Dossier`,
      description: investor.description.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function InvestorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const investor = await getInvestorBySlug(slug);

  if (!investor) {
    notFound();
  }

  const related = await getRelatedInvestors(investor.id, investor.type, 3);
  const stages = Array.isArray(investor.targetStages) ? (investor.targetStages as string[]) : [];
  const sectors = Array.isArray(investor.targetSectors) ? (investor.targetSectors as string[]) : [];
  const portfolio = Array.isArray(investor.portfolioHighlights) ? (investor.portfolioHighlights as string[]) : [];

  // Fetch all published startups to cross-link matching portfolio names
  const allStartups = await getStartups({ includeUnpublished: false });
  const startupSlugMap = new Map<string, string>();
  allStartups.forEach((s) => {
    startupSlugMap.set(s.name.toLowerCase(), s.slug);
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Funding', href: '/funding' },
    { label: investor.name, current: true },
  ];

  const formatType = (type: string) => {
    switch (type) {
      case 'VENTURE_CAPITAL':
        return 'Venture Capital';
      case 'GOVERNMENT_FUND':
        return 'Sovereign Wealth / Gov Fund';
      case 'CORPORATE_VC':
        return 'Corporate Venture Capital (CVC)';
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

  // Schema.org Structured Data: FinancialService
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: investor.name,
    description: investor.description,
    url: investor.websiteUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: investor.hqLocation,
      addressCountry: 'SA',
    },
    ...(investor.isCmaAuthorized && investor.cmaLicenseNumber
      ? { legalName: `${investor.name} (CMA Authorized: ${investor.cmaLicenseNumber})` }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827]">
      <SiteHeader />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 pb-20">
        {/* 1. Dossier Header Strip */}
        <div className="bg-[#F1F5F2] border-b border-[#E2E8E4] py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-4xl">
                {/* Regulatory Badges Strip */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B6E4F] text-white">
                    {formatType(investor.type)}
                  </span>

                  {investor.isCmaAuthorized && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0B6E4F]" />
                      <span>CMA Authorized</span>
                    </span>
                  )}

                  {investor.isSvcPartner && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227]/40">
                      <Landmark className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>SVC Partner Fund</span>
                    </span>
                  )}

                  {investor.isActiveInvesting ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#0E7A6E] bg-[#E6FAF7] border border-[#19B5A3]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#19B5A3] animate-pulse" />
                      Actively Deploying Capital
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-[#4B5563] bg-white border border-[#E2E8E4]">
                      Closed Allocation Mandate
                    </span>
                  )}

                  {investor.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF8EC] text-[#9A7B1C] border border-[#C9A227]/40">
                      <Sparkles className="w-3 h-3 text-[#C9A227]" />
                      <span>Vision 2030 Anchor</span>
                    </span>
                  )}
                </div>

                {/* Fund Title & HQ */}
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                    {investor.name}
                  </h1>
                  <p className="text-sm sm:text-base font-medium text-[#0B6E4F] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B6E4F]" />
                    <span>{investor.hqLocation}</span>
                    {investor.regulatoryCategory && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#4B5563]">{investor.regulatoryCategory}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {investor.pitchUrl ? (
                  <a
                    href={investor.pitchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
                  >
                    <span>Submit Pitch to Fund</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="px-4 py-2 rounded-md bg-white text-[#4B5563] font-medium text-xs border border-[#E2E8E4]">
                    Direct Institutional Syndicate Only
                  </span>
                )}

                <a
                  href={investor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-[#E2E8E4] bg-white hover:bg-[#F1F5F2] text-[#111827] font-medium text-xs transition-colors"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 4-Stat High-Conviction Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[#E2E8E4]">
              <div className="p-3.5 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
                  Typology
                </span>
                <span className="font-heading font-bold text-sm sm:text-base text-[#111827]">
                  {formatType(investor.type)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
                  Disclosed Check Size
                </span>
                <span className="font-heading font-bold text-sm sm:text-base text-[#111827]">
                  {investor.checkSizeRange || 'Unspecified (Confidential)'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
                  Target Stages
                </span>
                <span className="font-heading font-bold text-sm sm:text-base text-[#111827] truncate block">
                  {stages.length > 0 ? stages.join(', ') : 'Early to Growth'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#E2E8E4] shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4B5563] block">
                  Regulatory Status
                </span>
                <span className="font-heading font-bold text-sm sm:text-base text-[#0B6E4F] truncate block">
                  {investor.isCmaAuthorized ? 'CMA Authorized' : (investor.isSvcPartner ? 'SVC Partner' : 'Institutional Fund')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Editorial Intelligence Dossier */}
            <div className="lg:col-span-2 space-y-8">
              {/* Organization Overview */}
              <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0B6E4F]" />
                  <span>Institutional Overview</span>
                </h2>
                <div className="text-sm sm:text-base text-[#111827] leading-relaxed space-y-4 whitespace-pre-line">
                  {investor.description}
                </div>
              </section>

              {/* Investment Thesis & Sovereign Alignment */}
              {investor.thesisSummary && (
                <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-4 shadow-xs">
                  <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#C9A227]" />
                    <span>Investment Thesis &amp; Sovereign Mandate</span>
                  </h2>
                  <p className="text-sm sm:text-base text-[#111827] leading-relaxed bg-[#F1F5F2] p-4 rounded-md border border-[#E2E8E4] italic">
                    &ldquo;{investor.thesisSummary}&rdquo;
                  </p>
                </section>
              )}

              {/* Target Stages & Sovereign Sectors */}
              <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-6 shadow-xs">
                <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0B6E4F]" />
                  <span>Deployment Focus &amp; Target Sectors</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2">
                      Target Investment Stages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stages.length > 0 ? (
                        stages.map((st, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] text-xs font-semibold text-[#111827]"
                          >
                            {st}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#4B5563]">Early to Growth Stage</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-2">
                      Sovereign Pillar &amp; Sector Mandates
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sectors.length > 0 ? (
                        sectors.map((sec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-md bg-[#E8F5EF] border border-[#0B6E4F]/20 text-xs font-semibold text-[#0B6E4F]"
                          >
                            {sec}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#4B5563]">Broad Technology Sectors</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Verified Portfolio Highlights (With Startup Cross-Links) */}
              <section className="bg-white rounded-lg border border-[#E2E8E4] p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-bold text-[#111827] flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#0B6E4F]" />
                    <span>Verified Portfolio Highlights</span>
                  </h2>
                  <span className="text-xs text-[#4B5563] font-medium">
                    Verified Public Disclosures
                  </span>
                </div>

                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {portfolio.map((companyName, idx) => {
                      const matchedSlug = startupSlugMap.get(companyName.toLowerCase());

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#19B5A3]" />
                            <span className="font-heading font-bold text-sm text-[#111827]">
                              {companyName}
                            </span>
                          </div>

                          {matchedSlug ? (
                            <Link
                              href={`/startup/${matchedSlug}`}
                              className="text-[11px] font-semibold text-[#0B6E4F] hover:underline inline-flex items-center gap-0.5 shrink-0"
                            >
                              <span>Venture Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Verified Investment
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#4B5563] italic">
                    Portfolio disclosures are kept confidential or released on a per-deal basis.
                  </p>
                )}
              </section>

              {/* Strict Regulatory & Provenance Verification Card (Deep Midnight Luxury Base) */}
              <section className="bg-[#0A1F2C] text-white rounded-lg border border-[#1E3A4C] p-6 sm:p-8 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#19B5A3]" />
                    <span>Regulatory Authorization &amp; Provenance Record</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#19B5A3]/20 text-[#19B5A3] uppercase border border-[#19B5A3]/30">
                    Audit Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200 pt-2">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-[#C9A227] block">
                      CMA Authorization Status
                    </span>
                    <span className="font-semibold text-sm text-white">
                      {investor.isCmaAuthorized ? 'Authorized Capital Market Institution' : 'Not Regulated as CMA Broker/Manager'}
                    </span>
                    {investor.cmaLicenseNumber && (
                      <p className="text-[11px] font-mono text-[#19B5A3] mt-0.5">
                        {investor.cmaLicenseNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[10px] uppercase text-[#C9A227] block">
                      SVC Institutional Partner
                    </span>
                    <span className="font-semibold text-sm text-white">
                      {investor.isSvcPartner ? 'Official SVC Partner Fund' : (investor.slug === 'svc-sovereign-fund' ? 'Sovereign Fund-of-Funds Operator' : 'Independent Mandate')}
                    </span>
                    {investor.svcProgramDetails && (
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {investor.svcProgramDetails}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[10px] uppercase text-[#C9A227] block">
                      Primary Provenance Source
                    </span>
                    <span className="font-medium text-white">
                      {investor.sourceName || 'Capital Market Authority & Official Disclosures'}
                    </span>
                    {investor.sourceUrl && (
                      <a
                        href={investor.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#19B5A3] underline block mt-0.5 truncate max-w-xs"
                      >
                        {investor.sourceUrl}
                      </a>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[10px] uppercase text-[#C9A227] block">
                      Editorial Attestation
                    </span>
                    <span className="font-medium text-white">
                      {investor.verifiedBy || 'SFT Editorial Board — Intelligence Desk'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Verified {formatDate(investor.verifiedAt.toISOString())}
                    </span>
                  </div>

                  {investor.licenseDetails && (
                    <div className="sm:col-span-2 pt-2 border-t border-[#1E3A4C]">
                      <span className="font-bold text-[10px] uppercase text-[#C9A227] block">
                        Official Legal Entity &amp; Regulatory Registration Details
                      </span>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        {investor.licenseDetails}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Founder Access Rail */}
            <div className="space-y-6">
              {/* Pitch & Direct Contact Box */}
              <div className="bg-white rounded-lg border border-[#E2E8E4] p-6 space-y-5 shadow-xs">
                <h3 className="font-heading font-bold text-base text-[#111827] flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#C9A227]" />
                  <span>Founder Capital Access</span>
                </h3>

                {investor.pitchUrl ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      This institutional fund maintains an official public review portal for startup pitch decks and executive summaries.
                    </p>
                    <a
                      href={investor.pitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0B6E4F] hover:bg-[#08533C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
                    >
                      <span>Submit Pitch to Fund</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2 bg-[#F1F5F2] p-4 rounded-md border border-[#E2E8E4]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111827]">
                      <Info className="w-3.5 h-3.5 text-[#4B5563]" />
                      <span>Direct Syndicate / Partner Referral Only</span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] leading-relaxed">
                      This sovereign investment organization or growth fund does not accept unsolicited public web forms. Engagements occur via institutional syndicates, licensed lead investors, or sovereign program allocations.
                    </p>
                  </div>
                )}

                {/* Fund Coordinates */}
                <div className="space-y-3 pt-3 border-t border-[#E2E8E4] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Official Web Domain
                    </span>
                    <a
                      href={investor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B6E4F] font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{investor.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Headquarters
                    </span>
                    <span className="font-medium text-[#111827]">{investor.hqLocation}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Institutional Typology
                    </span>
                    <span className="font-medium text-[#111827]">{formatType(investor.type)}</span>
                  </div>
                </div>

                {/* Mandate Update Request */}
                <div className="pt-4 border-t border-[#E2E8E4] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#111827] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#19B5A3]" />
                    <span>Fund Mandate Update</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    Are you a General Partner or Investment Director at {investor.name}? Connect with our research team to update target sectors, active fund vintages, or co-investment programs.
                  </p>
                  <Link
                    href="/newsletter"
                    className="inline-block text-xs font-semibold text-[#0B6E4F] hover:underline pt-1"
                  >
                    Request Mandate Calibration &rarr;
                  </Link>
                </div>
              </div>

              {/* Related Saudi Institutional Investors */}
              {related.length > 0 && (
                <div className="bg-white rounded-lg border border-[#E2E8E4] p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                    More Saudi Institutional Investors
                  </h4>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/investor/${rel.slug}`}
                        className="group block p-3 rounded-md bg-[#F1F5F2] hover:bg-[#E8F5EF] border border-[#E2E8E4] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#111827]">{rel.name}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white text-[#4B5563] font-medium border border-[#E2E8E4]">
                            {formatType(rel.type)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B5563] line-clamp-1">
                          {rel.checkSizeRange || 'Seed to Growth'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>{rel.hqLocation}</span>
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
