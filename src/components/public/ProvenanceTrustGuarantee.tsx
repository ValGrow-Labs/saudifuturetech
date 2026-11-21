'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileCheck2, ExternalLink } from 'lucide-react';

export const ProvenanceTrustGuarantee: React.FC = () => {
  return (
    <div className="w-full bg-[#0A1F2C] text-white rounded-xl p-8 sm:p-10 border border-[#C9A227]/30 shadow-sm relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0B6E4F]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#19B5A3] font-sans">
            Data Sovereignty &amp; Verification Protocol
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
          Why Saudi Founders Trust SFT: Verified Operating Intelligence Over PR Noise
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
          Unlike ordinary regional technology news portals that republish unverified press releases, every grant, startup milestone, and investment listing on Saudi Future Tech adheres to a strict editorial verification standard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-[#0B6E4F] text-xs font-bold font-heading">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Fabricated Data</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              We never invent funding figures, deadline dates, or eligibility requirements. If a metric is unverified, it is omitted.
            </p>
          </div>

          <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-[#19B5A3] text-xs font-bold font-heading">
              <FileCheck2 className="w-4 h-4" />
              <span>Direct Ministry Provenance</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every opportunity references its official issuing portal (NTDP, Monsha&apos;at, SAMA, SDAIA, KAUST) with an official application link.
            </p>
          </div>

          <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-[#C9A227] text-xs font-bold font-heading">
              <Lock className="w-4 h-4" />
              <span>No Paywalls for Builders</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our core database of founder grants, active accelerators, and startup directories remains 100% open and accessible to all founders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
