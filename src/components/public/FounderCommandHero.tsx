'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  Coins, 
  Building2, 
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  SceneS1,
  SceneS2,
  SceneS3,
  SceneS4,
  SceneS5,
} from './HeroScenes';

interface FounderCommandHeroProps {
  opportunitiesCount?: number;
  startupsCount?: number;
  pillarsCount?: number;
}

interface SlideItem {
  label: string;
  scene: 's1' | 's2' | 's3' | 's4' | 's5';
  src: string;
}

const SLIDES: SlideItem[] = [
  {
    label: 'BUSINESS · THE OFFICE',
    scene: 's3',
    src: '/hero/slide-1.jpg',
  },
  {
    label: 'PEOPLE · THE KINGDOM',
    scene: 's1',
    src: '/hero/slide-2.jpg',
  },
  {
    label: 'DESERT · THE FRONTIER',
    scene: 's2',
    src: '/hero/slide-3.jpg',
  },
  {
    label: 'SEA · THE RED SEA COAST',
    scene: 's4',
    src: '/hero/slide-4.jpg',
  },
  {
    label: 'AIRWAYS · CONNECTED TO THE WORLD',
    scene: 's5',
    src: '/hero/slide-5.jpg',
  },
];

const TYPEWRITER_TERMS = [
  'NTDP MVPLab',
  'SAMA Sandbox',
  'Mozn AI',
  'The Garage Seed Cohort',
  'Saudi fintech startups',
  'Active KSA VCs',
];

const SLIDE_DURATION_MS = 7000;

