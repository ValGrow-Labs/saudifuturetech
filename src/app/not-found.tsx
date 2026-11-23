import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { EDITORIAL_CATEGORIES, NAV_LINKS } from '@/lib/constants';

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-14 md:pt-20 pb-24">
          <div className="max-w-3xl">
            <p className="kicker mb-3">Error 404</p>
            <h1 className="font-serif text-display-lg text-ink">We couldn’t find that page.</h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-3">
              It may have moved, or the link may be mistyped. A search usually finds it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/search" className="btn-primary">
                Search the site
              </Link>
              <Link href="/" className="group inline-flex items-center gap-2 text-sm text-ink">
                <span className="link-rule">Go to the front page</span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-20 md:mt-24 grid gap-12 md:grid-cols-2 md:gap-x-10">
            <nav aria-label="Directory" className="rule-dot-t pt-4">
              <p className="meta mb-3">Directory and reporting</p>
              <ul className="border-t border-rule">
                {NAV_LINKS.map((l) => (
                  <li key={l.href} className="group border-b border-rule">
                    <Link href={l.href} className="flex items-baseline justify-between py-3">
                      <span className="font-serif font-bold text-[1.25rem] text-ink headline-link">{l.label}</span>
                      <span aria-hidden className="text-ink-4 group-hover:text-clay transition-colors">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Sections" className="rule-dot-t pt-4 md:border-l-0">
              <p className="meta mb-3">Sections</p>
              <ul className="border-t border-rule">
                {EDITORIAL_CATEGORIES.map((cat) => (
                  <li key={cat.slug} className="group border-b border-rule">
                    <Link href={`/category/${cat.slug}`} className="flex items-baseline justify-between py-3">
                      <span className="font-serif font-bold text-[1.25rem] text-ink headline-link">{cat.name}</span>
                      <span aria-hidden className="text-ink-4 group-hover:text-clay transition-colors">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
