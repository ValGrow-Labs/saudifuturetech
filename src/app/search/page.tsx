import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { SearchClient } from './SearchClient';
import { searchUnifiedEcosystem } from '@/lib/founder-intelligence';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

const DESCRIPTION =
  'Search Saudi Future Tech’s reporting and its directories of Saudi startups, investors, grants and accelerators in one place.';

export const metadata: Metadata = {
  title: `Search | ${DEFAULT_SEO.siteName}`,
  description: DESCRIPTION,
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: getCanonicalUrl('/search'),
  },
  openGraph: {
    title: `Search | ${DEFAULT_SEO.siteName}`,
    description: DESCRIPTION,
    type: 'website',
    url: getCanonicalUrl('/search'),
    siteName: DEFAULT_SEO.siteName,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const rawCat = resolvedParams.category || 'all';
  const page = parseInt(resolvedParams.page || '1', 10);

  let category: 'all' | 'startups' | 'investors' | 'opportunities' | 'articles' = 'all';
  if (rawCat === 'startups' || rawCat === 'investors' || rawCat === 'opportunities' || rawCat === 'articles') {
    category = rawCat;
  }

  const initialSearchData = await searchUnifiedEcosystem({
    query: q,
    category,
    page,
    limit: 12,
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mt-10 md:mt-12 mb-10 md:mb-12 max-w-3xl">
            <h1 className="font-serif text-display-lg text-ink">Search</h1>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3">
              One search across our reporting and the directories of startups, investors, grants and accelerators.
            </p>
          </header>

          <Suspense fallback={<p className="meta py-10">Loading search…</p>}>
            <SearchClient initialData={initialSearchData} />
          </Suspense>

          <NewsletterBanner className="mt-24 md:mt-28" />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
