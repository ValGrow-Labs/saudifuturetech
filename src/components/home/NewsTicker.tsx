import React from 'react';
import Link from 'next/link';

/** Slim newsroom ticker under the masthead. Pauses on hover; still for reduced motion. */
export function NewsTicker({ items }: { items: { title: string; href: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10">
      <div className="flex items-center rule-dot-b">
        <p className="shrink-0 flex items-center gap-2 pr-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-alert">
          <span className="h-1.5 w-1.5 rounded-full bg-alert live-dot" aria-hidden />
          Latest
        </p>
        <div className="ticker relative flex-1 overflow-hidden">
          <ul className="ticker-track flex w-max items-center gap-10 py-2.5 pl-4">
            {[...items, ...items].map((t, i) => (
              <li key={i} aria-hidden={i >= items.length} className="flex items-center gap-2.5 whitespace-nowrap text-[0.875rem]">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-clay">{t.label}</span>
                <Link
                  href={t.href}
                  tabIndex={i >= items.length ? -1 : undefined}
                  className="font-serif text-ink hover:text-clay transition-colors"
                >
                  {t.title}
                </Link>
                <span aria-hidden className="text-ink-4">·</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
