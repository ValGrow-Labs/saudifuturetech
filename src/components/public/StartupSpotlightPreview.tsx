'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Package,
  Code2
} from 'lucide-react';
import { StartupItem } from './StartupDirectory';
import { formatDate } from '@/lib/utils';

interface StartupSpotlightPreviewProps {
  startups: StartupItem[];
}

export const StartupSpotlightPreview: React.FC<StartupSpotlightPreviewProps> = ({ startups }) => {
  const featuredItems = startups.slice(0, 4);

  const formatStage = (st: string) => {
    switch (st) {
      case 'PRE_SEED':
        return 'Pre-Seed';
      case 'SEED':
        return 'Seed';
      case 'SERIES_A':
        return 'Series A';
      case 'SERIES_B':
        return 'Series B';
      case 'SERIES_C':
        return 'Series C+';
      case 'GROWTH':
        return 'Growth / Scale';
      case 'BOOTSTRAPPED':
        return 'Bootstrapped';
      default:
        return st;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8E4] dark:border-[#1E3A4C]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19B5A3]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#19B5A3] font-sans">
              Verified Ventures Registry
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111827] dark:text-[#FAF9F6] tracking-tight">
            Saudi Tech Startups Spotlight
          </h2>
          <p className="text-sm text-[#4B5563] dark:text-[#94A3B8]">
            High-conviction technical teams building across AI, sovereign cloud, FinTech, and deep tech in Saudi Arabia.
          </p>
        </div>

        <Link
          href="/startups"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#102433] border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3] hover:bg-[#E8F5EF] dark:hover:bg-[#132B3D] transition-all font-sans uppercase tracking-wider shrink-0 shadow-2xs"
        >
          <span>Explore All Startups ({startups.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Spotlight Cards in 2-Column Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {featuredItems.map((s) => {
          const techList = Array.isArray(s.techStack) ? s.techStack.slice(0, 4) : [];

          return (
            <article
              key={s.id}
              className="group bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Zone 1: Name, Tagline, CR Badge & Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/startup/${s.slug}`} className="group/name">
                        <h3 className="font-heading font-black text-xl text-[#111827] dark:text-[#FAF9F6] group-hover/name:text-[#0B6E4F] dark:group-hover/name:text-[#19B5A3] transition-colors">
                          {s.name}
                        </h3>
                      </Link>
                      {s.verified && (
                        <span
                          title="Commercial Registration (CR) Audited via Ministry of Commerce / Wathiq"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/25 dark:border-[#19B5A3]/30"
                        >
                          <ShieldCheck className="w-3 h-3 text-[#0B6E4F] dark:text-[#19B5A3]" />
                          <span>CR Audited</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#4B5563] dark:text-[#94A3B8] line-clamp-1">
                      {s.tagline}
                    </p>
                  </div>

                  {s.category && (
                    <span
                      className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] shrink-0 border border-[#E2E8E4] dark:border-[#1E3A4C]"
                      style={{ color: s.category.color }}
                    >
                      {s.category.name}
                    </span>
                  )}
                </div>

                {/* Zone 2: Operational Metrics Ribbon */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] text-[#111827] dark:text-[#FAF9F6] font-bold border border-[#E2E8E4] dark:border-[#1E3A4C]">
                    {formatStage(s.stage)}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] text-[#4B5563] dark:text-[#94A3B8] font-semibold border border-[#E2E8E4] dark:border-[#1E3A4C]">
                    {s.businessModel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#4B5563] dark:text-[#94A3B8] bg-[#F1F5F2] dark:bg-[#132B3D] px-2.5 py-1 rounded-md border border-[#E2E8E4] dark:border-[#1E3A4C] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#94A3B8]" />
                    <span>{s.hqCity}</span>
                  </span>
                  <span className="text-xs text-[#4B5563] dark:text-[#94A3B8] bg-[#F1F5F2] dark:bg-[#132B3D] px-2.5 py-1 rounded-md border border-[#E2E8E4] dark:border-[#1E3A4C] font-medium">
                    Est. {s.foundingYear}
                  </span>
                </div>

                {/* Zone 3: Description */}
                <p className="text-sm text-[#374151] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                  {s.description}
                </p>

                {/* Zone 4: Key Milestone / Verified Traction */}
                {s.keyMetrics && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 border border-[#0B6E4F]/25 dark:border-[#19B5A3]/30 text-xs">
                    <TrendingUp className="w-4 h-4 text-[#0B6E4F] dark:text-[#19B5A3] shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-[#111827] dark:text-[#FAF9F6] leading-snug">
                      {s.keyMetrics}
                    </span>
                  </div>
                )}

                {/* Zone 5: Tech Stack Chips */}
                {techList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-[#E2E8E4] dark:border-[#1E3A4C]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#94A3B8] mr-1 flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-[#4B5563] dark:text-[#94A3B8]" />
                      <span>Tech Stack:</span>
                    </span>
                    {techList.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] text-[11px] font-mono text-[#111827] dark:text-[#FAF9F6] border border-[#E2E8E4] dark:border-[#1E3A4C]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Zone 6: Card Footer (Clear Action Button) */}
              <div className="pt-4 mt-5 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Audited {formatDate(s.verifiedAt)}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] text-[#111827] dark:text-[#FAF9F6] text-xs font-bold border border-[#E2E8E4] dark:border-[#1E3A4C] transition-colors"
                  >
                    <span>Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    href={`/startup/${s.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0B6E4F] hover:bg-[#08533C] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>View Startup Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
