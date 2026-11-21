import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Home, AlertTriangle } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { EDITORIAL_CATEGORIES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body font-sans selection:bg-brand-yellow/30">
      <SiteHeader />

      <main className="flex-1 py-16 sm:py-24 flex items-center">
        <MainContainer size="narrow">
          <div className="text-center space-y-8 bg-editorial-pure p-8 sm:p-12 rounded-none border border-editorial-hairline shadow-xs">
            {/* Error Marker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-editorial-sand border border-editorial-hairline rounded-none text-ink-high text-xs font-bold uppercase tracking-widest font-sans">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>404 — Disconnection Notice</span>
            </div>

            {/* Display Number */}
            <div className="space-y-3">
              <h1 className="text-6xl sm:text-8xl font-black text-ink-high font-serif tracking-tighter">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-high font-serif">
                Editorial Resource Not Located
              </h2>
              <p className="text-base sm:text-lg text-ink-body font-serif italic max-w-md mx-auto leading-relaxed">
                The technical dispatch, vertical archive, or author profile you requested may have been relocated, updated, or is no longer in active circulation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-yellow text-ink-high rounded-none text-xs font-bold font-sans uppercase tracking-wider hover:bg-brand-yellow/90 border border-ink-high/20 transition-editorial shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-editorial-sand text-ink-high border border-editorial-hairline rounded-none text-xs font-bold font-sans uppercase tracking-wider hover:border-ink-high hover:bg-editorial-stone transition-editorial"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Archives</span>
              </Link>
            </div>

            {/* Pillar Navigation Shortcuts */}
            <div className="pt-8 border-t border-editorial-hairline space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink-muted font-sans block">
                Or Navigate Directly to an Editorial Pillar:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {EDITORIAL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="text-xs font-sans px-3 py-1.5 rounded-none bg-editorial-sand border border-editorial-hairline text-ink-body hover:border-ink-high hover:text-ink-high transition-editorial"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}

