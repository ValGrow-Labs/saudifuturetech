import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import type { OpportunityItem } from '@/components/public/OpportunityDirectory';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface CategoryDeskData {
  slug: string;
  name: string;
  leadArticle?: ArticlePreview;
  headlines: ArticlePreview[];
}

interface CategoryDesksSectionProps {
  desks: CategoryDeskData[];
  mostRead: { title: string; slug: string; category: string }[];
  opportunities: OpportunityItem[];
}

export function CategoryDesksSection({ desks, mostRead, opportunities }: CategoryDesksSectionProps) {
  const topGrants = opportunities.slice(0, 4);

  return (
    <section aria-labelledby="desks-heading" className="pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================================== */}
        {/* LEFT 8 COLS: 6 Category Desks in a 2-Column Grid                     */}
        {/* ==================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-rule/60">
            <div>
              <p className="kicker mb-1">Deep Dives by Sector</p>
              <h2 id="desks-heading" className="font-serif font-black text-2xl sm:text-3xl text-ink">
                Intelligence Desks
              </h2>
            </div>
            <span className="text-xs text-ink-3 hidden sm:inline">
              Daily verified reporting across 6 national sectors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {desks.map((desk) => (
              <div
                key={desk.slug}
                className="bg-white rounded-[22px] p-5 sm:p-6 border border-rule/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Desk Header */}
                <div className="flex items-center justify-between pb-2 border-b border-rule/30">
                  <h3 className="font-serif font-bold text-lg text-ink">
                    <Link href={`/category/${desk.slug}`} className="hover:text-clay transition-colors">
                      {desk.name}
                    </Link>
                  </h3>
                  <Link
                    href={`/category/${desk.slug}`}
                    className="text-xs font-semibold text-[#11603F] hover:text-clay transition-colors inline-flex items-center gap-1"
                  >
                    <span>More</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Featured Story in this desk */}
                {desk.leadArticle && (
                  <div className="group pt-1">
                    <Link
                      href={`/article/${desk.leadArticle.slug}`}
                      className="grid grid-cols-[1fr_5rem] gap-3 items-start"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#11603F]">
                          Featured Intelligence
                        </span>
                        <h4 className="font-serif font-bold text-sm leading-snug text-ink group-hover:text-clay transition-colors line-clamp-2">
                          {desk.leadArticle.title}
                        </h4>
                      </div>
                      {desk.leadArticle.coverImageUrl && (
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-paper-band shrink-0">
                          <Image
                            src={desk.leadArticle.coverImageUrl}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </Link>
                  </div>
                )}

                {/* Bulleted list of headlines */}
                <ul className="space-y-2.5 pt-2 border-t border-rule/30 text-xs leading-relaxed text-ink-2">
                  {desk.headlines.slice(0, 4).map((h) => (
                    <li key={h.id} className="group flex items-start gap-2">
                      <span className="text-[#11603F] font-bold select-none">•</span>
                      <Link
                        href={`/article/${h.slug}`}
                        className="hover:text-clay transition-colors line-clamp-2"
                      >
                        {h.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT 4 COLS: The 3-Part Curated Editorial Sidebar                   */}
        {/* ==================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. MOST READ CARD (Warm sand background) */}
          <div className="bg-[#F4EFE6] rounded-[22px] p-5 sm:p-6 border border-rule/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rule/40">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <span className="text-[#B3361F] text-xs">◆</span>
                <span>Most read</span>
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                Top Velocity
              </span>
            </div>

            <ol className="space-y-3.5">
              {mostRead.slice(0, 5).map((item, idx) => (
                <li key={item.slug || idx} className="flex items-start gap-3 group">
                  <span className="font-serif font-bold text-xl text-[#B3361F] shrink-0 w-5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <Link
                      href={`/article/${item.slug}`}
                      className="font-serif font-bold text-xs leading-snug text-ink group-hover:text-clay transition-colors line-clamp-2 block"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[10px] font-medium text-ink-3 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 2. VERIFIED OPPORTUNITIES RADAR (Clean white card) */}
          <div className="bg-white rounded-[22px] p-5 sm:p-6 border border-rule/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rule/30">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <span className="text-[#11603F] text-xs">◆</span>
                <span>Open Grants</span>
              </h3>
              <Link
                href="/opportunities"
                className="text-xs font-semibold text-[#11603F] hover:text-clay transition-colors"
              >
                All grants →
              </Link>
            </div>

            <div className="divide-y divide-rule/30">
              {topGrants.map((opp, idx) => (
                <article key={opp.id} className="py-3 first:pt-0 last:pb-0 group">
                  <Link href={`/opportunity/${opp.slug}`} className="space-y-1 block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#11603F] uppercase tracking-wider truncate">
                        {opp.organization}
                      </span>
                      {opp.fundingAmount && (
                        <span className="px-2 py-0.5 rounded-full bg-[#11603F]/10 text-[#11603F] text-[10px] font-bold whitespace-nowrap">
                          {opp.fundingAmount.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-xs leading-snug text-ink group-hover:text-clay transition-colors line-clamp-1">
                      {opp.title}
                    </h4>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* 3. FOUNDER FAST-TRACK (Deep emerald card) */}
          <div className="bg-[#11603F] text-white rounded-[22px] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                Quick Navigation
              </span>
              <h3 className="font-serif font-bold text-lg text-white">
                Founder Fast-Track
              </h3>
            </div>

            <div className="space-y-2 pt-2 text-xs font-semibold">
              <Link
                href="/opportunities"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span>Verified Grants & Accelerators</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
              </Link>
              <Link
                href="/startups"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span>Verified Tech Startup Register</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
              </Link>
              <Link
                href="/funding"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span>Venture Capital & Sovereign Funds</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span>Unified Ecosystem Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryDesksSection;
