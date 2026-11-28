import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { getAuthorBySlug, getArticlesByAuthor, getAllAuthorSlugs } from '@/lib/data';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { AuthorProfileJsonLd, BreadcrumbJsonLd } from '@/lib/seo/json-ld';

// Next.js ISR: Revalidate author profile every 60 seconds
export const revalidate = 60;

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllAuthorSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: 'Writer not found',
      description: 'We couldn’t find this writer.',
      robots: { index: false, follow: false },
    };
  }

  const title = author.displayName;
  const description = author.bio || `${author.displayName} reports for ${DEFAULT_SEO.siteName}.`;
  const authorUrl = getCanonicalUrl(`/author/${author.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: authorUrl,
    },
    openGraph: {
      title: `${author.displayName} | ${DEFAULT_SEO.siteName}`,
      description,
      type: 'profile',
      url: authorUrl,
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      images: author.avatarUrl
        ? [
            {
              url: author.avatarUrl,
              alt: author.displayName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.displayName} | ${DEFAULT_SEO.siteName}`,
      description,
      site: DEFAULT_SEO.social.twitter,
      images: author.avatarUrl ? [author.avatarUrl] : undefined,
    },
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const articles = await getArticlesByAuthor(author.slug);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Contributors', href: '/about' },
    { label: author.displayName, current: true },
  ];

  const firstName = author.displayName.split(' ')[0];

  // The sections this writer files for, most frequent first.
  const beats = Object.values(
    articles.reduce<Record<string, { name: string; slug: string; count: number }>>((acc, a) => {
      const entry = acc[a.category.slug] ?? { name: a.category.name, slug: a.category.slug, count: 0 };
      entry.count += 1;
      acc[a.category.slug] = entry;
      return acc;
    }, {}),
  ).sort((x, y) => y.count - x.count);

  return (
    <>
      <AuthorProfileJsonLd author={author} />
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
              <Link href="/about" className="hover:text-ink">
                Contributors
              </Link>
            </nav>

            <AuthorBioCard author={author} isProfileHeader className="mt-10 md:mt-14 pb-10 border-b border-rule" />
          </div>

          <section aria-labelledby="author-stories" className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
            <div className="lg:col-span-8">
              <div className="rule-dot-t pt-4 mb-2 flex items-end justify-between gap-4">
                <h2 id="author-stories" className="font-serif text-display-sm md:text-display-md text-ink">
                  Stories by {firstName}
                </h2>
                <p className="meta shrink-0 pb-1">
                  {articles.length} {articles.length === 1 ? 'story' : 'stories'}
                </p>
              </div>

              {articles.length === 0 ? (
                <div className="py-10">
                  <p className="font-serif text-[1.375rem] text-ink">{firstName} hasn’t published anything yet.</p>
                  <p className="mt-2 text-[0.9375rem] text-ink-3">
                    <Link href="/latest" className="text-ink link-rule">
                      Read the latest from the newsroom →
                    </Link>
                  </p>
                </div>
              ) : (
                <ul>
                  {articles.map((article) => (
                    <li key={article.id} className="group border-b border-rule">
                      <article className="grid grid-cols-[1fr_6.5rem] sm:grid-cols-[6.5rem_1fr_9rem] gap-x-6 gap-y-2 py-6">
                        <time dateTime={article.publishedAt} className="hidden sm:block meta pt-1">
                          {formatDate(article.publishedAt)}
                        </time>
                        <div className="min-w-0">
                          <CategoryBadge category={article.category} />
                          <h3 className="mt-1.5 font-serif text-[1.3125rem] leading-snug text-ink">
                            <Link href={`/article/${article.slug}`} className="headline-link">
                              {article.title}
                            </Link>
                          </h3>
                          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-2">{article.excerpt}</p>
                          <p className="meta mt-2">
                            <span className="sm:hidden">{formatDate(article.publishedAt)} · </span>
                            {formatReadingTime(article.readingTimeMinutes)}
                          </p>
                        </div>
                        {article.coverImageUrl && (
                          <Link
                            href={`/article/${article.slug}`}
                            tabIndex={-1}
                            aria-hidden
                            className="relative block aspect-square sm:aspect-[4/3] overflow-hidden rounded-md bg-paper-band self-start"
                          >
                            <Image src={article.coverImageUrl} alt="" fill sizes="144px" className="object-cover img-warm" />
                          </Link>
                        )}
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {beats.length > 0 && (
              <aside aria-label="Sections" className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
                <div className="lg:sticky lg:top-28 rule-dot-t pt-4 lg:border-t-0 lg:pt-0">
                  <p className="meta uppercase tracking-[0.04em]">Writes for</p>
                  <ul className="mt-3">
                    {beats.map((b) => (
                      <li key={b.slug} className="border-b border-rule">
                        <Link
                          href={`/category/${b.slug}`}
                          className="group flex items-baseline justify-between gap-4 py-3"
                        >
                          <span className="font-serif font-bold text-[1.1875rem] text-ink headline-link">{b.name}</span>
                          <span className="meta">{b.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </section>

          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
