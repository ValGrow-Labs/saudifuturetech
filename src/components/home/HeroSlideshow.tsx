'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PHOTO_CREDITS, type PhotoKey } from '@/lib/photo-credits';

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
  /** Set for Wikimedia Commons photos, whose licences require a credit. */
  credit?: PhotoKey;
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
    src: '/photos/riyadh-skyline-night.jpg',
    place: 'Riyadh at dusk',
    alt: 'The Riyadh skyline at dusk with the KAFD towers and the Kingdom Centre',
    position: '50% 60%',
    credit: 'riyadh-skyline-night',
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
    src: '/photos/jeddah-islamic-port.jpg',
    place: 'Jeddah Islamic Port',
    alt: 'Container cranes at Jeddah Islamic Port across the Red Sea',
    position: '50% 55%',
    credit: 'jeddah-islamic-port',
    kicker: 'FinTech · Trade',
    headline: ['Money that crosses borders', 'in seconds.'],
    dek: 'How SARIE and new links between Gulf central banks are changing the way businesses in the region pay each other.',
    href: '/article/cross-border-instant-settlement-sarie-gcc-central-bank-interconnects',
  },
];

const DURATION = 7000;

interface HeroSlideshowProps {
  counts: { opportunities: number; startups: number; investors?: number };
  /** Headlines for the scrolling ticker under the hero. */
  ticker?: { title: string; href: string; label: string }[];
}

/**
 * Split opener on the sand: the story (kicker, headline, standfirst, link) on
 * the left changes with the photograph on the right, which sits in a
 * double-bezel frame with nothing laid over it. Slow crossfade + gentle zoom.
 */
export function HeroSlideshow({ counts, ticker = [] }: HeroSlideshowProps) {
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

  const stats = [
    { href: '/opportunities', label: 'Open grants', n: counts.opportunities },
    { href: '/startups', label: 'Startups', n: counts.startups },
    ...(counts.investors ? [{ href: '/funding', label: 'Investors', n: counts.investors }] : []),
  ];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Top stories"
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches(':focus-visible')) setPaused(true);
      }}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Stable page heading for screen readers; the visible headline changes with the story. */}
      <h1 className="sr-only">Saudi Future Tech — reporting on technology in Saudi Arabia</h1>

      <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 grid gap-5 lg:grid-cols-12">
        {/* ---------- Lead story card ---------- */}
        <div className="lg:col-span-8 bezel shadow-lift">
          <div className="bezel-core relative isolate min-h-[30rem] md:min-h-[36rem] h-full flex flex-col justify-end">
            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                aria-hidden={i !== active}
                className={cn(
                  'absolute inset-0 -z-10 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
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
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    style={{ objectPosition: s.position }}
                  />
                </div>
              </div>
            ))}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night/70 via-night/10 to-transparent" />

            {/* Place chip */}
            <p className="absolute top-5 left-5 md:top-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-night/35 px-3.5 py-1.5 text-[0.75rem] text-snow ring-1 ring-white/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FD39A] live-dot" aria-hidden />
              {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} · {SLIDES[active].place}
              {SLIDES[active].credit && (
                <a
                  href={PHOTO_CREDITS[SLIDES[active].credit!].source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline text-snow/60 underline underline-offset-2 hover:text-snow"
                >
                  Photo: {PHOTO_CREDITS[SLIDES[active].credit!].author}, {PHOTO_CREDITS[SLIDES[active].credit!].license}
                </a>
              )}
            </p>

            {/* Story in a frosted-glass panel */}
            <div className="m-3 md:m-5 bg-night/45 p-6 md:p-8 text-snow ring-1 ring-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <div key={`h-${active}`} className="rise" aria-live="polite">
                <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[#E8CB8C] ring-1 ring-white/15">
                  {slide.kicker}
                </p>
                <h2 className="mt-4 font-serif text-[2rem] md:text-[2.75rem] leading-[1.04] tracking-tight text-snow max-w-[20ch]">
                  <Link href={slide.href} className="hover:text-white">
                    {slide.headline[0]} <em className="italic text-snow/75">{slide.headline[1]}</em>
                  </Link>
                </h2>
                <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <p className="max-w-lg text-[0.9375rem] leading-relaxed text-snow/80">{slide.dek}</p>
                  <Link href={slide.href} className="group btn-primary shrink-0 !pl-5 !pr-1.5 !py-1.5 self-start md:self-auto">
                    Read the story
                    <span aria-hidden className="btn-orb !mr-0 !w-8 !h-8">
                      ↗
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Top stories rail + stats ---------- */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bezel flex-1">
            <div className="bezel-core p-3 h-full">
              <p className="px-3 pt-2 pb-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ink-3">Top stories</p>
              <ol className="space-y-1">
                {SLIDES.map((s, i) => (
                  <li key={s.src}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={i === active}
                      className={cn(
                        'group relative w-full overflow-hidden p-2.5 text-left grid grid-cols-[4rem_1fr] gap-3 items-center transition-colors duration-500',
                        i === active ? 'bg-paper' : 'hover:bg-paper/60'
                      )}
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-md bg-paper-band">
                        <Image src={s.src} alt="" fill sizes="64px" className="object-cover" style={{ objectPosition: s.position }} />
                      </span>
                      <span className="min-w-0">
                        <span className={cn('block text-[0.625rem] font-semibold uppercase tracking-[0.16em]', i === active ? 'text-clay' : 'text-ink-4')}>
                          {s.kicker}
                        </span>
                        <span className="mt-1 block text-[0.875rem] font-semibold leading-snug text-ink line-clamp-2">
                          {s.headline[0]} {s.headline[1]}
                        </span>
                      </span>
                      {i === active && (
                        <span
                          key={`p-${active}-${running}`}
                          aria-hidden
                          className={cn('absolute left-0 bottom-0 h-[2px] w-full bg-clay', running && 'slide-progress')}
                          style={running ? { animationDuration: `${DURATION}ms` } : undefined}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ul className="grid grid-cols-3 gap-3">
            {stats.map((st) => (
              <li key={st.href} className="bezel-sm">
                <Link href={st.href} className="group bezel-core block p-4 transition-colors duration-500 hover:bg-paper">
                  <span className="block font-serif text-[2rem] leading-none font-semibold tabular text-ink">{st.n}</span>
                  <span className="mt-2 flex items-center justify-between text-[0.75rem] text-ink-3">
                    {st.label}
                    <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------- Live ticker ---------- */}
      {ticker.length > 0 && (
        <div className="mt-8 md:mt-10 border-y border-ink/10 bg-paper-sheet/60">
          <div className="mx-auto max-w-[112rem] flex items-center">
            <p className="shrink-0 flex items-center gap-2 pl-4 sm:pl-6 lg:pl-10 pr-5 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-clay border-r border-ink/10">
              <span className="h-1.5 w-1.5 rounded-full bg-alert live-dot" aria-hidden />
              Now reading
            </p>
            <div className="ticker relative flex-1 overflow-hidden">
              <ul className="ticker-track flex w-max items-center gap-10 py-3.5 pl-6">
                {[...ticker, ...ticker].map((t, i) => (
                  <li key={i} aria-hidden={i >= ticker.length} className="flex items-center gap-3 whitespace-nowrap text-[0.875rem]">
                    <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold">{t.label}</span>
                    <Link
                      href={t.href}
                      tabIndex={i >= ticker.length ? -1 : undefined}
                      className="text-ink-2 hover:text-clay transition-colors"
                    >
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
