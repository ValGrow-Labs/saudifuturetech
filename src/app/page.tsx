import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { FounderCommandHero } from '@/components/public/FounderCommandHero';
import { OpportunityRadarPreview } from '@/components/public/OpportunityRadarPreview';
import { StartupSpotlightPreview } from '@/components/public/StartupSpotlightPreview';
import { EditorialPillarsSection } from '@/components/public/EditorialPillarsSection';
import { EditorsSelectionSection } from '@/components/public/EditorsSelectionSection';
import { LatestStoriesSection } from '@/components/public/LatestStoriesSection';
import { TrendingRail } from '@/components/public/TrendingRail';
import { ProvenanceTrustGuarantee } from '@/components/public/ProvenanceTrustGuarantee';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { BackToTopButton } from '@/components/public/BackToTopButton';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import {
  getFeaturedArticle,
  getSecondaryArticles,
  getEditorsPickArticles,
  getTrendingArticles,
  getAllCategories,
} from '@/lib/data';
import { getOpportunities, getStartups } from '@/lib/founder-intelligence';
import {
  SAMPLE_FEATURED_ARTICLE,
  SAMPLE_SECONDARY_ARTICLES,
  SAMPLE_EDITORS_PICK_ARTICLES,
  EDITORIAL_CATEGORIES,
} from '@/lib/constants';

// Next.js ISR: Revalidate homepage every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Saudi Future Tech | Build in the Kingdom. Powered by verified intelligence.',
  description:
    'Build in the Kingdom. Powered by verified intelligence. Discover verified grants, venture capital, emerging startups, and sovereign technology across Saudi Arabia.',
  alternates: {
    canonical: getCanonicalUrl('/'),
  },
  openGraph: {
    title: 'Saudi Future Tech | Build in the Kingdom. Powered by verified intelligence.',
    description:
      'Build in the Kingdom. Powered by verified intelligence. Discover verified grants, venture capital, emerging startups, and sovereign technology across Saudi Arabia.',
    url: getCanonicalUrl('/'),
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saudi Future Tech | Build in the Kingdom. Powered by verified intelligence.',
    description:
      'Build in the Kingdom. Powered by verified intelligence. Discover verified grants, venture capital, emerging startups, and sovereign technology across Saudi Arabia.',
    site: DEFAULT_SEO.social.twitter,
  },
};

export default async function HomePage() {
  const [
    featuredArticle,
    secondaryArticles,
    editorsPickArticles,
    trendingArticles,
    categories,
    rawOpportunities,
    rawStartups,
  ] = await Promise.all([
    getFeaturedArticle(),
    getSecondaryArticles(4),
    getEditorsPickArticles(4),
    getTrendingArticles(5),
    getAllCategories(),
    getOpportunities(),
    getStartups(),
  ]);

  const activeSecondary = secondaryArticles.length > 0 ? secondaryArticles : SAMPLE_SECONDARY_ARTICLES;
  const activeEditorsPick = editorsPickArticles.length > 0 ? editorsPickArticles : SAMPLE_EDITORS_PICK_ARTICLES;
  const activeCategories = categories.length > 0 ? categories : EDITORIAL_CATEGORIES;

  // Serialize opportunities
  const opportunities = rawOpportunities.map((opp) => ({
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
    status: opp.status,
    deadline: opp.deadline ? opp.deadline.toISOString() : null,
    applicationUrl: opp.applicationUrl,
    sourceName: opp.sourceName,
    verifiedAt: opp.verifiedAt.toISOString(),
    isFeatured: opp.isFeatured,
    categoryRel: opp.categoryRel,
  }));

  // Serialize startups
  const startups = rawStartups.map((s) => ({
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
    verifiedAt: s.verifiedAt.toISOString(),
    isFeatured: s.isFeatured,
    techStack: s.techStack,
    keyMetrics: s.keyMetrics,
    category: s.category,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body">
      {/* Schema.org Structured Data */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* 1. Full-Bleed Cinematic Hero Section with Integrated Transparent Header (Vision 2030 Style) */}
      <div className="relative w-full overflow-hidden">
        <SiteHeader variant="transparent-hero" />
        <FounderCommandHero
          opportunitiesCount={opportunities.length}
          startupsCount={startups.length}
          pillarsCount={activeCategories.length}
        />
      </div>

      {/* Main Operating Terminal Canvas */}
      <main className="flex-1 py-10 sm:py-16 font-sans">
        <MainContainer className="space-y-16 sm:space-y-20">
          {/* 2. Verified Opportunity Radar Strip */}
          <section aria-label="Verified Opportunity Radar">
            <OpportunityRadarPreview opportunities={opportunities} />
          </section>

          {/* 3. Verified Saudi Startups Spotlight */}
          <section aria-label="Verified Saudi Startups">
            <StartupSpotlightPreview startups={startups} />
          </section>

          {/* 4. Six Sovereign Pillars of Saudi Technology Grid */}
          <section aria-label="Six Sovereign Pillars of Saudi Technology">
            <EditorialPillarsSection categories={activeCategories} />
          </section>

          {/* 5. In-Depth Founder Intelligence Briefings */}
          <section aria-label="Founder Intelligence Briefings">
            <EditorsSelectionSection articles={activeEditorsPick} />
          </section>

          {/* 6. Technology Stream & Velocity Rail */}
          <section aria-label="Latest Stream and Trending Index">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <LatestStoriesSection articles={activeSecondary} />
              </div>
              <div className="lg:col-span-4 sticky top-20">
                <TrendingRail articles={trendingArticles} />
              </div>
            </div>
          </section>

          {/* 7. Data Sovereignty & Provenance Guarantee */}
          <section aria-label="Data Sovereignty & Provenance">
            <ProvenanceTrustGuarantee />
          </section>

          {/* 8. Sunday Founder Briefing Newsletter */}
          <section aria-label="Sunday Founder Briefing">
            <NewsletterBanner />
          </section>
        </MainContainer>
      </main>

      {/* Floating Smooth Scroll to Top Action */}
      <BackToTopButton />

      {/* Publication Footer */}
      <SiteFooter />
    </div>
  );
}
