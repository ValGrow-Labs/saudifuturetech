'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Coins, 
  Building2, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  Check
} from 'lucide-react';
import { OpportunityItem } from './OpportunityDirectory';
import { formatDate } from '@/lib/utils';

interface OpportunityRadarPreviewProps {
  opportunities: OpportunityItem[];
}

export const OpportunityRadarPreview: React.FC<OpportunityRadarPreviewProps> = ({ opportunities }) => {
  const featuredItems = opportunities.slice(0, 4);

  const renderStatusBadge = (opp: OpportunityItem) => {
    const isClosingSoon = opp.status === 'CLOSING_SOON';
    const isClosed = opp.status === 'CLOSED' || opp.isExpired;

    if (isClosed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F2] dark:bg-[#132B3D] text-[#4B5563] dark:text-[#94A3B8] border border-[#E2E8E4] dark:border-[#1E3A4C]">
          <Clock className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#94A3B8]" />
          <span>Cohort Closed</span>
        </span>
      );
    }

    if (!opp.deadline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/30 dark:border-[#19B5A3]/30">
          <Clock className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#19B5A3]" />
          <span>Rolling Admission</span>
        </span>
      );
    }

    if (isClosingSoon) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF8EC] dark:bg-[#C9A227]/20 text-[#9A7B1C] dark:text-[#F4C542] border border-[#C9A227] dark:border-[#C9A227]/50">
          <Clock className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
          <span>Closing Soon</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/30 dark:border-[#19B5A3]/30">
        <Clock className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#19B5A3]" />
        <span>Open Admission</span>
      </span>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8E4] dark:border-[#1E3A4C]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B6E4F] dark:bg-[#19B5A3]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] dark:text-[#19B5A3] font-sans">
              Verified Opportunity Radar
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111827] dark:text-[#FAF9F6] tracking-tight">
            Active Founder Grants &amp; Accelerators
          </h2>
          <p className="text-sm text-[#4B5563] dark:text-[#94A3B8]">
            Verified non-dilutive government grants, sovereign accelerators, and regulatory sandboxes closing soon.
          </p>
        </div>

        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#102433] border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 text-xs font-bold text-[#0B6E4F] dark:text-[#19B5A3] hover:bg-[#E8F5EF] dark:hover:bg-[#132B3D] transition-all font-sans uppercase tracking-wider shrink-0 shadow-2xs"
        >
          <span>View All Opportunities ({opportunities.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of 4 Spotlight Cards in Clean, Readable 2-Column Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {featuredItems.map((opp) => {
          return (
            <article
              key={opp.id}
              className="group bg-white dark:bg-[#102433] rounded-xl border border-[#E2E8E4] dark:border-[#1E3A4C] hover:border-[#0B6E4F]/40 dark:hover:border-[#19B5A3]/40 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                {/* Zone 1: Organization & Status Ribbon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#4B5563] dark:text-[#94A3B8]">
                      <Building2 className="w-3.5 h-3.5 text-[#0A1F2C] dark:text-[#C9A227]" />
                      <span>{opp.organization}</span>
                    </div>
                    {opp.categoryRel && (
                      <span
                        className="text-[11px] uppercase font-bold tracking-wider inline-block px-2 py-0.5 rounded-md bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C]"
                        style={{ color: opp.categoryRel.color }}
                      >
                        {opp.categoryRel.name}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0">{renderStatusBadge(opp)}</div>
                </div>

                {/* Zone 2: Program Title */}
                <Link href={`/opportunity/${opp.slug}`} className="block focus:outline-none focus:underline group/title">
                  <h3 className="font-heading font-black text-xl text-[#111827] dark:text-[#FAF9F6] group-hover/title:text-[#0B6E4F] dark:group-hover/title:text-[#19B5A3] leading-snug transition-colors">
                    {opp.title}
                  </h3>
                </Link>

                {/* Zone 3: Key Value Offer Box (Support Amount & Terms) */}
                <div className="p-3.5 rounded-lg bg-[#F1F5F2] dark:bg-[#132B3D] border border-[#E2E8E4] dark:border-[#1E3A4C] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-[#FAF9F6]">
                    <div className="w-6 h-6 rounded-md bg-[#E8F5EF] dark:bg-[#0B6E4F]/25 flex items-center justify-center shrink-0 text-[#0B6E4F] dark:text-[#19B5A3]">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight">{opp.fundingAmount || 'Non-Cash Advisory & Sandbox Framework'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                    {opp.equityTaken && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-white dark:bg-[#102433] text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/30 dark:border-[#19B5A3]/30 shadow-2xs">
                        <Check className="w-3 h-3 text-[#0B6E4F] dark:text-[#19B5A3]" />
                        <span>{opp.equityTaken}</span>
                      </span>
                    )}
                    {opp.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#4B5563] dark:text-[#94A3B8] bg-white dark:bg-[#102433] px-2.5 py-0.5 rounded-md border border-[#E2E8E4] dark:border-[#1E3A4C]">
                        <MapPin className="w-3 h-3 text-[#4B5563] dark:text-[#94A3B8]" />
                        <span>{opp.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Zone 4: Program Summary Description */}
                <p className="text-sm text-[#374151] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                  {opp.description}
                </p>
              </div>

              {/* Zone 5: Card Footer (Clear Provenance + Action Buttons) */}
              <div className="pt-4 mt-5 border-t border-[#E2E8E4] dark:border-[#1E3A4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-xs text-[#4B5563] dark:text-[#94A3B8]">
                  <span className="block text-[11px] text-[#4B5563] dark:text-[#CBD5E1] font-semibold truncate max-w-[200px]">
                    Source: {opp.sourceName}
                  </span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    Audited {formatDate(opp.verifiedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/opportunity/${opp.slug}`}
                    className="px-4 py-2 rounded-lg border border-[#E2E8E4] dark:border-[#1E3A4C] bg-[#F1F5F2] dark:bg-[#132B3D] hover:bg-[#E8F5EF] dark:hover:bg-[#1A374D] text-[#111827] dark:text-[#FAF9F6] font-bold transition-colors text-xs"
                  >
                    Dossier
                  </Link>
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B6E4F] hover:bg-[#08533C] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
