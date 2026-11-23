'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

const SLIDE_DURATION_MS = 7000;

export const FounderCommandHero: React.FC<FounderCommandHeroProps> = ({
  opportunitiesCount = 8,
  startupsCount = 8,
  pillarsCount = 6,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // 2. Count-up Animation Effect for Verified Metrics
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
    <div className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#0e1828] border-b border-brand-navy/30 shadow-xl text-white" style={{ contain: 'paint', clipPath: 'inset(0)' }}>
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
                  <div className="absolute inset-0 overflow-hidden" style={{ contain: 'paint' }}>
                    <div className={`relative w-full h-full overflow-hidden ${isActive ? 'animate-hero-kb' : ''}`}>
                      {isVideo ? (
                        <video
                          src={slide.src}
                          muted
                          loop
                          playsInline
                          autoPlay={isActive}
                          className="w-full h-full object-cover object-center block"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.src}
                          alt=""
                          className="w-full h-full object-cover object-center block"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Cinematic Vignette Shade for Guaranteed WCAG Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d17]/85 via-[#0e1828]/50 to-[#0e1828]/90 pointer-events-none" />

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
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-6 sm:pb-12 flex-1 flex flex-col justify-between">
        {/* Middle Main Content Stack */}
        <div className="my-auto text-center space-y-3 sm:space-y-6 max-w-3xl mx-auto w-full">
          {/* 1. Value Badge with Pulsing Live Dot & Subtle Arabic Typography Accent */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/12 border border-white/20 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6fd39a] animate-hero-pulse shrink-0" />
              <span className="font-heading text-[10px] sm:text-xs font-bold tracking-wider uppercase text-white">
                Founder Operating Intelligence Platform
              </span>
            </div>
            <span className="text-[#c4a265]/50 text-xs select-none" aria-hidden="true">·</span>
            <span
              lang="ar"
              dir="rtl"
              className="font-arabic text-[10px] sm:text-xs font-medium text-[#f3dfae] tracking-normal"
            >
              ذكاء موثوق لرواد الأعمال
            </span>
          </div>

          {/* 2. Primary Headline & Slogan */}
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-[1.15] text-white">
              <span>Build in the Kingdom.</span>{' '}
              <span className="block mt-0.5 sm:mt-1 bg-gradient-to-r from-white via-[#c4a265] to-[#f3dfae] bg-clip-text text-transparent">
                Powered by verified intelligence.
              </span>
            </h1>
            <p
              lang="ar"
              dir="rtl"
              className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed max-w-xl mx-auto font-arabic pt-1 tracking-normal line-clamp-3 sm:line-clamp-none"
            >
              منصة استخباراتية موثوقة تدعم رواد الأعمال في اكتشاف المنح والتمويل غير القائم على التنازل عن حصص الملكية، والتواصل مع مستثمري رأس المال الجريء، واستكشاف التقنيات الناشئة، واتخاذ قرارات استراتيجية مدروسة لتعزيز نمو أعمالهم في المملكة العربية السعودية.
            </p>
          </div>

          {/* 3. Centered Explore Button — Redirects to Unified Search */}
          <div className="pt-1.5 sm:pt-4 flex items-center justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2.5 sm:gap-3 px-7 sm:px-10 py-2.5 sm:py-4 rounded-xl bg-brand-navy hover:bg-[#0B6E4F] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-widest border border-white/20 hover:border-[#C9A227]/70 shadow-2xl hover:shadow-[0_0_25px_rgba(11,110,79,0.4)] transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 4. Live Verified KPI Ribbon (In document flow, guaranteed no overlap) */}
        <div className="w-full max-w-4xl mx-auto pt-4 sm:pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-left">
            <div className="p-2.5 sm:p-4 rounded-xl bg-black/40 sm:bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-white block">
                {activeCount} Active
              </span>
              <span className="text-[10px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Verified Grants &amp; Accelerators
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-xl bg-black/40 sm:bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-[#8fd3a6] block">
                {venturesCount} Ventures
              </span>
              <span className="text-[10px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Verified Saudi Tech Directory
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-xl bg-black/40 sm:bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-[#c4a265] block">
                {desksCount} Desks
              </span>
              <span className="text-[10px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Sovereign Vision 2030 Pillars
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-xl bg-black/40 sm:bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all shadow-md">
              <span className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-[#3fa796] block">
                Zero Speculation
              </span>
              <span className="text-[10px] sm:text-xs text-white/75 font-medium block pt-0.5">
                Official Ministry Provenance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
