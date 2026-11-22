import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { CategoryBadge } from '@/components/public/CategoryBadge';

interface Props {
  latest: ArticlePreview[];
  mostRead: { title: string; slug: string; category: string }[];
}

/** A dated stream on the left; the most-read ranking on the right. */
export function LatestAndMostRead({ latest, mostRead }: Props) {
  return (
    <section className="grid gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <div className="border-t-2 border-ink pt-4 mb-2 flex items-end justify-between">
          <h2 className="font-serif text-display-sm md:text-display-md text-ink">Latest</h2>
          <Link href="/latest" className="group inline-flex items-center gap-2 text-sm text-ink">
            <span className="link-rule">Everything we’ve published</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        <ul>
          {latest.map((a) => (
            <li key={a.id} className="group border-b border-rule">
              <article className="grid grid-cols-[1fr_6.5rem] sm:grid-cols-[6.5rem_1fr_9rem] gap-x-6 gap-y-2 py-6">
                <time dateTime={a.publishedAt} className="hidden sm:block meta pt-1">
                  {formatDate(a.publishedAt)}
                </time>
                <div className="min-w-0">
                  <CategoryBadge category={a.category} />
                  <h3 className="mt-1.5 font-serif text-[1.3125rem] leading-snug text-ink">
                    <Link href={`/article/${a.slug}`} className="headline-link">
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-2">{a.excerpt}</p>
                  <p className="meta mt-2 sm:hidden">
                    {formatDate(a.publishedAt)} · {formatReadingTime(a.readingTimeMinutes)}
                  </p>
                </div>
                {a.coverImageUrl && (
                  <Link href={`/article/${a.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-square sm:aspect-[4/3] overflow-hidden bg-paper-band self-start">
                    <Image src={a.coverImageUrl} alt="" fill sizes="144px" className="object-cover img-warm" />
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-4" aria-labelledby="most-read">
        <div className="lg:sticky lg:top-24">
          <div className="border-t-2 border-ink pt-4 mb-2">
            <h2 id="most-read" className="font-serif text-display-sm text-ink">
              Most read
            </h2>
            <p className="meta mt-1">Past seven days</p>
          </div>
          <ol>
            {mostRead.slice(0, 5).map((item, i) => (
              <li key={item.slug + i} className="group border-b border-rule">
                <Link href={`/article/${item.slug}`} className="grid grid-cols-[2.75rem_1fr] gap-3 py-5">
                  <span className="font-serif text-[2.25rem] leading-none text-clay tabular">{i + 1}</span>
                  <span>
                    <span className="block font-serif text-[1.125rem] leading-snug text-ink headline-link">{item.title}</span>
                    <span className="meta block mt-1.5">{item.category}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </section>
  );
}
