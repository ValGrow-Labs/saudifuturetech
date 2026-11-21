import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { LatestArticlesClient } from './LatestArticlesClient';
import { getAllPublishedArticles, getAllCategories } from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

// Next.js ISR: Revalidate latest wire every 60 seconds
export const revalidate = 60;

const latestCanonical = getCanonicalUrl('/latest');

export const metadata: Metadata = {
  title: `Latest News & Technical Briefings | ${DEFAULT_SEO.siteName}`,
  description:
    'Chronological coverage of artificial intelligence, sovereign cloud, GovTech, smart cities, and fintech across Saudi Arabia.',
  alternates: {
    canonical: latestCanonical,
  },
  openGraph: {
    title: `Latest News & Technical Briefings | ${DEFAULT_SEO.siteName}`,
    description:
      'Chronological coverage of artificial intelligence, sovereign cloud, GovTech, smart cities, and fintech across Saudi Arabia.',
    type: 'website',
    url: latestCanonical,
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Latest News & Technical Briefings | ${DEFAULT_SEO.siteName}`,
    description:
      'Chronological coverage of artificial intelligence, sovereign cloud, GovTech, smart cities, and fintech across Saudi Arabia.',
    site: DEFAULT_SEO.social.twitter,
  },
};

export default async function LatestPage() {
  const [articles, categories] = await Promise.all([
    getAllPublishedArticles(),
    getAllCategories(),
  ]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Latest News & Briefings', current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827]">
      {/* Schema.org Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12 space-y-10 sm:space-y-14">
        <MainContainer size="default">
          {/* Breadcrumbs */}
          <div className="pb-6 border-b border-[#E2E8E4]">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Page Masthead */}
          <header className="pt-4 pb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563] font-sans">
                Real-Time Editorial Stream
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#111827] tracking-tight">
              Latest Technical Briefings
            </h1>

            <p className="text-sm sm:text-base text-[#4B5563] font-sans max-w-2xl leading-relaxed">
              Chronological reporting, deep investigations, and architecture breakdowns documenting the Kingdom’s technological transformation and Vision 2030 initiatives.
            </p>
          </header>

          {/* Interactive Filterable Stream */}
          <LatestArticlesClient
            initialArticles={articles}
            categories={categories}
          />

          {/* Newsletter Subscription */}
          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}
