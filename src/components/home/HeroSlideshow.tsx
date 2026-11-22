'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Slide = {
  src: string;
  place: string;
  alt: string;
  /** Focal point kept in frame when the wide band crops the photo. */
  position?: string;
  kicker: string;
  /** Headline in two parts: roman, then italic. */
  headline: [string, string];
  dek: string;
  href: string;
};

// Each photograph carries the story it illustrates.
const SLIDES: Slide[] = [
  {
    src: '/hero/slide-3.jpg',
    place: 'The desert frontier',
    alt: 'Aerial view of desert dunes',
    position: '50% 55%',
    kicker: 'Clean energy · NEOM',
    headline: ['Turning desert sun', 'into green hydrogen.'],
    dek: 'Inside NEOM’s electrolyser complex: the scale it is built for, the desalination loop that feeds it, and how the fuel will be shipped out.',
    href: '/article/neom-green-hydrogen-complex-electrolyzer-scale-desalination',
  },
  {
    src: '/hero/slide-1.jpg',
    place: 'At work',
    alt: 'A team working at desks in an open-plan office',
    position: '50% 15%',
    kicker: 'GovTech',
    headline: ['Government services,', 'rebuilt to run in real time.'],
    dek: 'How Absher and Tawakkalna are being rebuilt behind the screens people use every day — and what that means for the companies that plug into them.',
    href: '/article/digital-public-infrastructure-absher-tawakkalna-microservice-architecture',
  },
  {
    src: '/hero/slide-4.jpg',
    place: 'The Red Sea coast',
    alt: 'A sandbar curving through turquoise water',
    position: '50% 50%',
    kicker: 'Clean energy · Red Sea',
    headline: ['A coastline that runs', 'on its own grid.'],
    dek: 'Red Sea Global’s destination is powered off-grid by solar and batteries. We look at how the system is designed and balanced.',
    href: '/article/red-sea-global-off-grid-microgrid-solar-battery-architecture',
  },
  {
    src: '/hero/slide-2.jpg',
    place: 'In the souq',
    alt: 'Two shoppers walking through a covered souq',
    position: '50% 20%',
    kicker: 'FinTech',
    headline: ['From the souq to the screen:', 'how Saudis pay is changing.'],
    dek: 'SAMA’s sandbox is opening banking to new players, and embedded finance and buy-now-pay-later are following shoppers wherever they go.',
    href: '/article/open-banking-evolution-sama-regulatory-sandbox-embedded-finance',
  },
  {
    src: '/hero/slide-5.jpg',
    place: 'Connected to the world',
    alt: 'A passenger jet taking off',
    position: '50% 45%',
    kicker: 'FinTech · Trade',
    headline: ['Money that crosses borders', 'in seconds.'],
    dek: 'How SARIE and new links between Gulf central banks are changing the way businesses in the region pay each other.',
    href: '/article/cross-border-instant-settlement-sarie-gcc-central-bank-interconnects',
  },
];

const DURATION = 7000;

interface HeroSlideshowProps {
  counts: { opportunities: number; startups: number; investors?: number };
}

/**
 * Full-bleed photographic opener. Each photograph carries its own story:
 * kicker, headline, standfirst and link change with the slide. Slow crossfade
 * + Ken Burns drift, type set over a warm ink scrim. Directory links stay fixed.
 */
