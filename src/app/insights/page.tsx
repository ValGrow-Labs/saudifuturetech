import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { getAllPublishedArticles, getAllCategories } from '@/lib/data';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl } from '@/lib/seo/config';
import { formatDate, formatReadingTime } from '@/lib/utils';

export const revalidate = 60;

const canonicalUrl = getCanonicalUrl('/insights');

export const metadata: Metadata = {
  title: 'Analysis | Saudi Future Tech',
  description:
    'Longer pieces on regulation, infrastructure and markets for people building technology companies in Saudi Arabia.',
  alternates: {
    canonical: canonicalUrl,
  },
};

export default async function InsightsPage() {
  const [articles, categories] = await Promise.all([getAllPublishedArticles(), getAllCategories()]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Analysis', current: true },
  ];

  const [lead, ...rest] = articles;
  const seconds = rest.slice(0, 2);
  const remaining = rest.slice(2);

  // Everything after the top three, filed under its section.
  const bySection = categories
    .map((cat) => ({ cat, items: remaining.filter((a) => a.category.slug === cat.slug) }))
    .filter((g) => g.items.length > 0);
  const filed = new Set(bySection.flatMap((g) => g.items.map((a) => a.id)));
  const unfiled = remaining.filter((a) => !filed.has(a.id));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-6 md:pt-8 pb-24 space-y-20 md:space-y-28">
          <div>
            <nav aria-label="Breadcrumb" className="meta">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              <span className="mx-2 text-ink-4">/</span>
              <span>Analysis</span>
            </nav>

            <header className="mt-10 md:mt-14 pb-8 rule-dot-b grid gap-6 lg:grid-cols-12 lg:gap-x-10 lg:items-end">
              <div className="lg:col-span-8">
                <p className="kicker mb-3">For founders and operators</p>
                <h1 className="font-serif text-display-lg text-ink">Analysis</h1>
                <p className="mt-5 max-w-2xl font-serif text-[1.25rem] leading-snug text-ink-3">
                  Longer pieces on the rules, infrastructure and money that shape building a technology company in
                  Saudi Arabia.
                </p>
              </div>
              <p className="meta lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
                {articles.length} {articles.length === 1 ? 'piece' : 'pieces'}
              </p>
            </header>

            {!lead ? (
              <div className="py-16 max-w-xl">
                <p className="font-serif text-display-sm text-ink">No analysis published yet.</p>
                <Link href="/latest" className="group mt-4 inline-flex items-center gap-2 text-sm text-ink">
                  <span className="link-rule">Read the latest news</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : (
              <section aria-label="Top analysis" className="pt-8 grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
                <article className={`group rise ${seconds.length ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                  <Link
                    href={`/article/${lead.slug}`}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-md bg-paper-band"
                  >
                    {lead.coverImageUrl && (
                      <Image
                        src={lead.coverImageUrl}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover img-warm transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                      />
                    )}
                  </Link>
                  <div className="mt-6">
                    <CategoryBadge category={lead.category} size="md" />
                    <h2 className="mt-3 font-serif text-display-md text-ink">
                      <Link href={`/article/${lead.slug}`} className="headline-link">
                        {lead.title}
                      </Link>
                    </h2>
                    <p className="mt-4 max-w-2xl font-serif text-lg italic leading-snug text-ink-2">{lead.excerpt}</p>
                    <p className="meta mt-4">
                      <span className="text-ink-2">{lead.author?.displayName}</span> ·{' '}
                      <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time> ·{' '}
                      {formatReadingTime(lead.readingTimeMinutes)}
                    </p>
                  </div>
                </article>

                {seconds.length > 0 && (
                  <div className="lg:col-span-5 lg:border-l lg:border-rule lg:pl-10 divide-y divide-rule border-t border-ink lg:border-t-0">
                    {seconds.map((a, i) => (
                      <article
                        key={a.id}
                        className="group py-8 lg:first:pt-0 rise"
                        style={{ animationDelay: `${80 + i * 60}ms` }}
                      >
                        {a.coverImageUrl && (
                          <Link
                            href={`/article/${a.slug}`}
                            tabIndex={-1}
                            aria-hidden
                            className="relative block aspect-[16/9] overflow-hidden rounded-md bg-paper-band mb-4"
                          >
                            <Image
                              src={a.coverImageUrl}
                              alt=""
                              fill
                              sizes="(max-width: 1024px) 100vw, 40vw"
                              className="object-cover img-warm"
                            />
                          </Link>
                        )}
                        <CategoryBadge category={a.category} />
                        <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.18] text-ink">
                          <Link href={`/article/${a.slug}`} className="headline-link">
                            {a.title}
                          </Link>
                        </h3>
                        <p className="meta mt-3">
                          {a.author?.displayName} · {formatReadingTime(a.readingTimeMinutes)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {(bySection.length > 0 || unfiled.length > 0) && (
            <section aria-labelledby="by-section">
              <div className="rule-dot-t pt-4 mb-2">
                <h2 id="by-section" className="font-serif text-display-sm md:text-display-md text-ink">
                  By section
                </h2>
              </div>

              <div>
                {[...bySection, ...(unfiled.length ? [{ cat: null, items: unfiled }] : [])].map(({ cat, items }) => (
                  <div
                    key={cat?.slug ?? 'other'}
                    className="grid gap-y-2 lg:grid-cols-12 lg:gap-x-10 border-b border-rule py-6 lg:py-8"
                  >
                    <div className="lg:col-span-3">
                      {cat ? (
                        <Link href={`/category/${cat.slug}`} className="group inline-flex items-baseline gap-2">
                          <span className="font-serif font-bold text-[1.375rem] leading-tight text-ink headline-link">{cat.name}</span>
                          <span aria-hidden className="text-ink-4 transition-all duration-300 group-hover:text-clay group-hover:translate-x-0.5">
                            →
                          </span>
                        </Link>
                      ) : (
                        <span className="font-serif text-[1.375rem] leading-tight text-ink">Other</span>
                      )}
                    </div>
                    <ul className="lg:col-span-9 divide-y divide-rule">
                      {items.map((a) => (
                        <li key={a.id} className="group py-3 first:pt-0 last:pb-0">
                          <article className="grid sm:grid-cols-[1fr_auto] gap-x-8 gap-y-1 sm:items-baseline">
                            <h3 className="font-serif text-[1.1875rem] leading-snug text-ink">
                              <Link href={`/article/${a.slug}`} className="headline-link">
                                {a.title}
                              </Link>
                            </h3>
                            <p className="meta whitespace-nowrap">
                              {a.author?.displayName} · {formatReadingTime(a.readingTimeMinutes)}
                            </p>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
