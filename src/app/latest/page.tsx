import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import Link from 'next/link';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { LatestArticlesClient } from './LatestArticlesClient';
import { getAllPublishedArticles, getAllCategories } from '@/lib/data';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

// Next.js ISR: Revalidate latest wire every 60 seconds
export const revalidate = 60;

const latestCanonical = getCanonicalUrl('/latest');

export const metadata: Metadata = {
  title: `Latest stories | ${DEFAULT_SEO.siteName}`,
  description:
    'Every story from Saudi Future Tech, newest first: AI, government platforms, security, cities, finance and energy in Saudi Arabia.',
  alternates: {
    canonical: latestCanonical,
  },
  openGraph: {
    title: `Latest stories | ${DEFAULT_SEO.siteName}`,
    description:
      'Every story from Saudi Future Tech, newest first: AI, government platforms, security, cities, finance and energy in Saudi Arabia.',
    type: 'website',
    url: latestCanonical,
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Latest stories | ${DEFAULT_SEO.siteName}`,
    description:
      'Every story from Saudi Future Tech, newest first: AI, government platforms, security, cities, finance and energy in Saudi Arabia.',
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
    { label: 'Latest', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-6 md:pt-8 pb-24 space-y-20 md:space-y-28">
          <div>
            <nav aria-label="Breadcrumb" className="meta">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              <span className="mx-2 text-ink-4">/</span>
              <span>Latest</span>
            </nav>

            <header className="mt-10 md:mt-14 mb-10 grid gap-6 lg:grid-cols-12 lg:gap-x-10 lg:items-end">
              <div className="lg:col-span-8">
                <p className="kicker mb-3">Every story</p>
                <h1 className="font-serif text-display-lg text-ink">Latest</h1>
                <p className="mt-5 max-w-2xl font-serif text-[1.25rem] leading-snug text-ink-3">
                  Everything we’ve published across every section, newest first.
                </p>
              </div>
            </header>

            <LatestArticlesClient initialArticles={articles} categories={categories} />
          </div>

          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
