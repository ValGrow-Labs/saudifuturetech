import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SECTION_NAMES_AR } from '@/lib/arabic';
import { PHOTO_CREDITS, type PhotoKey } from '@/lib/photo-credits';

type Section = { id: string; name: string; slug: string; description: string };

// One photograph of a real Saudi place per desk.
const SECTION_PHOTOS: Record<string, { src: string; credit?: PhotoKey }> = {
  'ai-deep-tech': { src: '/photos/kaust-campus.jpg', credit: 'kaust-campus' },
  govtech: { src: '/photos/diriyah-at-turaif.jpg', credit: 'diriyah-at-turaif' },
  cybersecurity: { src: '/photos/riyadh-kingdom-centre-sunset.jpg', credit: 'riyadh-kingdom-centre-sunset' },
  'smart-cities-infra': { src: '/photos/riyadh-metro-kafd.jpg', credit: 'riyadh-metro-kafd' },
  fintech: { src: '/photos/kafd-night.jpg', credit: 'kafd-night' },
  'clean-energy': {
    src: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=75',
  },
};

// Asymmetric bento: one feature tile, then a rhythm of wide and narrow tiles.
const TILE = [
  'md:col-span-7 md:row-span-2 min-h-[18rem] md:min-h-[26rem]',
  'md:col-span-5 min-h-[12.5rem]',
  'md:col-span-5 min-h-[12.5rem]',
  'md:col-span-4 min-h-[14rem]',
  'md:col-span-4 min-h-[14rem]',
  'md:col-span-4 min-h-[14rem]',
];

/** The six desks as a bento of Saudi photographs, named in English and Arabic. */
export function SectionIndex({ sections }: { sections: Section[] }) {
  const shown = sections.slice(0, 6);
  const credits = shown
    .map((s) => SECTION_PHOTOS[s.slug]?.credit)
    .filter((c): c is PhotoKey => Boolean(c && PHOTO_CREDITS[c]));

  return (
    <section aria-labelledby="sections-index">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="kicker mb-5">What we cover</p>
          <h2 id="sections-index" className="font-serif text-display-lg text-ink">
            Six desks, <span className="text-ink-3">one Kingdom.</span>
          </h2>
        </div>
        <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-3">
          From national AI to the grid in the desert: the parts of Saudi Arabia’s build-out we report on every week.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        {shown.map((s, i) => {
          const photo = SECTION_PHOTOS[s.slug];
          const ar = SECTION_NAMES_AR[s.slug];
          const feature = i === 0;
          return (
            <li key={s.id} className={cn('bezel', TILE[i] ?? 'md:col-span-4 min-h-[14rem]')}>
              <Link
                href={`/category/${s.slug}`}
                className="group bezel-core relative flex h-full flex-col justify-end isolate"
              >
                {photo && (
                  <Image
                    src={photo.src}
                    alt={photo.credit ? PHOTO_CREDITS[photo.credit]?.alt ?? '' : ''}
                    fill
                    sizes={feature ? '(max-width: 768px) 100vw, 58vw' : '(max-width: 768px) 100vw, 34vw'}
                    className="-z-10 object-cover img-warm transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/55 to-night/5"
                />
                <span className="relative p-5 md:p-6">
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-[0.75rem] tabular tracking-[0.2em] text-snow/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {ar && (
                      <span lang="ar" dir="rtl" className="font-sans text-[0.9375rem] font-medium text-[#E8CB8C] [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
                        {ar}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'mt-3 flex items-end justify-between gap-4 font-serif font-semibold tracking-tight text-snow',
                      feature ? 'text-[2.25rem] md:text-[3rem] leading-[1.02]' : 'text-[1.625rem] leading-tight'
                    )}
                  >
                    {s.name}
                    <span
                      aria-hidden
                      className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-base text-snow backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-clay group-hover:text-paper"
                    >
                      ↗
                    </span>
                  </span>
                  <span
                    className={cn(
                      'block mt-2 text-[0.9375rem] leading-relaxed text-snow/70',
                      feature ? 'max-w-md' : 'max-w-sm line-clamp-2'
                    )}
                  >
                    {s.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {credits.length > 0 && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-4">
          Photographs via Wikimedia Commons:{' '}
          {credits.map((k, i) => {
            const c = PHOTO_CREDITS[k];
            return (
              <React.Fragment key={k}>
                {i > 0 && '; '}
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {c.place}
                </a>{' '}
                by {c.author} ({c.license})
              </React.Fragment>
            );
          })}
          .
        </p>
      )}
    </section>
  );
}
