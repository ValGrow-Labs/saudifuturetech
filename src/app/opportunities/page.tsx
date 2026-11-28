import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { getOpportunities } from '@/lib/founder-intelligence';
import { OpportunityDirectory, OpportunityItem } from '@/components/public/OpportunityDirectory';
import { daysUntil } from '@/lib/labels';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

import prisma from '@/lib/prisma';
import { OpportunityCategory, OpportunityStatus } from '@prisma/client';

const TITLE = 'Grants and Programmes for Saudi Founders';
const DESCRIPTION =
  'Open grants, accelerators, subsidies and regulatory sandboxes for founders in Saudi Arabia, each checked against the issuing body’s own page.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl('/opportunities'),
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: getCanonicalUrl('/opportunities'),
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

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    pillar?: string;
    status?: string;
    eligibility?: string;
    sort?: string;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  const [rawCategories, rawOpportunities] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        accentColor: true,
      },
    }),
    getOpportunities({
      search: resolvedParams.q,
      category: resolvedParams.category as OpportunityCategory,
      categorySlug: resolvedParams.pillar,
      status: resolvedParams.status as OpportunityStatus,
      eligibility: resolvedParams.eligibility as any,
      sort: resolvedParams.sort as any,
      includeUnpublished: false, // Strict: show only published
    }),
  ]);

  // Serialize opportunities for client component
  const opportunities: OpportunityItem[] = rawOpportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
    slug: opp.slug,
    organization: opp.organization,
    category: opp.category,
    fundingAmount: opp.fundingAmount,
    equityTaken: opp.equityTaken,
    location: opp.location,
    description: opp.description,
    eligibilitySummary: opp.eligibilitySummary,
    eligibilityCriteria: opp.eligibilityCriteria,
    benefits: opp.benefits,
    requirements: opp.requirements,
    status: opp.effectiveStatus,
    isExpired: Boolean(opp.isExpired),
    deadline: opp.deadline ? opp.deadline.toISOString() : null,
    applicationUrl: opp.applicationUrl,
    sourceName: opp.sourceName,
    sourceUrl: opp.sourceUrl,
    verifiedAt: opp.verifiedAt.toISOString(),
    verifiedBy: opp.verifiedBy,
    isFeatured: opp.isFeatured,
    isPublished: opp.isPublished,
    categoryRel: opp.categoryRel,
  }));

  const openItems = opportunities.filter((o) => !o.isExpired && o.status !== OpportunityStatus.CLOSED);
  const closingSoon = openItems.filter((o) => {
    const d = daysUntil(o.deadline);
    return d !== null && d >= 0 && d <= 14;
  }).length;
  const lastChecked = opportunities.reduce<string | null>(
    (latest, o) => (!latest || o.verifiedAt > latest ? o.verifiedAt : latest),
    null
  );

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Opportunities', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-12 pb-24">
          <header className="max-w-3xl">
            <p className="kicker mb-3">The grant desk</p>
            <h1 className="font-serif text-display-lg text-ink">Grants, Accelerators & Support Programmes for Saudi Founders</h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3">
              Grants, accelerators, subsidies and regulatory sandboxes open to founders building in Saudi Arabia.
              Each listing links to the issuing body’s own page and shows when we last checked it.
            </p>
            <p className="meta mt-6">
              {opportunities.length} listed · {openItems.length} open · {closingSoon} closing within 14 days
              {lastChecked && <> · last checked {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(lastChecked))}</>}
            </p>
          </header>

          <div className="mt-12">
            <OpportunityDirectory
              initialOpportunities={opportunities}
              availablePillars={rawCategories.map((c) => ({
                slug: c.slug,
                name: c.name,
                color: c.accentColor || '',
              }))}
              initialQuery={resolvedParams.q || ''}
              initialCategory={resolvedParams.category || 'ALL'}
              initialPillar={resolvedParams.pillar || 'ALL'}
              initialStatus={resolvedParams.status || 'ALL'}
              initialEligibility={resolvedParams.eligibility || 'ALL'}
              initialSort={resolvedParams.sort || 'deadline-asc'}
            />
          </div>

          <aside className="mt-20 grid gap-4 border-t border-rule pt-6 md:grid-cols-12 md:gap-10">
            <p className="meta md:col-span-3">Run a programme?</p>
            <div className="md:col-span-9 max-w-2xl">
              <p className="text-[0.9375rem] leading-relaxed text-ink-2">
                If you run a grant, accelerator cohort or sandbox in Saudi Arabia and it isn’t listed here, send us the
                official page. We check it against the source before it goes up, and there’s no charge.
              </p>
              <Link href="/newsletter" className="group mt-3 inline-flex items-center gap-2 text-sm text-ink">
                <span className="link-rule">Submit a programme</span>
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
