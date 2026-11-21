import React from 'react';
import type { Metadata } from 'next';
import { Mail, CheckCircle2, ShieldCheck, Cpu, Globe2, Building2, Layers } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import { SITE_NAME } from '@/lib/constants';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

const newsletterCanonical = getCanonicalUrl('/newsletter');

export const metadata: Metadata = {
  title: `Executive Intelligence Briefing | ${DEFAULT_SEO.siteName}`,
  description:
    'Subscribe to the weekly Saudi Future Tech Executive Briefing for curated intelligence on foundation models, cognitive giga-projects, and sovereign venture investments.',
  alternates: {
    canonical: newsletterCanonical,
  },
  openGraph: {
    title: `Executive Intelligence Briefing | ${DEFAULT_SEO.siteName}`,
    description:
      'Subscribe to the weekly Saudi Future Tech Executive Briefing for curated intelligence on foundation models, cognitive giga-projects, and sovereign venture investments.',
    type: 'website',
    url: newsletterCanonical,
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Executive Intelligence Briefing | ${DEFAULT_SEO.siteName}`,
    description:
      'Subscribe to the weekly Saudi Future Tech Executive Briefing for curated intelligence on foundation models, cognitive giga-projects, and sovereign venture investments.',
    site: DEFAULT_SEO.social.twitter,
  },
};

export default function NewsletterPage() {
  const briefingPillars = [
    {
      icon: Cpu,
      title: 'Foundation Models & Sovereign Compute',
      description: 'Technical teardowns of ALLaM, Arabic LLM benchmarks, and sovereign GPU cluster deployments across the Kingdom.',
    },
    {
      icon: Building2,
      title: 'Cognitive Infrastructure & Giga-Projects',
      description: 'First-hand architectural analysis of THE LINE sensory fabrics, OXAGON automated logistics, and Red Sea microgrids.',
    },
    {
      icon: Layers,
      title: 'FinTech & Regulatory Sandbox Evolution',
      description: 'Deep dives into SAMA open banking directives, instant cross-border settlement rails, and venture financing.',
    },
    {
      icon: Globe2,
      title: 'Clean Energy & Desalination Microgrids',
      description: 'Field telemetry from utility-scale solar arrays, green hydrogen electrolysis, and quantum desalination pilots.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body font-sans">
      {/* Schema.org Structured Data */}
      <BreadcrumbJsonLd
        items={[
          { label: 'Home', href: '/' },
          { label: 'Executive Intelligence Briefing', current: true },
        ]}
      />

      <SiteHeader />

      <main className="flex-1 py-12 sm:py-16 space-y-16">
        <MainContainer>
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-high bg-editorial-sand px-3 py-1 rounded-xs border border-editorial-hairline font-sans">
              <Mail className="w-3.5 h-3.5" />
              <span>Weekly Executive Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-ink-high tracking-tight leading-tight">
              Curated Technology Intelligence for Vision 2030 Leaders
            </h1>

            <p className="text-base sm:text-lg text-ink-body font-sans leading-relaxed max-w-2xl mx-auto">
              Delivered every Tuesday morning to technology executives, startup founders, sovereign fund investors, and enterprise architects shaping Saudi Arabia’s technological transformation.
            </p>

            {/* Subscription Form Card */}
            <div className="p-6 sm:p-8 bg-editorial-pure rounded-xs border border-editorial-hairline shadow-xs max-w-xl mx-auto text-center">
              <NewsletterForm variant="standalone" />
            </div>
          </div>

          {/* Editorial Pillars Grid */}
          <div className="pt-16 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted font-sans">
                Editorial Breadth
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink-high">
                What the Executive Briefing Covers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {briefingPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-6 bg-editorial-pure rounded-xs border border-editorial-hairline space-y-3 hover:shadow-xs transition-editorial"
                  >
                    <div className="w-9 h-9 rounded-xs bg-editorial-sand border border-editorial-hairline flex items-center justify-center text-brand-gold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-ink-high">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-body leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}