export const FounderCommandHero: React.FC<FounderCommandHeroProps> = ({
  opportunitiesCount = 8,
  startupsCount = 8,
  pillarsCount = 6,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');

  // Animated count-up states
  const [activeCount, setActiveCount] = useState(0);
  const [venturesCount, setVenturesCount] = useState(0);
  const [desksCount, setDesksCount] = useState(0);

  // 1. Slideshow Auto-Cycle
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentSlide(index);
    timerRef.current = setTimeout(() => {
      goToSlide((index + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToSlide(1);
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [goToSlide]);

  // 2. Typewriter Search Placeholder Effect
  useEffect(() => {
    let termIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const currentTerm = TYPEWRITER_TERMS[termIndex];

      if (!isDeleting && charIndex <= currentTerm.length) {
        setTypewriterText(currentTerm.slice(0, charIndex));
        charIndex++;
        if (charIndex > currentTerm.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1400); // pause on full term
          return;
        }
      } else if (isDeleting && charIndex > 0) {
        setTypewriterText(currentTerm.slice(0, charIndex));
        charIndex--;
      } else {
        isDeleting = false;
        termIndex = (termIndex + 1) % TYPEWRITER_TERMS.length;
        charIndex = 0;
      }

      timeoutId = setTimeout(tick, isDeleting ? 40 : 80);
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // 3. Count-up Animation Effect for Verified Metrics
  useEffect(() => {
    const duration = 1200; // 1.2s
    const steps = 24;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setActiveCount(Math.round(eased * opportunitiesCount));
      setVenturesCount(Math.round(eased * startupsCount));
      setDesksCount(Math.round(eased * pillarsCount));

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [opportunitiesCount, startupsCount, pillarsCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderSceneFallback = (scene: SlideItem['scene']) => {
    switch (scene) {
      case 's1':
        return <SceneS1 />;
      case 's2':
        return <SceneS2 />;
      case 's3':
        return <SceneS3 />;
      case 's4':
        return <SceneS4 />;
      case 's5':
        return <SceneS5 />;
      default:
        return <SceneS3 />;
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0e1828] border-b border-brand-navy/30 shadow-xl text-white" style={{ contain: 'paint', clipPath: 'inset(0)' }}>
      {/* ==================================================================== */}
      {/* BACKGROUND MEDIA SLIDESHOW & RUNNER                                  */}
      {/* ==================================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ contain: 'paint', clipPath: 'inset(0)' }}>
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const isVideo = /\.(mp4|webm)$/i.test(slide.src);

          return (
            <div
              key={slide.label}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ contain: 'paint', clipPath: 'inset(0)' }}
              aria-hidden={!isActive}
            >
              <div className="relative w-full h-full overflow-hidden" style={{ contain: 'paint' }}>
                {/* Fallback Animated Vector Scene */}
                <div className="absolute inset-0 overflow-hidden" style={{ contain: 'paint' }}>
                  {renderSceneFallback(slide.scene)}
                </div>

                {/* Real Media Layer (Photo with Ken Burns or Video) */}
                {slide.src && (
                  <div className={`absolute inset-0 overflow-hidden ${isActive ? 'animate-hero-kb' : ''}`} style={{ contain: 'paint' }}>
                    {isVideo ? (
                      <video
                        src={slide.src}
                        muted
                        loop
                        playsInline
                        autoPlay={isActive}
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.src}
                        alt=""
                        className="w-full h-full object-cover block"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Cinematic Vignette Shade for Guaranteed WCAG Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d17]/90 via-[#0e1828]/55 to-[#0e1828]/95" />

        {/* Arabesque Geometric Watermark Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] animate-hero-drift pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 2l28 28-28 28L2 30z M30 14l16 16-16 16-16-16z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ==================================================================== */}
      {/* FOREGROUND CONTENT & ALIGNMENT STRUCTURE                             */}
      {/* ==================================================================== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-10 lg:pb-12 flex flex-col justify-between">
        {/* Middle Main Content Stack */}
        <div className="my-auto text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full">
          {/* 1. Value Badge with Pulsing Live Dot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/12 border border-white/20 backdrop-blur-md text-[11px] sm:text-xs font-bold tracking-wider uppercase text-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6fd39a] animate-hero-pulse shrink-0" />
            <span className="font-heading">Founder Operating Intelligence Platform</span>
          </div>

          {/* 2. Primary Headline & Slogan */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-[1.12] text-white">
              <span>Build in the Kingdom.</span>{' '}
              <span className="block mt-1 bg-gradient-to-r from-white via-[#c4a265] to-[#f3dfae] bg-clip-text text-transparent">
                Powered by verified intelligence.
              </span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/85 leading-relaxed max-w-2xl mx-auto font-sans pt-0.5">
              The verified intelligence platform helping founders discover non-dilutive grants, navigate venture capital, explore emerging technology, and make high-conviction decisions in Saudi Arabia.
            </p>
          </div>

          {/* 3. Global Command Search Bar with Typewriter Placeholder */}
          <div className="max-w-2xl mx-auto w-full pt-1">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/40 focus-within:ring-2 focus-within:ring-[#c4a265] transition-all"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder={`Search grants, startups, or VCs (e.g. ${typewriterText}|)`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent text-brand-navy placeholder:text-slate-500 font-sans focus:outline-none"
                  aria-label="Search verified intelligence"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-brand-navy hover:bg-brand-oasis text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 group"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Quick Filter Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-widest mr-1">
                Quick Shortcuts:
              </span>
              <Link
                href="/opportunities"
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-[#c4a265] hover:text-brand-navy text-white text-[11px] sm:text-xs font-medium border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Coins className="w-3 h-3 text-[#f3dfae]" />
                <span>NTDP MVPLab</span>
              </Link>
              <Link
                href="/opportunities"
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-[#c4a265] hover:text-brand-navy text-white text-[11px] sm:text-xs font-medium border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-[#8fd3a6]" />
                <span>The Garage Seed Cohort</span>
              </Link>
              <Link
                href="/startups"
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-[#c4a265] hover:text-brand-navy text-white text-[11px] sm:text-xs font-medium border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Building2 className="w-3 h-3 text-[#8fe2db]" />
                <span>Verified Saudi Startups</span>
              </Link>
              <Link
                href="/funding"
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-[#c4a265] hover:text-brand-navy text-white text-[11px] sm:text-xs font-medium border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xs"
              >
                <TrendingUp className="w-3 h-3 text-white" />
                <span>Active KSA VCs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Live Verified KPI Ribbon (In document flow, guaranteed no overlap) */}
        <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-left">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white block">
                {activeCount} Active
              </span>
              <span className="text-[11px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Verified Grants &amp; Accelerators
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-[#8fd3a6] block">
                {venturesCount} Ventures
              </span>
              <span className="text-[11px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Verified Saudi Tech Directory
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-[#c4a265] block">
                {desksCount} Desks
              </span>
              <span className="text-[11px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Sovereign Vision 2030 Pillars
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-[#3fa796] block">
                Zero Speculation
              </span>
              <span className="text-[11px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Official Ministry Provenance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