export function HeroSlideshow({ counts }: HeroSlideshowProps) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // Bumped each time a slide becomes active, so its zoom restarts from the beginning.
  const [runs, setRuns] = useState<number[]>(() => SLIDES.map(() => 0));
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = (i + SLIDES.length) % SLIDES.length;
      if (next === active) return;
      setPrev(active);
      setRuns((r) => r.map((n, k) => (k === next ? n + 1 : n)));
      setActive(next);
    },
    [active]
  );

  useEffect(() => {
    if (paused || reduced) return;
    timer.current = setTimeout(() => go(active + 1), DURATION);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, paused, reduced, go]);

  const running = !paused && !reduced;
  const slide = SLIDES[active];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Saudi Future Tech"
      className="relative isolate overflow-hidden bg-ink text-paper-sheet"
      // No hover pause: the hero fills most of the screen, so the cursor is nearly
      // always over it. Pause only while a keyboard user is tabbing through it.
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches(':focus-visible')) setPaused(true);
      }}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Photographs */}
      <div className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            aria-hidden={i !== active}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1600ms] ease-in-out',
              i === active ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* The outgoing slide keeps its zoom while it fades, so nothing snaps. */}
            <div
              key={`${i}-${runs[i]}`}
              className={cn('absolute inset-0', (i === active || i === prev) && !reduced && 'kenburns')}
              style={{ transformOrigin: s.position ?? 'center' }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: s.position, filter: 'saturate(0.85) contrast(1.04) sepia(0.08)' }}
              />
            </div>
          </div>
        ))}
        {/* Warm ink scrim: heavier at the bottom-left where the type sits */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(26,23,20,0.92) 0%, rgba(26,23,20,0.55) 38%, rgba(26,23,20,0.15) 70%, rgba(26,23,20,0.35) 100%), radial-gradient(ellipse at 15% 85%, rgba(26,23,20,0.55), transparent 60%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-10 min-h-[34rem] h-[min(86dvh,52rem)] flex flex-col justify-end pb-8 md:pb-10 pt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {/* Stable page heading for screen readers; the visible headline changes with the photo. */}
            <h1 className="sr-only">Saudi Future Tech — reporting on technology in Saudi Arabia</h1>
            <div key={`h-${active}`} className="rise" aria-live="polite">
              <p className="font-sans text-[0.71875rem] uppercase tracking-[0.06em] text-clay-tint mb-4">
                {slide.kicker}
              </p>
              <h2 className="font-serif text-display-xl text-paper-sheet max-w-[17ch]">
                <Link href={slide.href} className="hover:text-paper-band transition-colors">
                  {slide.headline[0]} <em className="italic text-paper-band/90">{slide.headline[1]}</em>
                </Link>
              </h2>
              <Link href={slide.href} className="group mt-6 inline-flex items-center gap-2 text-sm text-paper-sheet">
                <span className="link-rule">Read the story</span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 rise" style={{ animationDelay: '120ms' }}>
            <p key={`d-${active}`} className="rise text-[0.9375rem] leading-relaxed text-paper-band/80 mb-5 max-w-sm">
              {slide.dek}
            </p>
            <ul className="border-t border-paper-sheet/25">
              {[
                { href: '/opportunities', label: 'Open grants & programmes', n: counts.opportunities },
                { href: '/startups', label: 'Startup register', n: counts.startups },
                ...(counts.investors ? [{ href: '/funding', label: 'Investors', n: counts.investors }] : []),
              ].map((l) => (
                <li key={l.href} className="border-b border-paper-sheet/25">
                  <Link href={l.href} className="group flex items-baseline justify-between gap-4 py-3">
                    <span className="text-[0.9375rem] text-paper-sheet group-hover:text-clay-tint transition-colors">{l.label}</span>
                    <span className="font-sans tabular text-[0.75rem] text-paper-band/70">
                      {l.n}{' '}
                      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slide rail: caption + numbered indicators with progress */}
        <div className="mt-10 pt-4 border-t border-paper-sheet/20 flex items-center justify-between gap-6">
          <p className="font-sans text-[0.71875rem] text-paper-band/80 tabular min-w-0 truncate" aria-live="polite">
            {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} · {SLIDES[active].place}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photograph ${i + 1}: ${s.place}`}
                aria-current={i === active}
                className="group relative h-6 w-5 sm:w-12 flex items-center"
              >
                <span className="block h-px w-full bg-paper-sheet/30 group-hover:bg-paper-sheet/60 transition-colors" />
                {i === active && (
                  <span
                    key={`p-${active}-${running}`}
                    className={cn('absolute left-0 top-1/2 h-px w-full bg-paper-sheet', running && 'slide-progress')}
                    style={running ? { animationDuration: `${DURATION}ms` } : undefined}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
