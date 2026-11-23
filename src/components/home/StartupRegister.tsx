import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StartupItem } from '@/components/public/StartupDirectory';
import { stageLabel } from '@/lib/labels';

/**
 * Companies we track — a "who's who" listing, not a spreadsheet.
 * Each entry: the company's logo (or a serif initial when none is on file),
 * the name, what it does, and a quiet line of facts.
 */
export function StartupRegister({ startups, total }: { startups: StartupItem[]; total: number }) {
  const rows = [...startups].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 6);

  return (
    <section aria-labelledby="startup-register">
      <div className="border-t-2 border-ink pt-4 mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="kicker mb-2">The register</p>
          <h2 id="startup-register" className="font-serif text-display-md text-ink">
            Companies we track
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3">
            Saudi startups with a registered company, a working product and a named team.
          </p>
        </div>
        <Link href="/startups" className="group shrink-0 inline-flex items-center gap-2 text-sm text-ink">
          <span className="link-rule">See all {total} companies</span>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <ul className="grid md:grid-cols-2 md:gap-x-14">
        {rows.map((s) => (
          <li key={s.id} className="border-b border-rule">
            <Link href={`/startup/${s.slug}`} className="group grid grid-cols-[3.25rem_1fr] gap-5 py-7">
              {s.logoUrl ? (
                <Image
                  src={s.logoUrl}
                  alt=""
                  width={52}
                  height={52}
                  className="h-[3.25rem] w-[3.25rem] object-contain bg-paper-sheet border border-rule"
                />
              ) : (
                // No logo on file: a serif initial instead.
                <span
                  aria-hidden
                  className="h-[3.25rem] w-[3.25rem] bg-paper-band text-ink font-serif text-[1.75rem] leading-none flex items-center justify-center transition-colors duration-300 group-hover:bg-ink group-hover:text-paper-sheet"
                >
                  {s.name.charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-serif text-[1.5rem] leading-tight text-ink headline-link">{s.name}</span>
                <span className="block mt-1.5 font-serif italic text-[1.0625rem] leading-snug text-ink-2">
                  {sentenceCase(s.tagline)}
                </span>
                <span className="block mt-2.5 text-[0.8125rem] text-ink-3">
                  {s.hqCity} · Founded {s.foundingYear} · {stageLabel(s.stage)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Taglines are stored in Title Case ("Enterprise AI & Financial Crime Intelligence").
 * Lower-case ordinary words for a sentence-case read, keeping acronyms and
 * proper nouns that are written in capitals or mixed case.
 */
function sentenceCase(t: string) {
  const keep = new Set(['Saudi', 'Arabic', 'FinTech', 'AI', 'NLP', 'GCC', 'KSA']);
  return t
    .split(' ')
    .map((w, i) => {
      if (i === 0 || keep.has(w) || /[A-Z].*[A-Z]/.test(w) || !/^[A-Z][a-z]/.test(w)) return w;
      return w.toLowerCase();
    })
    .join(' ');
}
