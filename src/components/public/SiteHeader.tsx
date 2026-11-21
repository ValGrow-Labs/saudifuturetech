'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SITE_NAME, POPULAR_SEARCH_TAGS } from '@/lib/constants';

interface SiteHeaderProps {
  variant?: 'standard' | 'transparent-hero';
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ variant = 'standard' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [livePreview, setLivePreview] = useState<{
    startups: any[];
    investors: any[];
    opportunities: any[];
  } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  const isTransparent = variant === 'transparent-hero';

  // Global Keyboard Shortcuts (Cmd+K to search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Instant Preview Suggestions
  useEffect(() => {
    if (!searchOpen || searchQuery.trim().length < 2) {
      setLivePreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=3`);
        if (res.ok) {
          const json = await res.json();
          setLivePreview({
            startups: json.startups?.slice(0, 2) || [],
            investors: json.investors?.slice(0, 2) || [],
            opportunities: json.opportunities?.slice(0, 2) || [],
          });
        }
      } catch {
        // silent fallback
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

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

          {/* Right Utilities: Search & Subscribe CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto pl-2">
            {/* Integrated Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-white/85 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xs transition-colors backdrop-blur-xs"
              aria-label="Toggle search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-white/85" />
              <span className="hidden sm:inline text-[11px] font-medium">Search</span>
              <kbd className="hidden md:inline-flex items-center text-[9px] px-1 py-0.2 rounded bg-white/15 text-white/70 font-mono">⌘K</kbd>
            </button>

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

        {/* Collapsible Search Drawer — Sleek Dark Frosted Palette */}
        {searchOpen && (
          <div className="py-4 px-4 border-t border-white/10 bg-[#0e1828]/98 backdrop-blur-md animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Saudi startups, VCs, grants, ticket sizes, or tech (e.g. Tamara, NTDP, Mozn)..."
                  className="w-full bg-white/10 border border-white/20 rounded-xs pl-10 pr-28 py-2 text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none focus:border-brand-yellow transition-colors font-sans"
                  autoFocus
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-brand-yellow text-xs font-bold text-ink-high rounded-xs hover:bg-brand-yellow-hover transition-colors font-sans uppercase tracking-wider"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-white/70 hover:text-white rounded-xs"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instant Live Results Preview */}
              {livePreview && (livePreview.startups.length > 0 || livePreview.investors.length > 0 || livePreview.opportunities.length > 0) && (
                <div className="bg-white/10 rounded border border-white/15 p-2.5 space-y-1.5 text-xs animate-in fade-in">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Instant Suggestions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {livePreview.startups.map((s) => (
                      <Link
                        key={s.id}
                        href={`/startup/${s.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] text-white/60">({s.stage})</span>
                      </Link>
                    ))}
                    {livePreview.investors.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/investor/${inv.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                        <span className="font-semibold">{inv.name}</span>
                        <span className="text-[10px] text-white/60">(Investor)</span>
                      </Link>
                    ))}
                    {livePreview.opportunities.map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/opportunity/${opp.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39765B]" />
                        <span className="font-semibold truncate max-w-[140px]">{opp.title}</span>
                        <span className="text-[10px] text-white/60">(Grant)</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Search Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 font-sans mr-1">
                  Topics:
                </span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                    }}
                    className="text-[11px] font-sans px-2 py-0.5 rounded-xs bg-white/10 text-white/80 hover:text-white hover:bg-white/15 border border-white/15 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

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
  // VARIANT B: STANDARD EDITORIAL MASTHEAD (For subpages, articles, directories)
  // Clean broadsheet styling with centered publication masthead
  // ============================================================================
  // VARIANT B: REFINED EDITORIAL HEADER FOR FOUNDER DIRECTORIES & WIRE
  // Warm white background, Deep Saudi green active states, Desert gold accents
  // ============================================================================
  return (
    <header className="w-full bg-[#FAF9F6] transition-all">
      {/* 1. Grand Editorial Masthead — Purely Centered & Symmetrical */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-1">
          <Link
            href="/"
            className="group inline-block focus:outline-none"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#111827] group-hover:text-[#0B6E4F] transition-colors">
              {SITE_NAME}
            </h1>
          </Link>
          <p className="font-heading font-medium text-xs sm:text-sm text-[#4B5563] tracking-wide max-w-lg mx-auto">
            Build in the Kingdom. Powered by verified intelligence.
          </p>
          <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-[#0B6E4F] font-bold">
            Founder Operating Intelligence Platform • Kingdom of Saudi Arabia
          </p>
        </div>
      </div>

      {/* Spacer to prevent layout shift when navbar becomes fixed on scroll */}
      {isScrolled && <div className="h-11 sm:h-12 w-full" aria-hidden="true" />}

      {/* 2. Main Navigation Ribbon & Utility Bar */}
      <div
        className={cn(
          'w-full bg-[#FAF9F6]/95 backdrop-blur-md transition-all duration-200 z-40',
          isScrolled
            ? 'fixed top-0 left-0 right-0 border-b border-[#E2E8E4] shadow-xs py-1.5 animate-in slide-in-from-top-1 duration-200'
            : 'relative border-t border-b border-[#E2E8E4] py-1.5 sm:py-2'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-9 sm:h-10">
          {/* Scrolled Brand Indicator (Visible when sticky) */}
          {isScrolled && (
            <Link
              href="/"
              className="font-serif font-black text-base sm:text-lg tracking-tight text-[#111827] hover:text-[#0B6E4F] transition-editorial shrink-0 pr-4 border-r border-[#E2E8E4]"
            >
              {SITE_NAME}
            </Link>
          )}

          {/* Desktop Categories Navigation */}
          <nav
            className={cn(
              'hidden lg:flex items-center gap-1 sm:gap-2 xl:gap-3 overflow-x-auto min-w-0',
              isScrolled ? 'justify-start' : 'justify-center flex-1'
            )}
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
                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold font-sans uppercase tracking-wider transition-editorial whitespace-nowrap border-b-2 shrink-0',
                    isActive
                      ? 'text-[#0B6E4F] font-bold border-[#0B6E4F]'
                      : 'text-[#4B5563] hover:text-[#111827] border-transparent hover:border-[#C9A227]/40'
                  )}
                >
                  <span>{link.label}</span>
                  {hasBadge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-sans tracking-wide uppercase rounded-full bg-[#E8F5EF] text-[#0B6E4F] border border-[#0B6E4F]/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: Search & Subscribe */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto pl-2">
            {/* Integrated Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-[#4B5563] hover:text-[#111827] bg-[#F1F5F2] hover:bg-[#E7EFE9] border border-[#E2E8E4] rounded-md transition-editorial"
              aria-label="Toggle search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#4B5563]" />
              <span className="hidden sm:inline text-[11px] font-medium">Search</span>
              <kbd className="hidden md:inline-flex items-center text-[9px] px-1 py-0.2 rounded bg-white text-[#4B5563] border border-[#E2E8E4] font-mono">⌘K</kbd>
            </button>

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
              className="lg:hidden p-1.5 text-[#4B5563] hover:text-[#111827] transition-editorial ml-1"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Search Drawer */}
        {searchOpen && (
          <div className="py-4 px-4 border-t border-[#E2E8E4] bg-[#F1F5F2]/95 backdrop-blur-md animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Saudi startups, VCs, grants, ticket sizes, or tech (e.g. Tamara, NTDP, Mozn)..."
                  className="w-full bg-white border border-[#E2E8E4] rounded-md pl-10 pr-28 py-2 text-xs sm:text-sm text-[#111827] placeholder-[#4B5563]/70 focus:outline-none focus:border-[#0B6E4F] focus:ring-1 focus:ring-[#0B6E4F] transition-editorial font-sans"
                  autoFocus
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#0B6E4F] text-xs font-bold text-white rounded-md hover:bg-[#08533C] transition-editorial font-sans uppercase tracking-wider"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-[#4B5563] hover:text-[#111827] rounded-md"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instant Live Results Preview */}
              {livePreview && (livePreview.startups.length > 0 || livePreview.investors.length > 0 || livePreview.opportunities.length > 0) && (
                <div className="bg-white rounded-md border border-[#E2E8E4] p-2.5 space-y-1.5 text-xs shadow-xs animate-in fade-in">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                    Instant Suggestions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {livePreview.startups.map((s) => (
                      <Link
                        key={s.id}
                        href={`/startup/${s.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#111827] flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#19B5A3]" />
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] text-[#4B5563]">({s.stage})</span>
                      </Link>
                    ))}
                    {livePreview.investors.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/investor/${inv.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-[#F1F5F2] hover:bg-[#FDF8EC] text-[#111827] flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                        <span className="font-semibold">{inv.name}</span>
                        <span className="text-[10px] text-[#4B5563]">(Investor)</span>
                      </Link>
                    ))}
                    {livePreview.opportunities.map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/opportunity/${opp.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-0.5 rounded bg-[#F1F5F2] hover:bg-[#E8F5EF] text-[#111827] flex items-center gap-1 transition-colors text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E4F]" />
                        <span className="font-semibold truncate max-w-[140px]">{opp.title}</span>
                        <span className="text-[10px] text-[#4B5563]">(Grant)</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Search Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] font-sans mr-1">
                  Topics:
                </span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                    }}
                    className="text-[11px] font-sans px-2 py-0.5 rounded-xs bg-white text-[#4B5563] hover:text-[#0B6E4F] border border-[#E2E8E4] transition-editorial"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8E4] bg-[#FAF9F6] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4B5563] px-2 font-sans">
                Founder Intelligence &amp; Sections
              </span>
              {NAV_LINKS.map((link) => {
                const hasBadge = 'badge' in link && Boolean(link.badge);
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-editorial',
                      isActive
                        ? 'bg-[#E8F5EF] text-[#0B6E4F] font-bold'
                        : 'text-[#111827] hover:bg-[#F1F5F2]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.label}</span>
                      {hasBadge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-[#E8F5EF] text-[#0B6E4F]">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E4F]" aria-hidden="true" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2E8E4] space-y-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-editorial"
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
      </div>
    </header>
  );
};
