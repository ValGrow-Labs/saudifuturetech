import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { getAllPublishedArticles, getAllCategories } from '@/lib/data';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { Sparkles, BookOpen, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

const canonicalUrl = getCanonicalUrl('/insights');

export const metadata: Metadata = {
  title: 'Founder Insights & Regulatory Intelligence | Saudi Future Tech',
  description:
    'Deep-dive analysis, regulatory tear-downs, market intelligence, and architectural briefs for technology founders building in Saudi Arabia.',
  alternates: {
    canonical: canonicalUrl,
  },
};

export default async function InsightsPage() {
  const [articles, categories] = await Promise.all([
    getAllPublishedArticles(),
    getAllCategories(),
  ]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Insights & Briefings', current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827]">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main className="flex-1 pb-20">
        {/* 1. Masthead */}
        <div className="bg-[#F1F5F2] border-b border-[#E2E8E4] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8E4] text-xs font-semibold text-[#111827]">
                <BookOpen className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>Founder Operating Intelligence &amp; Research</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#111827] leading-tight">
                Insights &amp; Executive Briefings
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                Strategic teardowns, regulatory frameworks, sovereign compute benchmarks, and market analysis designed to help Saudi startup founders make high-conviction architecture and expansion decisions.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
                  <span>Institutional Research • Zero Sponsored Filler</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                  <span>CMA, SAMA &amp; SDAIA Framework Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Featured In-Depth Reports */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="group bg-white rounded-lg border border-[#E2E8E4] hover:border-[#0B6E4F]/50 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {art.coverImageUrl && (
                    <div className="relative aspect-[16/9] w-full bg-[#F1F5F2] overflow-hidden">
                      <Image
                        src={art.coverImageUrl}
                        alt={art.title}
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {art.category && (
                        <span
                          className="font-bold text-[10px] uppercase tracking-wider"
                          style={{ color: art.category.color }}
                        >
                          {art.category.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#4B5563]">
                        <Clock className="w-3 h-3 text-[#C9A227]" />
                        {art.readingTimeMinutes} min read
                      </span>
                    </div>

                    <Link href={`/article/${art.slug}`}>
                      <h2 className="font-heading font-bold text-lg text-[#111827] group-hover:text-[#0B6E4F] transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#4B5563]">
                    {art.author?.displayName || 'SFT Research Desk'}
                  </span>
                  <Link
                    href={`/article/${art.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#0B6E4F] hover:text-[#08533C] transition-colors"
                  >
                    <span>Read Briefing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
