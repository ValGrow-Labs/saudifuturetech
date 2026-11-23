'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { SITE_NAME_AR, hijriDate } from '@/lib/arabic';
import { TopOrnament } from './TopOrnament';

interface SiteHeaderProps {
  /** Kept for backwards compatibility; every page uses the same masthead. */
  variant?: 'standard' | 'transparent-hero';
}

// Three cities of the Kingdom on the left of the masthead, three world capitals on the right.
const CLOCKS_LEFT = [
  { label: 'Riyadh', tz: 'Asia/Riyadh' },
  { label: 'Jeddah', tz: 'Asia/Riyadh' },
  { label: 'NEOM', tz: 'Asia/Riyadh' },
];
const CLOCKS_RIGHT = [
  { label: 'Dubai', tz: 'Asia/Dubai' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'New York', tz: 'America/New_York' },
];

function riyadhNowLine(d: Date) {
  const time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Riyadh' })
    .format(d)
    .toUpperCase();
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  })
    .format(d)
    .toUpperCase();
  return { time, date };
}

function timeParts(d: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: tz }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { h, m };
}

/** A small analog dial for one city. */
function CityClock({ label, tz, now }: { label: string; tz: string; now: Date | null }) {
  const { h, m } = now ? timeParts(now, tz) : { h: 0, m: 0 };
  const minuteAngle = m * 6;
  const hourAngle = (h % 12) * 30 + m * 0.5;
  return (
    <div className="flex flex-col items-center gap-1" title={now ? `${label} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` : label}>
      <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-2">{label}</span>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className={cn('transition-opacity', now ? 'opacity-100' : 'opacity-0')}>
        <circle cx="17" cy="17" r="15.5" fill="#FCF8EC" stroke="#141414" strokeOpacity="0.28" />
        <line x1="17" y1="17" x2="17" y2="9" stroke="#141414" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${hourAngle} 17 17)`} />
        <line x1="17" y1="17" x2="17" y2="5" stroke="#B3361F" strokeWidth="1" strokeLinecap="round" transform={`rotate(${minuteAngle} 17 17)`} />
        <circle cx="17" cy="17" r="1.4" fill="#141414" />
      </svg>
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-serif font-black uppercase tracking-[-0.02em] text-ink leading-none whitespace-nowrap', className)}>
      Saudi Future Tech
    </span>
  );
}

export const SiteHeader: React.FC<SiteHeaderProps> = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 220);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  const line = now ? riyadhNowLine(now) : null;

  const navLinks = [{ label: 'Home', href: '/' }, ...NAV_LINKS];

  return (
    <>
      <header className="relative z-header">
        <TopOrnament />
        <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10">
          {/* Row 1: pills · tagline · subscribe */}
          <div className="hidden md:grid grid-cols-3 items-center pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Link
                href="/opportunities"
                className="rounded-[4px] border border-ink/25 px-2 py-0.5 text-[0.8125rem] font-semibold text-ink-2 hover:border-ink hover:text-ink transition-colors"
              >
                Grants
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-ink/25 px-2 py-0.5 text-[0.8125rem] font-semibold text-ink-2 hover:border-ink hover:text-ink transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-[#E9B949]" aria-hidden />
                The Sunday Brief
              </Link>
            </div>
            <p className="text-center font-serif italic text-[0.9375rem] text-ink-2">
              Independent reporting on technology in the Kingdom
            </p>
            <div className="text-right">
              <Link href="/newsletter" className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-clay hover:text-clay-dark">
                Subscribe
              </Link>
            </div>
          </div>

          {/* Row 2: dateline · clocks + masthead + clocks · search/menu */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 md:py-2">
            <div className="hidden md:block text-[0.75rem] leading-relaxed text-ink-2 whitespace-nowrap" suppressHydrationWarning>
              {line ? (
                <>
                  <span className="block">
                    <span className="font-semibold">{line.time}</span> · {line.date.replace(',', '')}
                  </span>
                  <span className="block text-ink-3">{hijriDate(now!)}</span>
                </>
              ) : (
                <span className="text-ink-3">Riyadh</span>
              )}
            </div>
            <div className="md:hidden" />

            <div className="flex items-center gap-4 lg:gap-6">
              <div className="hidden xl:flex items-end gap-4">
                {CLOCKS_LEFT.map((c) => (
                  <CityClock key={c.label} {...c} now={now} />
                ))}
              </div>
              <Link href="/" aria-label="Saudi Future Tech — home" className="flex flex-col items-center">
                <Wordmark className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3.5rem]" />
                <span lang="ar" dir="rtl" className="mt-1 font-sans text-[0.8125rem] sm:text-[0.9375rem] text-gold">
                  {SITE_NAME_AR}
                </span>
              </Link>
              <div className="hidden xl:flex items-end gap-4">
                {CLOCKS_RIGHT.map((c) => (
                  <CityClock key={c.label} {...c} now={now} />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <HeaderSearch className="hidden lg:flex" />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="relative h-9 w-9 inline-flex items-center justify-center"
              >
                <span className={cn('absolute h-[2px] w-5 bg-ink transition-transform duration-300', menuOpen ? 'rotate-45' : '-translate-y-[5px]')} />
                <span className={cn('absolute h-[2px] w-5 bg-ink transition-opacity duration-300', menuOpen ? 'opacity-0' : 'opacity-100')} />
                <span className={cn('absolute h-[2px] w-5 bg-ink transition-transform duration-300', menuOpen ? '-rotate-45' : 'translate-y-[5px]')} />
              </button>
            </div>
          </div>

          {/* Row 3: sections, between dotted rules */}
          <nav aria-label="Primary" className="rule-dot-t rule-dot-b mt-1 overflow-x-auto">
            <ul className="flex items-center justify-start md:justify-center gap-6 md:gap-8 py-2.5 whitespace-nowrap px-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'text-[0.9375rem] transition-colors',
                      isActive(link.href) ? 'text-clay font-semibold' : 'text-ink-2 hover:text-ink'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="hidden md:block pl-6 md:pl-8 border-l border-ink/20">
                <Link href="/newsletter" className="text-[0.9375rem] font-semibold text-ink hover:text-clay transition-colors">
                  The Sunday Brief →
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Full menu */}
        {menuOpen && (
          <div id="site-menu" className="absolute inset-x-0 top-full z-overlay bg-paper border-y border-ink/15 shadow-[0_30px_60px_-30px_rgba(20,20,20,0.35)] rise">
            <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10 py-8 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <HeaderSearch className="flex w-full lg:hidden mb-6" />
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.href} className="rule-dot-b">
                      <Link href={link.href} className="flex items-center justify-between py-3 font-serif text-2xl font-bold text-ink hover:text-clay">
                        {link.label}
                        <span aria-hidden className="text-ink-4 text-base">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="kicker mb-3">The Sunday Brief</p>
                <p className="font-serif text-2xl font-bold text-ink">The week in Saudi tech, in one email.</p>
                <Link href="/newsletter" className="btn-primary mt-5">
                  Subscribe
                </Link>
                <p lang="ar" dir="rtl" className="mt-8 text-left font-sans text-lg text-gold">
                  {SITE_NAME_AR}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Slim bar that slides in once the masthead has scrolled away */}
      <div
        aria-hidden={!compact}
        className={cn(
          'fixed inset-x-0 top-0 z-header bg-paper/95 backdrop-blur border-b border-ink/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          compact ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10 h-12 flex items-center gap-6">
          <Link href="/" tabIndex={compact ? undefined : -1} aria-label="Saudi Future Tech — home">
            <Wordmark className="text-[1.125rem]" />
          </Link>
          <nav aria-label="Sections" className="hidden lg:flex items-center gap-6 ml-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={compact ? undefined : -1}
                className={cn('text-[0.875rem]', isActive(link.href) ? 'text-clay font-semibold' : 'text-ink-2 hover:text-ink')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/newsletter"
            tabIndex={compact ? undefined : -1}
            className="ml-auto lg:ml-4 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-clay hover:text-clay-dark"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </>
  );
};

/** Plain inline search with a dotted underline. Enter goes to /search. */
function HeaderSearch({ className }: { className?: string }) {
  const [q, setQ] = useState('');
  const id = React.useId();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    window.location.href = term ? `/search?q=${encodeURIComponent(term)}` : '/search';
  };
  return (
    <form role="search" onSubmit={submit} className={cn('items-center gap-2 rule-dot-b', className)}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-ink-3">
        <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.25" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="w-full lg:w-36 bg-transparent py-1.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none"
      />
    </form>
  );
}

export default SiteHeader;
