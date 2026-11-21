import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { 
  getOpportunityBySlug, 
  getAllOpportunitySlugs, 
  getRelatedOpportunities 
} from '@/lib/founder-intelligence';
import { formatDate, cn } from '@/lib/utils';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ArrowRight,
  ArrowUpRight,
  Compass,
  Sparkles,
  ListChecks,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { OpportunityCategory, OpportunityStatus } from '@prisma/client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllOpportunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug, true);

  if (!opp) {
    return {
      title: 'Opportunity Not Found | Saudi Future Tech',
    };
  }

  const categoryLabel = opp.category === OpportunityCategory.GRANT 
    ? 'Non-Dilutive Grant' 
    : opp.category === OpportunityCategory.ACCELERATOR 
    ? 'Seed Accelerator' 
    : opp.category === OpportunityCategory.GOVERNMENT_PROGRAM 
    ? 'Regulatory Sandbox' 
    : 'Founder Opportunity';

  return {
    title: `${opp.title} — ${categoryLabel} Dossier | Saudi Future Tech`,
    description: opp.description.slice(0, 160),
    openGraph: {
      title: `${opp.title} — Verified Saudi Founder Opportunity`,
      description: opp.description.slice(0, 160),
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${opp.title} | Saudi Future Tech`,
      description: opp.description.slice(0, 160),
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug, true);

  if (!opp) {
    notFound();
  }

  const related = await getRelatedOpportunities(opp.categoryId, opp.id, 3);
  const criteriaList = Array.isArray(opp.eligibilityCriteria)
    ? (opp.eligibilityCriteria as string[])
    : [];
  const benefitsList = Array.isArray(opp.benefits)
    ? (opp.benefits as string[])
    : [];
  const requirementsList = Array.isArray(opp.requirements)
    ? (opp.requirements as string[])
    : [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: opp.title, current: true },
  ];

  // Calculate deadline urgency & expiration
  let deadlineLabel = 'Rolling Admission';
  let isClosingSoon = false;
  let isExpired = opp.isExpired;

  if (opp.deadline) {
    const diffTime = new Date(opp.deadline).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      deadlineLabel = 'Cohort Closed';
      isExpired = true;
    } else {
      deadlineLabel = `${formatDate(opp.deadline)} (${diffDays} ${diffDays === 1 ? 'day' : 'days'} left)`;
      if (diffDays <= 14) isClosingSoon = true;
    }
  }

  // Determine Program Type Label
  const getProgramTypeDetails = (cat: OpportunityCategory) => {
    switch (cat) {
      case OpportunityCategory.GRANT:
        return { label: 'Non-Dilutive Grant', isCash: true, desc: 'Direct non-repayable founder capital. 0% equity taken.' };
      case OpportunityCategory.ACCELERATOR:
        return { label: 'Venture Accelerator', isCash: true, desc: 'Cohort-based scaling program with investment and mentorship.' };
      case OpportunityCategory.INCUBATOR:
        return { label: 'Technology Incubator', isCash: false, desc: 'Physical space, prototyping lab access, and technical coaching.' };
      case OpportunityCategory.SUBSIDY:
        return { label: 'Innovation Subsidy / Voucher', isCash: true, desc: 'Government-subsidized service vouchers for IP, legal, and engineering.' };
      case OpportunityCategory.GOVERNMENT_PROGRAM:
        return { label: 'Regulatory Sandbox / Gov Framework', isCash: false, desc: 'Live operational exemption and regulatory supervision.' };
      case OpportunityCategory.SUBSIDIZED_PERK:
        return { label: 'Sovereign Compute & Cloud Credits', isCash: false, desc: 'High-performance computing GPU tokens and cloud infrastructure.' };
      case OpportunityCategory.HACKATHON:
        return { label: 'National Tech Hackathon & Challenge', isCash: true, desc: 'Competitive prize challenge and prototype demonstration.' };
      default:
        return { label: 'Founder Program', isCash: false, desc: 'Verified initiative for technology entrepreneurs.' };
    }
  };

  const programType = getProgramTypeDetails(opp.category);

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: opp.title,
    serviceType: programType.label,
    provider: {
      '@type': 'GovernmentOrganization',
      name: opp.organization,
    },
    description: opp.description,
    url: opp.applicationUrl,
    termsOfService: opp.equityTaken || '0% Non-Dilutive',
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
        {/* 1. Header Banner & Dossier Masthead */}
        <div className="bg-[#F1F5F2] border-b border-[#E0E7E3] py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Breadcrumbs items={breadcrumbs} />

            <div className="space-y-3.5 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#0A1F2C] border border-[#E0E7E3]">
                  <Building2 className="w-3.5 h-3.5 text-brand-navy" />
                  <span>{opp.organization}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-editorial-sand text-xs font-semibold text-ink-high border border-editorial-hairline">
                  <Layers className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{programType.label}</span>
                </span>

                {opp.categoryRel && (
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${opp.categoryRel.color}15`,
                      color: opp.categoryRel.color,
                      border: `1px solid ${opp.categoryRel.color}30`
                    }}
                  >
                    {opp.categoryRel.name}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs text-[#0B6E4F] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                  <span>Verified Official Program</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-ink-high leading-tight">
                {opp.title}
              </h1>

              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                {opp.eligibilitySummary || opp.description}
              </p>
            </div>

            {/* 4-Stat Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <div className="p-4 rounded-lg bg-editorial-sand/50 border border-editorial-hairline">
                <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
                  Support Value
                </span>
                <span className="text-sm sm:text-base font-heading font-black text-[#0B6E4F] block pt-1">
                  {opp.fundingAmount || 'Zero-Cost Participation'}
                </span>
                <span className="text-[10px] text-ink-faint block pt-0.5">
                  {programType.isCash ? 'Cash Capital' : 'Non-Cash Infrastructure / Regulatory'}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-editorial-sand/50 border border-editorial-hairline">
                <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
                  Equity Requirement
                </span>
                <span className="text-sm sm:text-base font-heading font-black text-ink-high block pt-1">
                  {opp.equityTaken || '0% (Non-Dilutive)'}
                </span>
                <span className="text-[10px] text-ink-faint block pt-0.5">
                  Cap Table Impact
                </span>
              </div>

              <div className="p-4 rounded-lg bg-editorial-sand/50 border border-editorial-hairline">
                <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
                  Application Deadline
                </span>
                <span className={cn(
                  'text-sm sm:text-base font-heading font-bold block pt-1',
                  isExpired ? 'text-gray-600' : isClosingSoon ? 'text-amber-800' : 'text-ink-high'
                )}>
                  {deadlineLabel}
                </span>
                <span className="text-[10px] text-ink-faint block pt-0.5">
                  {opp.deadline ? 'Official Cohort Window' : 'Continuous Rolling Review'}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-editorial-sand/50 border border-editorial-hairline">
                <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
                  Program Location
                </span>
                <span className="text-sm sm:text-base font-heading font-bold text-ink-high block pt-1">
                  {opp.location || 'Riyadh, KSA'}
                </span>
                <span className="text-[10px] text-ink-faint block pt-0.5">
                  Kingdom Jurisdiction
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
              {/* Expired Cohort Notice if applicable */}
              {isExpired && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Application Window Expired</span>
                    <p className="pt-0.5 text-xs text-amber-800 leading-relaxed">
                      The official application deadline for this cohort has passed. Saudi Future Tech preserves this dossier for historical funding intelligence. Check the official portal below for upcoming cohorts.
                    </p>
                  </div>
                </div>
              )}

              {/* Section 1: Program Overview */}
              <section className="bg-editorial-pure rounded-lg border border-editorial-hairline p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-heading font-bold text-ink-high flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-teal" />
                  <span>Program Overview &amp; Mandate</span>
                </h2>
                <div className="p-3.5 bg-brand-sand/30 rounded-xs border-l-4 border-brand-teal text-xs text-ink-body font-medium">
                  {programType.desc}
                </div>
                <p className="text-sm text-ink-body leading-relaxed whitespace-pre-line">
                  {opp.description}
                </p>
              </section>

              {/* Section 2: Verified Benefits Package */}
              {benefitsList.length > 0 && (
                <section className="bg-editorial-pure rounded-lg border border-editorial-hairline p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-ink-high flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-desertGold" />
                      <span>Verified Founder Benefits Package</span>
                    </h2>
                    <span className="text-xs text-brand-desertGold font-bold uppercase tracking-wider">
                      {benefitsList.length} Verified Perks
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {benefitsList.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-md bg-editorial-sand/30 border border-editorial-hairline"
                      >
                        <span className="w-5 h-5 rounded-full bg-brand-desertGold/15 text-brand-desertGold flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✦
                        </span>
                        <span className="text-xs sm:text-sm text-ink-high leading-relaxed">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 3: Founder Eligibility Checklist */}
              {criteriaList.length > 0 && (
                <section className="bg-editorial-pure rounded-lg border border-editorial-hairline p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-ink-high flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0B6E4F]" />
                      <span>Mandatory Founder Eligibility Checklist</span>
                    </h2>
                    <span className="text-xs text-[#0B6E4F] font-bold uppercase tracking-wider">
                      {criteriaList.length} Mandatory Criteria
                    </span>
                  </div>

                  {opp.eligibilitySummary && (
                    <div className="p-3.5 rounded-md bg-brand-sand/40 border-l-4 border-brand-oasis text-xs text-ink-high font-medium">
                      {opp.eligibilitySummary}
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    {criteriaList.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-md bg-editorial-sand/30 border border-editorial-hairline"
                      >
                        <div className="w-5 h-5 rounded-full bg-brand-oasis/15 text-[#0B6E4F] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <span className="text-xs sm:text-sm text-ink-high leading-relaxed">
                          {criterion}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 4: Application Requirements Checklist */}
              {requirementsList.length > 0 && (
                <section className="bg-editorial-pure rounded-lg border border-editorial-hairline p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-ink-high flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-brand-navy" />
                      <span>Application Requirements &amp; Materials</span>
                    </h2>
                    <span className="text-xs text-brand-navy font-bold uppercase tracking-wider">
                      {requirementsList.length} Requirements
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {requirementsList.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-md bg-editorial-sand/20 border border-editorial-hairline text-xs sm:text-sm text-ink-body"
                      >
                        <span className="font-mono font-bold text-brand-navy text-xs mt-0.5">0{idx + 1}.</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 5: Official Provenance & Editorial Trust Guarantee */}
              <section className="bg-brand-sand/40 rounded-lg border border-editorial-hairline p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                  <span>Official Authority Verification &amp; Data Provenance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-ink-body pt-1">
                  <div>
                    <span className="text-ink-muted block font-medium">Issuing Government / Enterprise Entity:</span>
                    <span className="font-bold text-ink-high text-sm">{opp.organization}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block font-medium">Verified Source Name:</span>
                    <span className="font-bold text-ink-high text-sm">{opp.sourceName}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block font-medium">Last Editorial Verification:</span>
                    <span className="font-bold text-[#0B6E4F] text-sm">{formatDate(opp.verifiedAt)}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block font-medium">Verified Editorial Desk:</span>
                    <span className="font-bold text-ink-high text-sm flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#0B6E4F]" />
                      <span>{opp.verifiedBy || 'Saudi Future Tech Intelligence Team'}</span>
                    </span>
                  </div>
                </div>

                {opp.sourceUrl && (
                  <div className="pt-2 border-t border-editorial-hairline flex items-center justify-between text-xs">
                    <span className="text-ink-muted">Official Source Verification Portal:</span>
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-brand-navy hover:underline inline-flex items-center gap-1"
                    >
                      <span>{opp.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Sticky Action Rail (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* Application Action Card */}
              <div className="bg-white rounded-lg border border-[#E2E8E4] p-6 space-y-5 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#0B6E4F] block">
                    Direct Ministry Route
                  </span>
                  <h3 className="text-lg font-heading font-black text-[#111827]">
                    {isExpired ? 'Application Closed' : 'Apply on Official Portal'}
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Saudi Future Tech routes founders directly to the verified ministerial portal. Zero intermediate broker fees or lead forms.
                  </p>
                </div>

                <a
                  href={opp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs',
                    isExpired
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-[#0B6E4F] hover:bg-[#08533C] text-white'
                  )}
                >
                  <span>{isExpired ? 'Visit Portal (Past Cohort)' : 'Proceed to Official Application'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {opp.sourceUrl && (
                  <a
                    href={opp.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-[#E2E8E4] text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F2] transition-colors"
                  >
                    <span>View Official Source Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="pt-2 border-t border-editorial-hairline space-y-2 text-xs text-ink-muted">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-ink-faint block">
                    Pre-Application Materials
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />
                      <span>Valid Commercial Registration (CR) or MISA License</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />
                      <span>Investor Pitch Deck &amp; Market Sizing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />
                      <span>Functional Software Architecture Demo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Opportunities in same pillar */}
              {related.length > 0 && (
                <div className="bg-editorial-pure rounded-lg border border-editorial-hairline p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Related Programs in {opp.categoryRel?.name || 'KSA'}
                  </h4>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/opportunity/${rel.slug}`}
                        className="group block p-3 rounded-md bg-editorial-sand/40 hover:bg-editorial-sand border border-editorial-hairline transition-all space-y-1"
                      >
                        <span className="text-[10px] font-bold text-ink-muted block uppercase">
                          {rel.organization}
                        </span>
                        <h5 className="font-heading font-bold text-xs text-ink-high group-hover:text-brand-navy line-clamp-1">
                          {rel.title}
                        </h5>
                        <div className="flex items-center justify-between text-[10px] text-ink-muted pt-1">
                          <span className="text-[#0B6E4F] font-semibold">
                            {rel.fundingAmount || 'Grant'}
                          </span>
                          <span className="text-brand-navy font-medium group-hover:underline flex items-center gap-0.5">
                            <span>View Dossier</span>
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
