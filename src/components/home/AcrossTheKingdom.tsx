import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NajdiBorder } from '@/components/public/NajdiBorder';

interface TechHub {
  city: string;
  cityAr: string;
  focus: string;
  headline: string;
  href: string;
}

const HUBS: TechHub[] = [
  {
    city: 'Riyadh',
    cityAr: 'مدينة الرياض',
    focus: 'Capital & GovTech',
    headline: 'SDAIA launches national AI accelerator batch at The Garage KACST Innovation District',
    href: '/article/national-sovereign-cloud-topology-data-residency-hyperscale',
  },
  {
    city: 'NEOM',
    cityAr: 'نيوم وذا لاين',
    focus: 'Cognitive Cities',
    headline: 'THE LINE begins deployment of autonomous IoT sensory networks and edge data micro-hubs',
    href: '/article/cognitive-infrastructure-the-line-iot-sensory-networks',
  },
  {
    city: 'Jeddah & Red Sea',
    cityAr: 'جدة والبحر الأحمر',
    focus: 'Clean Energy & Marine',
    headline: 'Red Sea Global activates 100% off-grid solar-battery microgrid orchestrator',
    href: '/article/red-sea-global-off-grid-microgrid-solar-battery-architecture',
  },
  {
    city: 'Dhahran',
    cityAr: 'الظهران والشرقية',
    focus: 'Industrial Tech',
    headline: 'Advanced materials and carbon-capture tech pilots scale across the Eastern Province',
    href: '/search?q=Dhahran',
  },
  {
    city: 'KAFD',
    cityAr: 'مركز الملك عبدالله المالي',
    focus: 'FinTech & Capital',
    headline: 'SAMA opens regulatory sandbox cohort for open banking embedded finance platforms',
    href: '/article/open-banking-evolution-sama-regulatory-sandbox-embedded-finance',
  },
  {
    city: 'KAUST',
    cityAr: 'جامعة كاوست وثول',
    focus: 'Deep Tech & AI',
    headline: 'Arabic foundation LLM benchmarks demonstrate new high-conviction tokenization accuracy',
    href: '/article/the-arabic-ai-frontier-sdaias-allam-architecture-tokenization-benchmarks-and-dialect-alignment',
  },
];

export function AcrossTheKingdom() {
  return (
    <section aria-labelledby="across-the-kingdom" className="my-10 rounded-[26px] bg-[#092B23] text-white shadow-sm overflow-hidden">
      <NajdiBorder className="text-white/20" />

      <div className="px-6 sm:px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/15">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
              Regional Innovation Desks
            </span>
            <h2 id="across-the-kingdom" className="font-serif font-black text-2xl sm:text-3xl text-white">
              Across the Kingdom
            </h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A227] hover:text-white transition-colors"
          >
            <span>All innovation hubs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Hub Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {HUBS.map((hub) => (
            <div key={hub.city} className="space-y-3 group">
              <div className="space-y-0.5">
                <span lang="ar" dir="rtl" className="block font-arabic text-xs font-medium text-[#C9A227]">
                  {hub.cityAr}
                </span>
                <h3 className="font-serif font-bold text-sm tracking-wide text-white uppercase">
                  {hub.city}
                </h3>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-white/60">
                  {hub.focus}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-white/80 group-hover:text-[#C9A227] transition-colors line-clamp-3">
                <Link href={hub.href}>{hub.headline}</Link>
              </p>
            </div>
          ))}
        </div>
      </div>

      <NajdiBorder className="text-white/20 rotate-180" />
    </section>
  );
}

export default AcrossTheKingdom;
