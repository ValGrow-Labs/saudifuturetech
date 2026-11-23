import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { CategoryBadge } from '@/components/public/CategoryBadge';

interface FrontPageProps {
  lead: ArticlePreview;
  secondary: ArticlePreview[];
}

/**
 * The top of the front page: one lead story given real weight, and a
 * column of the next stories separated by hairlines. Asymmetric on purpose.
 */
export function FrontPage({ lead, secondary }: FrontPageProps) {
  const [second, ...rest] = secondary;

  return (
    <section aria-labelledby="lead-story" className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
      {/* Lead */}
      <article className="group lg:col-span-8 rise">
        <Link href={`/article/${lead.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] lg:aspect-[2/1] overflow-hidden rounded-md bg-paper-band">
          {lead.coverImageUrl && (
            <Image
              src={lead.coverImageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover img-warm transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
            />
          )}
        </Link>
        {lead.coverImageCaption && <p className="meta mt-2">{lead.coverImageCaption}</p>}

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_15rem]">
          <div>
            <CategoryBadge category={lead.category} size="md" />
            <h2 id="lead-story" className="mt-3 font-serif text-display-lg text-ink">
              <Link href={`/article/${lead.slug}`} className="headline-link">
                {lead.title}
              </Link>
            </h2>
          </div>
          <div className="md:pt-8 md:border-l md:border-rule md:pl-6">
            <p className="font-serif text-lg leading-snug text-ink-2 italic">{lead.excerpt}</p>
            <p className="meta mt-4">
              <span className="text-ink-2">{lead.author.displayName}</span>
              <br />
              <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time> ·{' '}
              {formatReadingTime(lead.readingTimeMinutes)}
            </p>
          </div>
        </div>
      </article>

      {/* Second column */}
      <div className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10 flex flex-col">
        {second && (
          <article className="group pb-6 border-b border-rule rise" style={{ animationDelay: '80ms' }}>
            {second.coverImageUrl && (
              <Link href={`/article/${second.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[3/2] overflow-hidden rounded-md bg-paper-band mb-4">
                <Image src={second.coverImageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover img-warm" />
              </Link>
            )}
            <CategoryBadge category={second.category} />
            <h2 className="mt-2 font-serif text-[1.625rem] leading-[1.15] text-ink">
              <Link href={`/article/${second.slug}`} className="headline-link">
                {second.title}
              </Link>
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-3">{second.excerpt}</p>
          </article>
        )}

        <ol className="divide-y divide-rule">
          {rest.slice(0, 3).map((a, i) => (
            <li key={a.id} className="group py-5 rise" style={{ animationDelay: `${140 + i * 60}ms` }}>
              <CategoryBadge category={a.category} />
              <h3 className="mt-1.5 font-serif text-[1.1875rem] leading-snug text-ink">
                <Link href={`/article/${a.slug}`} className="headline-link">
                  {a.title}
                </Link>
              </h3>
              <p className="meta mt-2">{formatReadingTime(a.readingTimeMinutes)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
