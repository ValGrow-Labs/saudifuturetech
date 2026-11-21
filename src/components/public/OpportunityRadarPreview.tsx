'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Clock, 
  Coins, 
  Building2, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { OpportunityItem } from './OpportunityDirectory';

interface OpportunityRadarPreviewProps {
  opportunities: OpportunityItem[];
}

export const OpportunityRadarPreview: React.FC<OpportunityRadarPreviewProps> = ({ opportunities }) => {
  const featuredItems = opportunities.slice(0, 4);

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-editorial-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-oasis" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-oasis font-sans">
              Verified Opportunity Radar
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-ink-high tracking-tight">
            Active Founder Grants &amp; Accelerators
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Verified non-dilutive capital, state-backed labs, and regulatory testing cohorts closing soon.
          </p>
        </div>

        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-teal transition-colors font-sans uppercase tracking-wider shrink-0"
        >
          <span>View All Opportunities ({opportunities.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {featuredItems.map((opp) => {
          const isClosingSoon = opp.status === 'CLOSING_SOON';
          return (
            <div
              key={opp.id}
              className="bg-editorial-pure rounded-lg border border-editorial-hairline hover:border-brand-teal/50 hover:shadow-sm transition-all p-4 flex flex-col justify-between min-w-0 w-full overflow-hidden"
            >
              <div className="space-y-2.5 min-w-0">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="font-bold text-ink-muted tracking-tight truncate min-w-0">
                    {opp.organization}
                  </span>
                  {opp.deadline ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isClosingSoon
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-brand-sand text-ink-high'
                      }`}
                    >
                      {isClosingSoon ? 'Closing Soon' : 'Open'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-sand text-ink-high shrink-0">
                      Rolling
                    </span>
                  )}
                </div>

                <Link href={`/opportunity/${opp.slug}`} className="block min-w-0">
                  <h3 className="font-heading font-bold text-sm text-ink-high hover:text-brand-navy leading-snug line-clamp-2 transition-colors">
                    {opp.title}
                  </h3>
                </Link>

                {opp.fundingAmount && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-brand-oasis/10 text-brand-oasis text-xs font-bold max-w-full min-w-0 overflow-hidden">
                    <Coins className="w-3 h-3 shrink-0" />
                    <span className="truncate min-w-0">{opp.fundingAmount}</span>
                  </div>
                )}

                <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-editorial-hairline flex items-center justify-between text-xs">
                <span className="text-[10px] text-ink-faint">
                  {opp.equityTaken || '0% Equity'}
                </span>
                <a
                  href={opp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-navy hover:text-brand-teal text-xs"
                >
                  <span>Apply</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
