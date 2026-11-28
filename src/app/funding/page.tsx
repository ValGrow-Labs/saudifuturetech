import React from 'react';
import { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { getInvestors, InvestorFilters } from '@/lib/founder-intelligence';
import { FundingDirectory, InvestorItem } from '@/components/public/FundingDirectory';
import { MainContainer } from '@/components/public/MainContainer';
import Link from 'next/link';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

const TITLE = 'Investors Backing Saudi Startups';
const DESCRIPTION =
  'Venture firms, government funds such as SVC and Sanabil, CMA-licensed fund managers and angel networks investing in Saudi startups, with ticket sizes and stages.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl('/funding'),
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: getCanonicalUrl('/funding'),
    siteName: DEFAULT_SEO.siteName,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export const revalidate = 60; // 1-minute ISR

interface FundingPageProps {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    stage?: string;
    sector?: string;
    cma?: string;
    svc?: string;
    active?: string;
    sort?: string;
  }>;
}

export default async function FundingPage({ searchParams }: FundingPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.q || '';
  const typeFilter = resolvedParams.type as any;
  const stageFilter = resolvedParams.stage || 'ALL';
  const sectorFilter = resolvedParams.sector || 'ALL';
  const cmaOnly = resolvedParams.cma === 'true';
  const svcOnly = resolvedParams.svc === 'true';
  const activeOnly = resolvedParams.active === 'true';
  const sort = resolvedParams.sort as any;

  const filters: InvestorFilters = {
    search: query || undefined,
    type: typeFilter && typeFilter !== 'ALL' ? typeFilter : undefined,
    stage: stageFilter !== 'ALL' ? stageFilter : undefined,
    sector: sectorFilter !== 'ALL' ? sectorFilter : undefined,
    cmaAuthorizedOnly: cmaOnly || undefined,
    svcPartnerOnly: svcOnly || undefined,
    activeInvestingOnly: activeOnly || undefined,
    sort: sort || undefined,
  };

  const rawInvestors = await getInvestors(filters);

  // Also get full list to compute aggregate directory stats
  const allInvestors = await getInvestors({});
  const totalFunds = allInvestors.length;
  const cmaAuthorizedCount = allInvestors.filter((inv) => inv.isCmaAuthorized).length;
  const svcPartnerCount = allInvestors.filter((inv) => inv.isSvcPartner).length;
  const activeInvestingCount = allInvestors.filter((inv) => inv.isActiveInvesting).length;

  const investors: InvestorItem[] = rawInvestors.map((inv) => ({
    id: inv.id,
    name: inv.name,
    slug: inv.slug,
    type: inv.type,
    hqLocation: inv.hqLocation,
    logoUrl: inv.logoUrl,
    websiteUrl: inv.websiteUrl,
    pitchUrl: inv.pitchUrl,
    isCmaAuthorized: inv.isCmaAuthorized,
    cmaLicenseNumber: inv.cmaLicenseNumber,
    isSvcPartner: inv.isSvcPartner,
    svcProgramDetails: inv.svcProgramDetails,
    regulatoryCategory: inv.regulatoryCategory,
    saudiRegulated: inv.saudiRegulated,
    licenseDetails: inv.licenseDetails,
    isActiveInvesting: inv.isActiveInvesting,
    targetStages: inv.targetStages,
    targetSectors: inv.targetSectors,
    checkSizeRange: inv.checkSizeRange,
    portfolioHighlights: inv.portfolioHighlights,
    description: inv.description,
    thesisSummary: inv.thesisSummary,
    sourceName: inv.sourceName,
    sourceUrl: inv.sourceUrl,
    verifiedAt: inv.verifiedAt.toISOString(),
    isFeatured: inv.isFeatured,
  }));

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Funding & Investors', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-12 pb-24">
          <header className="max-w-3xl">
            <p className="kicker mb-3">The funding desk</p>
            <h1 className="font-serif text-display-lg text-ink">Venture Capital & Investors Backing Saudi Startups</h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3">
              Venture firms, government funds, corporate investors and angel networks that back startups in Saudi
              Arabia, with their ticket sizes, stages and licensing as published.
            </p>
            <p className="meta mt-6">
              {totalFunds} listed · {cmaAuthorizedCount} CMA-licensed · {svcPartnerCount} SVC partners ·{' '}
              {activeInvestingCount} investing now
            </p>
          </header>

          <div className="mt-12">
            <FundingDirectory
              initialInvestors={investors}
              initialQuery={query}
              initialType={typeFilter || 'ALL'}
              initialStage={stageFilter}
              initialSector={sectorFilter}
              initialCmaOnly={cmaOnly}
              initialSvcOnly={svcOnly}
              initialActiveOnly={activeOnly}
            />
          </div>

          <aside className="mt-20 grid gap-4 border-t border-rule pt-6 md:grid-cols-12 md:gap-10">
            <p className="meta md:col-span-3">Manage a fund?</p>
            <div className="md:col-span-9 max-w-2xl">
              <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                If your fund invests in Saudi startups and is missing here, or your ticket size, stages or sectors have
                changed, send us the details with a public source and we’ll update the listing.
              </p>
              <Link href="/newsletter" className="group mt-3 inline-flex items-center gap-2 text-sm text-ink">
                <span className="link-rule">Send an update</span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </aside>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
