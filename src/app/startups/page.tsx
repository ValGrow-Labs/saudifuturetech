import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { getStartups } from '@/lib/founder-intelligence';
import prisma from '@/lib/prisma';
import { StartupDirectory, StartupItem } from '@/components/public/StartupDirectory';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

const TITLE = 'Saudi Startup Directory';
const DESCRIPTION =
  'A hand-checked register of technology companies founded or based in Saudi Arabia, with stage, city, business model and sources for each listing.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl('/startups'),
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: getCanonicalUrl('/startups'),
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

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    pillar?: string;
    city?: string;
    model?: string;
    stage?: string;
    crVerified?: string;
    sort?: string;
  }>;
}

export default async function StartupsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const [rawStartups, categories] = await Promise.all([
    getStartups({
      search: resolvedParams.q,
      categorySlug: resolvedParams.pillar,
      hqCity: resolvedParams.city,
      businessModel: resolvedParams.model as any,
      stage: resolvedParams.stage as any,
      crVerifiedOnly: resolvedParams.crVerified === 'true',
      sort: resolvedParams.sort as any,
      includeUnpublished: false,
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, accentColor: true },
    }),
  ]);

  const startups: StartupItem[] = rawStartups.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline,
    description: s.description,
    logoUrl: s.logoUrl,
    websiteUrl: s.websiteUrl,
    hqCity: s.hqCity,
    foundingYear: s.foundingYear,
    stage: s.stage,
    businessModel: s.businessModel,
    verified: s.verified,
    crVerified: s.crVerified,
    crNumber: s.crNumber,
    sourceName: s.sourceName,
    sourceUrl: s.sourceUrl,
    verifiedAt: s.verifiedAt.toISOString(),
    verifiedBy: s.verifiedBy,
    isFeatured: s.isFeatured,
    isPublished: s.isPublished,
    products: s.products,
    fundingDisclosed: s.fundingDisclosed,
    investorsDisclosed: s.investorsDisclosed,
    techStack: s.techStack,
    keyMetrics: s.keyMetrics,
    category: s.category,
  }));

  const crVerifiedCount = startups.filter((s) => s.crVerified).length;
  const uniqueCities = Array.from(new Set(startups.map((s) => s.hqCity))).length;
  const sectorCount = Array.from(new Set(startups.map((s) => s.category?.slug).filter(Boolean))).length;
  const lastChecked = rawStartups.reduce<Date | null>(
    (latest, s) => (!latest || s.verifiedAt > latest ? s.verifiedAt : latest),
    null
  );

  const facts = [
    `${startups.length} ${startups.length === 1 ? 'company' : 'companies'}`,
    `${uniqueCities} ${uniqueCities === 1 ? 'city' : 'cities'}`,
    sectorCount ? `${sectorCount} ${sectorCount === 1 ? 'sector' : 'sectors'}` : null,
    crVerifiedCount ? `${crVerifiedCount} with a confirmed CR` : null,
    lastChecked
      ? `Last checked ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(lastChecked)}`
      : null,
  ].filter(Boolean);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Startups', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-10 md:pt-14 pb-24">
          <header className="max-w-3xl">
            <p className="kicker mb-3">The register</p>
            <h1 className="font-serif text-display-lg text-ink">Saudi startups</h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3">
              Technology companies founded or based in Saudi Arabia, each with a working product and a named team. We
              check every listing against the company’s own site and public filings, and note the date we last did.
            </p>
            <p className="meta mt-5">{facts.join(' · ')}</p>
          </header>

          <div className="mt-12 md:mt-14">
            <StartupDirectory
              initialStartups={startups}
              categories={categories}
              initialFilters={{
                q: resolvedParams.q || '',
                pillar: resolvedParams.pillar || 'ALL',
                city: resolvedParams.city || 'ALL',
                model: resolvedParams.model || 'ALL',
                stage: resolvedParams.stage || 'ALL',
                crVerified: resolvedParams.crVerified === 'true',
                sort: resolvedParams.sort || 'RECENT',
              }}
            />
          </div>

          <aside className="mt-20 md:mt-24 rule-dot-t pt-5 grid gap-6 md:grid-cols-12 md:items-baseline">
            <h2 className="md:col-span-5 font-serif text-display-sm text-ink">Building a company in Saudi Arabia?</h2>
            <div className="md:col-span-7 md:border-l md:border-rule md:pl-10">
              <p className="text-[0.9375rem] leading-relaxed text-ink-2 max-w-xl">
                We add companies that have a commercial registration, a product people can use and a team we can name.
                Send us your details and a link to your public filings, and we’ll check them before listing.
              </p>
              <Link href="/about#listings" className="group mt-4 inline-flex items-center gap-2 text-sm text-ink">
                <span className="link-rule">How we check listings</span>
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
