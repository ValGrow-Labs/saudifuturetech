import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from '@/types';
import { formatReadingTime } from '@/lib/utils';

interface FrontlineStoriesProps {
  articles: ArticlePreview[];
}

function formatDateShort(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d);
  } catch {
    return 'Recent';
  }
}

export function FrontlineStories({ articles }: FrontlineStoriesProps) {
  const items = articles.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section aria-label="Frontline stories" className="pt-2 pb-6 border-b border-rule/60">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((art) => (
          <article key={art.id} className="group space-y-3">
            {art.coverImageUrl && (
              <Link
                href={`/article/${art.slug}`}
                tabIndex={-1}
                aria-hidden
                className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-paper-band shadow-xs"
              >
                <Image
                  src={art.coverImageUrl}
                  alt={art.coverImageAlt || art.coverImageCaption || ''}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </Link>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#11603F]">
                <span>{art.category.name}</span>
                <span className="text-ink-4">·</span>
                <span className="text-ink-3 font-medium">Saudi Arabia</span>
              </div>

              <h3 className="font-serif font-bold text-base leading-snug text-ink group-hover:text-clay transition-colors line-clamp-2">
                <Link href={`/article/${art.slug}`}>{art.title}</Link>
              </h3>

              <div className="text-[11px] text-ink-3">
                {formatDateShort(art.publishedAt)} · {formatReadingTime(art.readingTimeMinutes)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FrontlineStories;
