import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import { formatReadingTime } from '@/lib/utils';
import { CategoryBadge } from '@/components/public/CategoryBadge';

interface NewspaperFrontProps {
  lead: ArticlePreview;
  /** The right-hand column: first item gets a photo, the rest are headlines. */
  side: ArticlePreview[];
  /** "The Kingdom at a Glance" briefs. */
  glance: ArticlePreview[];
  /** Two more stories set under the lead photograph. */
  belowLead?: ArticlePreview[];
}

function firstSentence(text: string, max = 120) {
  const s = (text || '').split(/(?<=[.!?])\s/)[0] ?? '';
  return s.length > max ? s.slice(0, max).replace(/\s+\S*$/, '') + '…' : s;
}

function updatedLine() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh',
  }).format(new Date());
}

/**
 * A broadsheet front page: briefs on the left, the lead story centred,
 * a second story and headlines on the right, divided by dotted rules.
 */
export function NewspaperFront({ lead, side, glance, belowLead = [] }: NewspaperFrontProps) {
  const [second, ...more] = side;

  return (
    <section aria-label="Front page" className="grid gap-y-10 lg:grid-cols-12">
      {/* ---------- Left: The Kingdom at a Glance ---------- */}
      <aside className="lg:col-span-3 lg:pr-8 order-2 lg:order-1" aria-labelledby="glance">
        <h2 id="glance" className="font-serif text-[2rem] leading-[1.05] font-bold text-ink">
          The Kingdom at a Glance
        </h2>
        <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-ink-3" suppressHydrationWarning>
          <span className="h-2 w-2 rounded-full bg-alert live-dot" aria-hidden />
          Updated {updatedLine()} Riyadh
        </p>
        <ol className="mt-6 space-y-4">
          {glance.slice(0, 5).map((a, i) => (
            <li key={a.id} className="grid grid-cols-[1.25rem_1fr] gap-2">
              <span className="font-serif text-[1.125rem] leading-snug text-ink">{i + 1}</span>
              <p className="font-serif text-[1.0625rem] leading-snug text-ink-2">
                <Link
                  href={`/article/${a.slug}`}
                  prefetch={false}
                  className="font-bold text-ink underline decoration-1 underline-offset-[3px] hover:text-clay"
                >
                  {a.title},
                </Link>{' '}
                {firstSentence(a.excerpt, 80)}
              </p>
            </li>
          ))}
        </ol>
      </aside>

      {/* ---------- Centre: lead story ---------- */}
      <article className="group lg:col-span-6 lg:px-8 lg:rule-dot-l lg:rule-dot-r order-1 lg:order-2">
        <div className="text-center">
          <CategoryBadge category={lead.category} />
          <h2 className="mt-3 font-serif font-bold text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] leading-[1.06] tracking-[-0.015em] text-ink">
            <Link href={`/article/${lead.slug}`} prefetch={false} className="headline-link">
              {lead.title}
            </Link>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-[1.3125rem] leading-snug text-ink-2">{lead.excerpt}</p>
          <p className="mt-4 text-[0.8125rem] text-ink-3">
            By <span className="font-semibold text-ink-2">{lead.author.displayName}</span> ·{' '}
            {formatReadingTime(lead.readingTimeMinutes)}
          </p>
        </div>
        {lead.coverImageUrl && (
          <figure className="mt-6">
            <Link href={`/article/${lead.slug}`} prefetch={false} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden rounded-md bg-paper-band">
              <Image
                src={lead.coverImageUrl}
                alt={lead.coverImageAlt || lead.coverImageCaption || ''}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover img-warm transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
              />
            </Link>
            {lead.coverImageCaption && (
              <figcaption className="mt-2 text-[0.8125rem] text-ink-3">{lead.coverImageCaption}</figcaption>
            )}
          </figure>
        )}
        {belowLead.length > 0 && (
          <div className="mt-6 pt-5 rule-dot-t grid gap-6 sm:grid-cols-2">
            {belowLead.map((a, i) => (
              <div key={a.id} className={i > 0 ? 'sm:pl-6 sm:rule-dot-l' : ''}>
                <CategoryBadge category={a.category} className="!text-[0.6875rem]" />
                <h3 className="mt-1.5 font-serif font-bold text-[1.25rem] leading-snug text-ink">
                  <Link href={`/article/${a.slug}`} prefetch={false} className="headline-link">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-2 font-serif text-[0.9375rem] leading-snug text-ink-3">{firstSentence(a.excerpt, 110)}</p>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* ---------- Right: second story + headlines ---------- */}
      <div className="lg:col-span-3 lg:pl-8 order-3">
        {second && (
          <article className="group pb-6 rule-dot-b">
            <h2 className="font-serif font-bold text-[1.75rem] leading-[1.1] text-ink">
              <Link href={`/article/${second.slug}`} prefetch={false} className="headline-link">
                {second.title}
              </Link>
            </h2>
            <p className="mt-3 font-serif text-[1.0625rem] leading-snug text-ink-2">{firstSentence(second.excerpt, 160)}</p>
            {second.coverImageUrl && (
              <Link href={`/article/${second.slug}`} prefetch={false} tabIndex={-1} aria-hidden className="relative mt-4 block aspect-[4/3] overflow-hidden rounded-md bg-paper-band">
                <Image
                  src={second.coverImageUrl}
                  alt={second.coverImageAlt || second.coverImageCaption || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="object-cover img-warm"
                />
              </Link>
            )}
          </article>
        )}
        <ul>
          {more.slice(0, 3).map((a) => (
            <li key={a.id} className="group rule-dot-b py-4 grid grid-cols-[1fr_4.5rem] gap-3 items-start">
              <div className="min-w-0">
                <CategoryBadge category={a.category} className="!text-[0.6875rem]" />
                <h3 className="mt-1 font-serif font-bold text-[1.0625rem] leading-snug text-ink">
                  <Link href={`/article/${a.slug}`} prefetch={false} className="headline-link">
                    {a.title}
                  </Link>
                </h3>
              </div>
              {a.coverImageUrl && (
                <Link href={`/article/${a.slug}`} prefetch={false} tabIndex={-1} aria-hidden className="relative block aspect-square overflow-hidden rounded-md bg-paper-band">
                  <Image
                    src={a.coverImageUrl}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover img-warm"
                  />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
