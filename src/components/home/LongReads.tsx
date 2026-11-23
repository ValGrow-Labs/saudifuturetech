import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import { formatReadingTime } from '@/lib/utils';
import { CategoryBadge } from '@/components/public/CategoryBadge';

/** Editors' long reads: one wide feature with the image beside it, then a run of text-only picks. */
export function LongReads({ articles }: { articles: ArticlePreview[] }) {
  if (!articles.length) return null;
  const [feature, ...others] = articles;

  return (
    <section aria-labelledby="long-reads">
      <div className="border-t-2 border-ink pt-4 mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="kicker mb-2">Chosen by the editors</p>
          <h2 id="long-reads" className="font-serif text-display-md text-ink">
            Long reads
          </h2>
        </div>
        <Link href="/insights" className="group hidden sm:inline-flex items-center gap-2 text-sm text-ink">
          <span className="link-rule">All analysis</span>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <article className="group grid gap-8 md:grid-cols-12 md:items-center pb-10 border-b border-rule">
        <Link
          href={`/article/${feature.slug}`}
          tabIndex={-1}
          aria-hidden
          className="relative block md:col-span-7 aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-paper-band"
        >
          {feature.coverImageUrl && (
            <Image src={feature.coverImageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover img-warm transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]" />
          )}
        </Link>
        <div className="md:col-span-5">
          <CategoryBadge category={feature.category} />
          <h3 className="mt-3 font-serif text-display-md text-ink">
            <Link href={`/article/${feature.slug}`} className="headline-link">
              {feature.title}
            </Link>
          </h3>
          <p className="mt-4 font-serif text-lg italic leading-snug text-ink-2">{feature.excerpt}</p>
          <p className="meta mt-5">
            <span className="text-ink-2">{feature.author.displayName}</span> · {formatReadingTime(feature.readingTimeMinutes)}
          </p>
        </div>
      </article>

      {others.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
          {others.slice(0, 3).map((a) => (
            <article key={a.id} className="group py-6 border-b border-rule lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:pl-10 lg:[&:not(:first-child)]:-ml-0">
              <CategoryBadge category={a.category} />
              <h3 className="mt-2 font-serif text-[1.3125rem] leading-snug text-ink">
                <Link href={`/article/${a.slug}`} className="headline-link">
                  {a.title}
                </Link>
              </h3>
              <p className="meta mt-3">
                {a.author.displayName} · {formatReadingTime(a.readingTimeMinutes)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
