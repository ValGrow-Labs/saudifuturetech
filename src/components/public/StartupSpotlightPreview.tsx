'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { StartupItem } from './StartupDirectory';

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
        return 'Growth';
      default:
        return st;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-editorial-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal font-sans">
              Verified Ventures Registry
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-ink-high tracking-tight">
            Saudi Tech Startups Spotlight
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            High-conviction technical teams building across AI, sovereign cloud, FinTech, and deep tech.
          </p>
        </div>

        <Link
          href="/startups"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-teal transition-colors font-sans uppercase tracking-wider shrink-0"
        >
          <span>Explore All Startups ({startups.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredItems.map((s) => {
          const techList = Array.isArray(s.techStack) ? s.techStack.slice(0, 3) : [];

          return (
            <div
              key={s.id}
              className="min-w-0 w-full overflow-hidden bg-editorial-pure rounded-lg border border-editorial-hairline hover:border-brand-teal/50 hover:shadow-sm transition-all p-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <div className="flex items-center gap-1">
                      <Link href={`/startup/${s.slug}`}>
                        <h3 className="font-heading font-bold text-base text-ink-high hover:text-brand-navy leading-tight transition-colors">
                          {s.name}
                        </h3>
                      </Link>
                      {s.verified && (
                        <span title="Verified KSA Entity">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-oasis" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-muted line-clamp-1">
                      {s.tagline}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-xs bg-brand-sand text-[10px] font-bold text-ink-high shrink-0">
                    {formatStage(s.stage)}
                  </span>
                </div>

                <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                  {s.description}
                </p>

                {/* Key Metrics */}
                {s.keyMetrics && (
                  <div className="p-2 rounded-xs bg-brand-oasis/5 border border-brand-oasis/20 text-[10px] font-medium text-ink-high line-clamp-1">
                    ⚡ {s.keyMetrics}
                  </div>
                )}

                {/* Tech Pills */}
                {techList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {techList.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 rounded-xs bg-editorial-sand text-[9px] font-mono text-ink-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-editorial-hairline flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[10px] text-ink-faint">
                  <MapPin className="w-3 h-3" />
                  {s.hqCity}
                </span>
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/startup/${s.slug}`}
                    className="font-semibold text-brand-navy hover:text-brand-teal text-xs transition-colors"
                  >
                    Dossier
                  </Link>
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-ink-muted hover:text-ink-high text-xs transition-colors"
                  >
                    <span>Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
