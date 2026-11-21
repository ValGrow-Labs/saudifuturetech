import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Compass, Award, BookOpen, ArrowRight, Building2, Cpu, Globe2, Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { OrganizationJsonLd, BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { EDITORIAL_CATEGORIES, SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About the Journal | ${SITE_NAME}`,
  description:
    'Saudi Future Tech is the independent journal of record documenting the Kingdom of Saudi Arabia’s sovereign AI architecture, cognitive infrastructure, and Vision 2030 innovation.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  openGraph: {
    title: `About the Journal | ${SITE_NAME}`,
    description:
      'The independent journal of record documenting Saudi Arabia’s sovereign AI infrastructure, cognitive cities, and frontier technology ecosystem.',
    url: getCanonicalUrl('/about'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About the Journal | ${SITE_NAME}`,
    description:
      'The independent journal of record documenting Saudi Arabia’s sovereign AI infrastructure, cognitive cities, and frontier technology ecosystem.',
  },
};

export default function AboutPage() {
  const editorialPrinciples = [
    {
      icon: ShieldCheck,
      title: 'Architectural Rigor',
      description:
        'We evaluate systems from the bare metal up: analyzing tensor topologies, energy microgrid telemetry, and cryptography standards rather than recycling vendor press releases.',
    },
    {
      icon: Compass,
      title: 'Vision 2030 Ground Truth',
      description:
        'Field-verified reporting directly from Riyadh, NEOM, Tabuk, and Jubail—grounding digital public infrastructure and giga-project milestones in observable operational realities.',
    },
    {
      icon: BookOpen,
      title: 'Literary Editorial Craft',
      description:
        'Long-form investigative journalism that pairs deep technical literacy with narrative precision, designed for senior architects, engineers, policymakers, and venture leaders.',
    },
  ];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'About the Journal', current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body font-sans selection:bg-brand-yellow/30">
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12">
        <MainContainer size="default" className="space-y-16 sm:space-y-20">
          {/* Breadcrumb Navigation */}
          <div className="pb-6 border-b border-editorial-hairline">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Masthead Mission Statement */}
          <section aria-label="Editorial Mission" className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-high bg-editorial-sand px-3 py-1 rounded-xs border border-editorial-hairline font-sans">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Independent Journal of Record</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-ink-high tracking-tight leading-[1.12]">
              Documenting the Sovereign Tech Transformation
            </h1>

            <p className="text-lg sm:text-xl font-serif italic text-ink-muted leading-relaxed">
              &ldquo;{SITE_TAGLINE}&rdquo;
            </p>

            <p className="text-sm sm:text-base text-ink-body leading-relaxed font-sans pt-2">
              Founded in 2026, <strong>{SITE_NAME}</strong> is an independent editorial journal dedicated to technical deep dives, architectural breakdowns, and strategic reporting across Saudi Arabia&apos;s rapidly accelerating technology ecosystem and the broader Gulf Cooperation Council (GCC).
            </p>
          </section>

          {/* Editorial Principles Grid */}
          <section aria-label="Editorial Principles" className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink-high tracking-tight">
                Editorial Philosophy
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted font-sans">
                Our investigations adhere to strict journalistic independence and engineering verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editorialPrinciples.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.title}
                    className="p-6 sm:p-8 bg-editorial-pure rounded-xs border border-editorial-hairline space-y-4 hover:shadow-xs transition-editorial"
                  >
                    <div className="w-10 h-10 rounded-xs bg-editorial-sand border border-editorial-hairline flex items-center justify-center text-brand-gold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-ink-high">
                      {principle.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-body leading-relaxed font-sans">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Six Coverage Pillars Section */}
          <section aria-label="Coverage Desks" className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink-high">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-ink-high">
                Editorial Coverage Desks
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted font-sans">
                6 Active Verticals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EDITORIAL_CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="p-5 bg-editorial-pure rounded-xs border border-editorial-hairline hover:border-brand-yellow hover:shadow-xs transition-editorial group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="font-bold text-ink-muted uppercase tracking-wider">
                        DESK 0{idx + 1}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base font-serif font-bold text-ink-high group-hover:text-brand-gold transition-editorial">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-ink-muted font-sans line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <span className="text-xs font-bold font-sans uppercase tracking-wider text-ink-high group-hover:text-brand-gold inline-flex items-center gap-1 pt-2 border-t border-editorial-hairline">
                    <span>Explore Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Ethics & Editorial Standards */}
          <section aria-label="Ethics and Standards" className="p-8 sm:p-10 bg-editorial-sand rounded-xs border border-editorial-hairline space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-gold" />
              <h2 className="text-xl sm:text-2xl font-serif font-black text-ink-high">
                Standards of Editorial Independence
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-body leading-relaxed font-sans max-w-3xl">
              Saudi Future Tech operates with strict editorial separation between reporting desks and corporate sponsors. We clearly disclose all technical trial partnerships, academic research affiliations, and data access sources. Any demonstration data or experimental sandbox reports are explicitly labeled as demonstration editorial content.
            </p>
            <div className="pt-2">
              <span className="text-xs text-ink-muted font-sans font-medium">
                Inquiries &amp; Confidential Submissions: <a href="mailto:editorial@saudifuturetech.com" className="text-ink-high underline hover:text-brand-gold">editorial@saudifuturetech.com</a>
              </span>
            </div>
          </section>

          {/* Newsletter Section */}
          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}

