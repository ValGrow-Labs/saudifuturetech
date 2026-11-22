'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, EDITORIAL_CATEGORIES } from '@/lib/constants';
import { NewsletterForm } from './NewsletterForm';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A1F2C] border-t-2 border-[#C9A227]/40 pt-16 pb-12 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E3A4C]">
          {/* Column 1 & 2: Publication Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif font-black text-2xl tracking-tight text-white group-hover:text-[#C9A227] transition-colors">
                {SITE_NAME}
              </span>
            </Link>

            <div className="space-y-0.5">
              <p className="font-serif italic text-xs text-[#C9A227]">
                &ldquo;{SITE_TAGLINE}&rdquo;
              </p>
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-xs text-[#C9A227]/80 font-normal"
              >
                ذكاء تشغيلي للمؤسسين
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              {SITE_DESCRIPTION}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 text-xs text-slate-300 bg-[#132B3C] px-3 py-1 rounded-md border border-[#1E3A4C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#19B5A3]" aria-hidden="true" />
                <span>Riyadh, Kingdom of Saudi Arabia</span>
              </span>
              <span
                lang="ar"
                dir="rtl"
                className="font-arabic text-xs text-[#C9A227] font-medium"
              >
                نبني المستقبل في المملكة
              </span>
            </div>
          </div>

          {/* Column 3: Editorial Coverage Pillars */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] font-sans mb-4">
              Editorial Pillars
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans">
              {EDITORIAL_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Institutional Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] font-sans mb-4">
              Publication
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans">
              <li>
                <Link href="/search" className="text-slate-300 hover:text-white transition-colors">
                  Unified Search
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                  About the Journal
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="text-slate-300 hover:text-white transition-colors">
                  Executive Briefing
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-slate-200 hover:text-[#19B5A3] transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                >
                  <span>Staff CMS Login</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Executive Dispatch Form */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] font-sans mb-4">
              Weekly Dispatch
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Receive the Tuesday morning executive briefing direct to your inbox.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p>© {new Date().getFullYear()} Saudi Future Tech. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">·</span>
            <span
              lang="ar"
              dir="rtl"
              className="font-arabic text-xs font-medium text-[#C9A227] tracking-normal"
            >
              نبني المستقبل في المملكة
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Published in Riyadh, Kingdom of Saudi Arabia. Powered by verified intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
};
