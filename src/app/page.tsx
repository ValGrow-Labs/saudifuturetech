import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { NewsTicker } from '@/components/home/NewsTicker';
import { NewspaperFront } from '@/components/home/NewspaperFront';
import { GrantLedger } from '@/components/home/GrantLedger';
import { StartupRegister } from '@/components/home/StartupRegister';
import { LongReads } from '@/components/home/LongReads';
import { SectionIndex } from '@/components/home/SectionIndex';
import { LatestAndMostRead } from '@/components/home/LatestAndMostRead';
import { Reveal } from '@/components/public/Reveal';
import { SundayBrief } from '@/components/home/SundayBrief';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import {
  getFeaturedArticle,
  getSecondaryArticles,
  getEditorsPickArticles,
  getTrendingArticles,
  getAllCategories,
} from '@/lib/data';
import { getOpportunities, getStartups, getInvestors } from '@/lib/founder-intelligence';
import {
  SAMPLE_FEATURED_ARTICLE,
  SAMPLE_SECONDARY_ARTICLES,
  SAMPLE_EDITORS_PICK_ARTICLES,
  SAMPLE_TRENDING_ITEMS,
  EDITORIAL_CATEGORIES,
} from '@/lib/constants';
import type { OpportunityItem } from '@/components/public/OpportunityDirectory';
import type { StartupItem } from '@/components/public/StartupDirectory';

export const revalidate = 60;

/**
 * Directory sections are optional on the front page. If the database can't be
 * reached (e.g. during a build with no DB), render the page without them
 * instead of failing; ISR fills them in on the next revalidation.
 */
async function orEmpty<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch (error) {
    console.warn('[HomePage] directory query failed, rendering without it:', String(error).slice(0, 200));
    return [];
  }
}

const TITLE = 'Saudi Future Tech — reporting on technology in Saudi Arabia';
const DESCRIPTION =
  'Independent reporting on AI, government platforms, security, cities, finance and energy in Saudi Arabia — with a checked directory of open grants, startups and investors.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl('/') },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: getCanonicalUrl('/'),
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, site: DEFAULT_SEO.social.twitter },
};

export default async function HomePage() {
  const [featured, secondary, editorsPick, trending, categories, rawOpportunities, rawStartups, investors] = await Promise.all([
    getFeaturedArticle(),
    getSecondaryArticles(9),
    getEditorsPickArticles(4),
    getTrendingArticles(5),
    getAllCategories(),
    orEmpty(getOpportunities()),
    orEmpty(getStartups()),
    orEmpty(getInvestors()),
  ]);

  const lead = featured ?? SAMPLE_FEATURED_ARTICLE;
  const picksSource = (editorsPick.length ? editorsPick : SAMPLE_EDITORS_PICK_ARTICLES).filter((a) => a.id !== lead.id);
  const pickIds = new Set(picksSource.map((a) => a.id));

  // Front column and the latest stream leave out anything the editors picked,
  // so no story appears twice on the page.
  const allStream = (secondary.length ? secondary : SAMPLE_SECONDARY_ARTICLES).filter((a) => a.id !== lead.id);
  const stream = allStream.filter((a) => !pickIds.has(a.id));
  const frontColumn = (stream.length >= 4 ? stream : allStream).slice(0, 4);
  const latest = stream.length > 4 ? stream.slice(4, 9) : allStream.slice(0, 5);
  const picks = picksSource;

  // Five briefs for "The Kingdom at a Glance": newest first, skipping stories
  // already on the front page, topped up from trending and editors' picks.
  const onFront = new Set([lead.id, ...frontColumn.map((a) => a.id)]);
  const glance: typeof allStream = [];
  const belowLead: typeof allStream = [];
  for (const a of [...latest, ...allStream, ...trending, ...picksSource]) {
    if (onFront.has(a.id) || glance.some((g) => g.id === a.id) || belowLead.some((g) => g.id === a.id)) continue;
    if (glance.length < 5) glance.push(a);
    else if (belowLead.length < 2) belowLead.push(a);
  }

  const mostRead = trending.length
    ? trending.map((a) => ({ title: a.title, slug: a.slug, category: a.category.name }))
    : SAMPLE_TRENDING_ITEMS.map((t) => ({ title: t.title, slug: t.categorySlug, category: t.category }));

  const sections = categories.length ? categories : EDITORIAL_CATEGORIES;

  const opportunities: OpportunityItem[] = rawOpportunities.map((o) => ({
    id: o.id,
    title: o.title,
    slug: o.slug,
    organization: o.organization,
    category: o.category,
    fundingAmount: o.fundingAmount,
    equityTaken: o.equityTaken,
    location: o.location,
    description: o.description,
    eligibilitySummary: o.eligibilitySummary,
    eligibilityCriteria: o.eligibilityCriteria,
    status: o.status,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    applicationUrl: o.applicationUrl,
    sourceName: o.sourceName,
    verifiedAt: o.verifiedAt.toISOString(),
    isFeatured: o.isFeatured,
    categoryRel: o.categoryRel,
  }));

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
    verifiedAt: s.verifiedAt.toISOString(),
    isFeatured: s.isFeatured,
    techStack: s.techStack,
    keyMetrics: s.keyMetrics,
    category: s.category,
  }));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SiteHeader />

      <main id="main" className="flex-1">
        <NewsTicker items={mostRead.map((m) => ({ title: m.title, href: `/article/${m.slug}`, label: m.category }))} />
        <MainContainer className="pt-6 md:pt-8 space-y-14 md:space-y-16 pb-14 md:pb-16">
          <Reveal>
            <NewspaperFront lead={lead} side={frontColumn} glance={glance} belowLead={belowLead} />
          </Reveal>
          {opportunities.length > 0 && (
            <Reveal>
              <GrantLedger opportunities={opportunities} total={opportunities.length} />
            </Reveal>
          )}
          <Reveal>
            <SectionIndex sections={sections} />
          </Reveal>
          <Reveal>
            <LongReads articles={picks} />
          </Reveal>
          {startups.length > 0 && (
            <Reveal>
              <StartupRegister startups={startups} total={startups.length} />
            </Reveal>
          )}
          <Reveal>
            <LatestAndMostRead latest={latest} mostRead={mostRead} />
          </Reveal>
        </MainContainer>
        <Reveal>
          <SundayBrief />
        </Reveal>
      </main>

      <SiteFooter />
    </>
  );
}
