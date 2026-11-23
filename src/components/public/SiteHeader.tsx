'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';

interface SiteHeaderProps {
  /** Kept for backwards compatibility; every page now uses the same masthead. */
  variant?: 'standard' | 'transparent-hero';
}

function todayLine() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  }).format(new Date());
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-serif tracking-[-0.02em] text-ink leading-none whitespace-nowrap', className)}>
      Saudi <em className="font-normal italic">Future</em> Tech
    </span>
  );
}

export const SiteHeader: React.FC<SiteHeaderProps> = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [date, setDate] = useState('');

  useEffect(() => setDate(todayLine()), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <>
      {/* Dateline strip */}
      <div className="hidden md:block border-b border-rule bg-paper">
        <div className="mx-auto max-w-[84rem] px-6 lg:px-10 h-9 flex items-center justify-between meta">
          <span suppressHydrationWarning>{date ? `${date} · Riyadh` : 'Riyadh'}</span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-ink transition-colors">
              About
            </Link>
            <Link href="/newsletter" className="hover:text-ink transition-colors">
              The Sunday Brief
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-header bg-paper/95 backdrop-blur-[6px] transition-[border-color] duration-300',
          compact ? 'border-b border-rule' : 'border-b border-transparent'
        )}
      >
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-10">
          <div
            className={cn(
              'flex items-center gap-6 transition-[height] duration-300 ease-out',
              compact ? 'h-14' : 'h-16 md:h-20'
            )}
          >
            <Link href="/" aria-label="Saudi Future Tech — home" className="shrink-0">
              <Wordmark
                className={cn(
                  'transition-[font-size] duration-300 ease-out',
                  compact ? 'text-[1.375rem]' : 'text-[1.5rem] md:text-[1.875rem]'
                )}
              />
            </Link>

            <nav aria-label="Primary" className="hidden lg:flex items-center gap-7 ml-auto">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'relative text-[0.9375rem] py-1 transition-colors',
                    isActive(link.href) ? 'text-ink' : 'text-ink-3 hover:text-ink'
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 -bottom-0.5 h-px bg-clay transition-all duration-300 ease-out',
                      isActive(link.href) ? 'w-full' : 'w-0'
                    )}
                  />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 ml-auto lg:ml-8">
              <HeaderSearch className="hidden md:flex" />
              <Link href="/newsletter" className="hidden sm:inline-flex btn-primary !py-2 !px-3.5 !text-[0.8125rem]">
                Subscribe
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex flex-col items-center justify-center gap-[5px]"
              >
                <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', menuOpen && 'translate-y-[3px] rotate-45')} />
                <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', menuOpen && '-translate-y-[3px] -rotate-45')} />
              </button>
            </div>
          </div>
        </div>

        {/* The double rule under the masthead — thick ink over a hairline. */}
        {!compact && (
          <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-10" aria-hidden>
            <div className="border-t-2 border-ink" />
            <div className="mt-[3px] border-t border-ink" />
          </div>
        )}

        {/* Mobile navigation */}
        {menuOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-rule bg-paper rise">
            <div className="px-4 sm:px-6 pt-5 md:hidden">
              <HeaderSearch className="flex w-full" />
            </div>
            <ul className="px-4 sm:px-6 py-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="border-b border-rule last:border-0">
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between py-4 font-serif text-2xl',
                      isActive(link.href) ? 'text-clay' : 'text-ink'
                    )}
                  >
                    {link.label}
                    <span aria-hidden className="text-ink-4 text-base">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="px-4 sm:px-6 pb-6">
              <Link href="/newsletter" className="btn-primary w-full">
                Subscribe to the Sunday Brief
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

/** Plain inline search: an underlined field. Enter goes to /search. */
function HeaderSearch({ className }: { className?: string }) {
  const [q, setQ] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    window.location.href = term ? `/search?q=${encodeURIComponent(term)}` : '/search';
  };
  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        'items-center gap-2 border-b border-rule focus-within:border-ink transition-colors',
        className
      )}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-ink-3">
        <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.25" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      <label htmlFor={`hs-${className?.includes('w-full') ? 'm' : 'd'}`} className="sr-only">
        Search
      </label>
      <input
        id={`hs-${className?.includes('w-full') ? 'm' : 'd'}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="w-full md:w-36 xl:w-44 bg-transparent py-1.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none"
      />
    </form>
  );
}

export default SiteHeader;
