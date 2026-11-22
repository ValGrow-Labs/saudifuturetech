'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CategoryWithTags } from '@/lib/constants';

interface PillarMeta {
  image: string;
  imageAlt: string;
  location: string;
  leadFocus: string;
  tier: string;
  coverageDesk: string;
  focusArea: string;
}

const PILLAR_EXTENDED_META: Record<string, PillarMeta> = {
  'ai-deep-tech': {
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Sovereign AI compute and neural network visualization',
    location: 'Riyadh • SDAIA & KACST Sovereign Compute',
    leadFocus: 'ALLaM LLM',
    tier: 'Tier-1 Sovereign',
    coverageDesk: 'DESK 01',
    focusArea: 'Sovereign AI & Arabic LLMs',
  },
  govtech: {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'National sovereign cloud and enterprise server infrastructure',
    location: 'Riyadh • Digital Government Authority (DGA)',
    leadFocus: 'Tawakkalna API',
    tier: 'GovCloud',
    coverageDesk: 'DESK 02',
    focusArea: 'National APIs & GovStack',
  },
  cybersecurity: {
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cyber defense matrix and encryption architecture',
    location: 'Riyadh • National Cybersecurity Authority (NCA)',
    leadFocus: 'NCA ECC Framework',
    tier: 'Zero-Trust',
    coverageDesk: 'DESK 03',
    focusArea: 'Sovereign Data Protection',
  },
  'smart-cities-infra': {
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Modern vertical architectural skyline and cognitive infrastructure',
    location: 'Tabuk & Red Sea • NEOM & THE LINE',
    leadFocus: 'Cognitive Urban OS',
    tier: 'Cognitive Infra',
    coverageDesk: 'DESK 04',
    focusArea: 'IoT, Mobility & Smart BIM',
  },
  fintech: {
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Financial technology charts and market data architecture',
    location: 'KAFD, Riyadh • SAMA Regulatory Sandbox',
    leadFocus: 'Open Banking API',
    tier: 'Financial Sandbox',
    coverageDesk: 'DESK 05',
    focusArea: 'Payments, Lending & RegTech',
  },
  'clean-energy': {
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Solar photovoltaic energy array in sunny desert landscape',
    location: 'OXAGON & Red Sea • Green Hydrogen',
    leadFocus: '400MW Solar & H2',
    tier: 'Net-Zero Tech',
    coverageDesk: 'DESK 06',
    focusArea: 'Renewable Microgrids & Hydrogen',
  },
};

const DEFAULT_META: PillarMeta = {
  image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  imageAlt: 'Editorial coverage photography',
  location: 'Kingdom of Saudi Arabia • National Tech Desk',
  leadFocus: 'Frontier Tech',
  tier: 'National',
  coverageDesk: 'DESK 00',
  focusArea: 'Emerging Technologies',
};

interface EditorialPillarsSectionProps {
  categories: CategoryWithTags[];
}

export const EditorialPillarsSection: React.FC<EditorialPillarsSectionProps> = ({ categories }) => {
  return (
    <section id="sovereign-pillars" aria-label="Sovereign Pillars of Saudi Technology" className="w-full space-y-6 scroll-mt-20">
      {/* 1. Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B6E4F]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] font-sans">
              Sovereign Coverage Desks • Vision 2030 Taxonomy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111827] tracking-tight">
            Six Pillars of National Technology
          </h2>
          <p className="text-sm text-[#4B5563] font-sans max-w-2xl">
            Authoritative intelligence desks tracking government initiatives, sovereign compute, regulatory sandboxes, and emerging startup activity across the Kingdom.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold font-sans border border-[#E2E8E4] shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#0B6E4F]" />
            <span>6 Verified Desks</span>
          </span>
        </div>
      </div>

      {/* 2. Sovereign Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const meta = PILLAR_EXTENDED_META[category.slug] || DEFAULT_META;

          return (
            <article
              key={category.slug}
              className="group bg-white rounded-xl border border-[#E2E8E4] hover:border-[#0B6E4F]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Upper Visual Header */}
                <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#F1F5F2]">
                  <Image
                    src={meta.image}
                    alt={meta.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F2C]/75 via-transparent to-black/20" />

                  {/* Top Floating Desk Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1F2C]/90 text-white backdrop-blur-md text-[10px] font-sans font-bold shadow-xs border border-white/10">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color || '#0B6E4F' }}
                      aria-hidden="true"
                    />
                    <span className="tracking-wider">{meta.coverageDesk}</span>
                  </div>

                  {/* Top Right Tier Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-[#0A1F2C] backdrop-blur-md text-[10px] font-sans font-bold shadow-xs">
                    <span>{meta.tier}</span>
                  </div>

                  {/* Bottom Image Overlay: Institutional Nexus */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white text-xs font-sans drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                    <span className="truncate text-xs font-medium">{meta.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-3">
                  {/* Pillar Title */}
                  <h3 className="text-xl font-heading font-black text-[#111827] group-hover:text-[#0B6E4F] transition-colors tracking-tight leading-snug">
                    <Link
                      href={`/category/${category.slug}`}
                      className="focus:outline-none focus-visible:underline"
                    >
                      {category.name}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#374151] leading-relaxed line-clamp-2">
                    {category.description}
                  </p>

                  {/* Intelligence Meta Strip */}
                  <div className="pt-3 border-t border-[#E2E8E4] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block font-sans">
                        Lead Anchor
                      </span>
                      <span className="font-bold text-[#111827] truncate block pt-0.5">
                        {meta.leadFocus}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block font-sans">
                        Focus Area
                      </span>
                      <span className="font-bold text-[#0B6E4F] truncate block pt-0.5">
                        {meta.focusArea}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-[#F1F5F2] border-t border-[#E2E8E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider font-sans">
                  {category.tags.length} Sub-Sectors
                </span>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0B6E4F] hover:text-[#08533C] transition-colors font-sans uppercase tracking-wider"
                  aria-label={`Explore ${category.name} intelligence desk`}
                >
                  <span>Explore Desk</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
