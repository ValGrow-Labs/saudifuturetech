'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export const NewsletterBanner: React.FC = () => {
  return (
    <section
      id="newsletter"
      aria-label="Newsletter Subscription"
      className="relative bg-editorial-sand rounded-xs border border-editorial-hairline p-8 sm:p-12 my-12"
    >
      <div className="relative max-w-3xl mx-auto text-center space-y-4">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-high bg-editorial-pure px-3 py-1 rounded-xs border border-editorial-hairline font-sans">
          <Mail className="w-3.5 h-3.5" />
          <span>Weekly Executive Intelligence</span>
        </div>

        {/* Primary Positioning Headline */}
        <h2 className="text-2xl sm:text-4xl font-serif font-black text-ink-high tracking-tight">
          Curated Technology Intelligence for Vision 2030 Leaders
        </h2>

        {/* Short Editorial Description */}
        <p className="text-xs sm:text-sm text-ink-body font-sans max-w-xl mx-auto leading-relaxed">
          Delivered every Tuesday morning to technology executives, startup founders, sovereign fund investors, and enterprise architects shaping Saudi Arabia’s technological transformation.
        </p>

        {/* Interactive Subscription Form */}
        <div className="pt-2">
          <NewsletterForm variant="banner" />
        </div>
      </div>
    </section>
  );
};
