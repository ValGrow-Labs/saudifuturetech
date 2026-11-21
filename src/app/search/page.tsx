import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { SearchClient } from './SearchClient';
import { searchUnifiedEcosystem } from '@/lib/founder-intelligence';
import { SITE_NAME } from '@/lib/constants';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: `Unified Search | Discover Startups, Investors & Opportunities | ${DEFAULT_SEO.siteName}`,
  description:
    'Search once across Saudi startups, venture capital, sovereign funds, non-dilutive grants, accelerators, and frontier technology intelligence.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: getCanonicalUrl('/search'),
  },
  openGraph: {
    title: `Unified Search | ${DEFAULT_SEO.siteName}`,
    description:
      'Search once across Saudi startups, venture capital, sovereign funds, non-dilutive grants, accelerators, and frontier technology intelligence.',
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
  if (
    rawCat === 'startups' ||
    rawCat === 'investors' ||
    rawCat === 'opportunities' ||
    rawCat === 'articles'
  ) {
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
    { label: 'Unified Search', current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827] font-sans">
      {/* Schema.org Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12 space-y-10 sm:space-y-14">
        <MainContainer size="default">
          {/* Breadcrumbs */}
          <div className="pb-6 border-b border-[#E2E8E4]">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Masthead */}
          <header className="pt-6 pb-6 space-y-3 border-b-2 border-[#0B6E4F]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#4B5563] font-heading">
                Unified Ecosystem Discovery
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight font-heading">
              Search Saudi Future Tech
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl leading-relaxed">
              Discover verified Saudi startups, active institutional investors, sovereign grants, compute subsidies, and frontier technology intelligence.
            </p>
          </header>

          {/* Interactive Search Client wrapped in Suspense */}
          <Suspense
            fallback={
              <div className="py-20 text-center text-ink-muted font-sans text-sm animate-pulse">
                Loading unified discovery index...
              </div>
            }
          >
            <SearchClient initialData={initialSearchData} />
          </Suspense>

          {/* Newsletter Banner */}
          <div className="pt-8">
            <NewsletterBanner />
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}
