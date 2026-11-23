'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/public/ThemeToggle';

interface SiteHeaderProps {
  variant?: 'standard' | 'transparent-hero';
}

const isRouteActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  if (href === '/opportunities') return pathname === '/opportunities' || pathname.startsWith('/opportunity');
  if (href === '/startups') return pathname === '/startups' || pathname.startsWith('/startup');
  if (href === '/funding') return pathname === '/funding' || pathname.startsWith('/investor');
  if (href === '/insights') return pathname === '/insights';
  if (href === '/latest') return pathname === '/latest' || pathname === '/news' || pathname.startsWith('/article');
  return pathname === href;
};

export const SiteHeader: React.FC<SiteHeaderProps> = ({ variant = 'standard' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  const isTransparent = variant === 'transparent-hero';

  // Global Keyboard Shortcuts (Cmd+K navigates to Unified Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.location.href = '/search';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Switch to sticky navbar once scrolled
      setIsScrolled(window.scrollY > (isTransparent ? 60 : 130));

      // Track scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);

  // ============================================================================
  // VARIANT A: TRANSPARENT OVER-HERO HEADER (Vision 2030 Style)
  // Plays seamlessly over background media with crisp white typography
  // ============================================================================
  if (isTransparent) {
    return (
      <header
        className={cn(
          'w-full transition-all duration-300 z-40',
          isScrolled
            ? 'fixed top-0 left-0 right-0 bg-[#0e1828]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-2 text-white animate-in slide-in-from-top-1 duration-200'
            : 'absolute top-0 left-0 right-0 bg-gradient-to-b from-[#070d17]/85 via-[#070d17]/40 to-transparent border-b border-white/10 py-3 sm:py-4 text-white'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-10 sm:h-11">
          {/* Brand Identity / Logo */}
          <Link
            href="/"
            className="flex flex-col group focus:outline-none shrink-0"
          >
            <span className="font-serif font-black text-lg sm:text-2xl tracking-tight text-white group-hover:text-brand-yellow transition-colors leading-none">
              {SITE_NAME}
            </span>
            <span className="font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#c4a265] pt-0.5">
              Founder Operating Intelligence
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-2 xl:gap-3 justify-center flex-1 overflow-x-auto min-w-0"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const hasBadge = 'badge' in link && Boolean(link.badge);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold font-sans uppercase tracking-wider transition-all whitespace-nowrap border-b-2 shrink-0',
                    isActive
                      ? 'text-white border-brand-yellow font-bold drop-shadow-sm'
                      : 'text-white/80 hover:text-white border-transparent hover:border-white/30'
                  )}
                >
                  <span>{link.label}</span>
                  {hasBadge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-sans tracking-wide uppercase rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: Theme Toggle & Subscribe CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto pl-2">
            {/* Theme Toggle Button */}
            <ThemeToggle variant="hero" />

            {/* Subscribe Action Button */}
            <Link
              href="/newsletter"
              className="text-xs font-bold font-sans px-3.5 py-1.5 rounded-xs bg-brand-yellow text-ink-high hover:bg-brand-yellow-hover transition-colors shadow-sm uppercase tracking-wider"
            >
              Subscribe
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-white/90 hover:text-white transition-colors ml-1"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation — Sleek Dark Glass Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0e1828]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150 text-white">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 px-2 font-sans">
                Founder Intelligence & Sections
              </span>
              {NAV_LINKS.map((link) => {
                const hasBadge = 'badge' in link && Boolean(link.badge);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.label}</span>
                      {hasBadge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/25 text-emerald-300">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className="w-1.5 h-1.5 bg-brand-yellow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <ThemeToggle variant="mobile" />
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                <span>Editorial CMS Backstage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/newsletter"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs bg-brand-yellow text-ink-high font-sans"
              >
                Subscribe to Weekly Dispatch
              </Link>
            </div>
          </div>
        )}

        {/* Reading & Scroll velocity progress bar */}
        {isScrolled && (
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-brand-yellow transition-all duration-75 ease-out shadow-[0_0_6px_rgba(244,197,66,0.6)] pointer-events-none"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />
        )}
      </header>
    );
  }

  // ============================================================================
  // VARIANT B: REFINED COMPACT FIXED HEADER FOR FOUNDER DIRECTORIES & WIRE
  // Warm white / midnight navy background, Deep Saudi green active states, Desert gold accents
  // Fixed permanently to the top of viewport with smooth backdrop blur
  // ============================================================================
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#FAF9F6]/95 dark:bg-[#0A1F2C]/95 backdrop-blur-md border-b border-[#E2E8E4] dark:border-[#1E3A4C] shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-14 sm:h-16">
          {/* Brand Identity / Logo */}
          <Link
            href="/"
            className="flex flex-col group focus:outline-none shrink-0"
          >
            <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-[#111827] dark:text-[#FAF9F6] group-hover:text-[#0B6E4F] dark:group-hover:text-[#19B5A3] transition-editorial leading-none">
              {SITE_NAME}
            </span>
            <span className="font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A227] pt-0.5 leading-tight">
              Founder Operating Intelligence
            </span>
          </Link>

          {/* Desktop Categories Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 sm:gap-2 xl:gap-3 justify-center flex-1 overflow-x-auto min-w-0"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = isRouteActive(pathname, link.href);
              const hasBadge = 'badge' in link && Boolean(link.badge);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold font-sans uppercase tracking-wider transition-editorial whitespace-nowrap border-b-2 shrink-0',
                    isActive
                      ? 'text-[#0B6E4F] dark:text-[#19B5A3] font-bold border-[#0B6E4F] dark:border-[#19B5A3]'
                      : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#FAF9F6] border-transparent hover:border-[#C9A227]/40'
                  )}
                >
                  <span>{link.label}</span>
                  {hasBadge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-sans tracking-wide uppercase rounded-full bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3] border border-[#0B6E4F]/20 dark:border-[#19B5A3]/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: Theme Toggle & Subscribe */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto pl-2">
            {/* Theme Toggle Button */}
            <ThemeToggle variant="standard" />

            {/* Subscribe Action Button */}
            <Link
              href="/newsletter"
              className="text-xs font-bold font-sans px-3.5 py-1.5 rounded-md bg-[#0B6E4F] text-white hover:bg-[#08533C] transition-editorial shadow-xs uppercase tracking-wider"
            >
              Subscribe
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white transition-editorial ml-1"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8E4] dark:border-[#1E3A4C] bg-[#FAF9F6] dark:bg-[#0A1F2C] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4B5563] dark:text-[#94A3B8] px-2 font-sans">
                Founder Intelligence &amp; Sections
              </span>
              {NAV_LINKS.map((link) => {
                const hasBadge = 'badge' in link && Boolean(link.badge);
                const isActive = isRouteActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-editorial',
                      isActive
                        ? 'bg-[#E8F5EF] dark:bg-[#132B3D] text-[#0B6E4F] dark:text-[#19B5A3] font-bold'
                        : 'text-[#111827] dark:text-[#FAF9F6] hover:bg-[#F1F5F2] dark:hover:bg-[#132B3D]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.label}</span>
                      {hasBadge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-[#E8F5EF] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#19B5A3]">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E4F] dark:bg-[#19B5A3]" aria-hidden="true" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2E8E4] dark:border-[#1E3A4C] space-y-2">
              <ThemeToggle variant="mobile" />
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white transition-editorial"
              >
                <span>Editorial CMS Backstage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/newsletter"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-md bg-[#0B6E4F] text-white hover:bg-[#08533C] font-sans shadow-xs"
              >
                Subscribe to Weekly Dispatch
              </Link>
            </div>
          </div>
        )}

        {/* Reading & Scroll velocity progress bar */}
        {isScrolled && (
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-[#0B6E4F] transition-all duration-75 ease-out shadow-[0_0_6px_rgba(11,110,79,0.5)] pointer-events-none"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />
        )}
      </header>
      {/* Spacer to prevent fixed header from overlapping top content */}
      <div className="h-14 sm:h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
};
