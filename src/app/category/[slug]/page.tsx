import React from 'react';
import { SECTION_NAMES_AR } from '@/lib/arabic';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import {
  getArticlesByCategory,
  getCategoryBySlug,
  getAllCategorySlugs,
  getAllCategories,
} from '@/lib/data';
import { formatDate, formatReadingTime } from '@/lib/utils';

// Next.js ISR: Revalidate category archive every 60 seconds
export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: `Section not found | ${DEFAULT_SEO.siteName}`,
      description: 'We couldn’t find this section.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} | ${DEFAULT_SEO.siteName}`;
  const description = category.description;
  const categoryUrl = getCanonicalUrl(`/category/${category.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: categoryUrl,
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: DEFAULT_SEO.social.twitter,
    },
  };
}

export default async function CategoryArchivePage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [articles, allCategories] = await Promise.all([
    getArticlesByCategory(category.slug),
    getAllCategories(),
  ]);

  const leadArticle = articles[0];
  const columnArticles = articles.slice(1, 4);
  const archiveArticles = articles.slice(4);
  const subtopics = category.tags || [];
  const otherCategories = allCategories.filter((c) => c.slug !== category.slug);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Sections', href: '/#sections-index' },
    { label: category.name, current: true },
  ];

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
              <Link href="/#sections-index" className="hover:text-ink">Sections</Link>
            </nav>

            {/* Section masthead */}
            <header className="mt-10 md:mt-14 grid gap-8 lg:grid-cols-12 lg:gap-x-10 lg:items-end pb-8 rule-dot-b">
              <div className="lg:col-span-8">
                <p className="kicker mb-3">Section</p>
                <h1 className="font-serif text-display-xl text-ink">{category.name}</h1>
                {SECTION_NAMES_AR[category.slug] && (
                  <p lang="ar" dir="rtl" className="mt-2 text-left font-sans text-[1.375rem] text-gold">
                    {SECTION_NAMES_AR[category.slug]}
                  </p>
                )}
                {category.description && (
                  <p className="mt-5 max-w-2xl font-serif text-[1.25rem] leading-snug text-ink-3">{category.description}</p>
                )}
              </div>
              <div className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
                <p className="meta">
                  {articles.length} {articles.length === 1 ? 'story' : 'stories'}
                  {leadArticle && (
                    <>
                      {' '}· latest <time dateTime={leadArticle.publishedAt}>{formatDate(leadArticle.publishedAt)}</time>
                    </>
                  )}
                </p>
                {subtopics.length > 0 && (
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
                    <span className="text-ink-3">Topics: </span>
                    {subtopics.map((tag, i) => (
                      <React.Fragment key={tag}>
                        <Link href={`/search?q=${encodeURIComponent(tag)}`} className="text-ink link-rule hover:text-clay">
                          {tag}
                        </Link>
                        {i < subtopics.length - 1 && <span className="text-ink-4">, </span>}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>
            </header>

            {articles.length === 0 ? (
              <div className="py-16 max-w-xl">
                <p className="font-serif text-display-sm text-ink">Nothing published in {category.name} yet.</p>
                <p className="mt-3 text-[0.9375rem] text-ink-3">
                  In the meantime,{' '}
                  <Link href="/latest" className="text-ink link-rule">
                    read the latest from every section →
                  </Link>
                </p>
              </div>
            ) : (
              <>
                {/* Front of the section: lead story + a ruled column */}
                <section
                  aria-label={`Top stories in ${category.name}`}
                  className="pt-8 grid gap-y-10 lg:grid-cols-12 lg:gap-x-10"
                >
                  {leadArticle && (
                    <article className={`group rise ${columnArticles.length ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                      <Link
                        href={`/article/${leadArticle.slug}`}
                        tabIndex={-1}
                        aria-hidden
                        className="relative block aspect-[16/10] lg:aspect-[16/9] overflow-hidden rounded-md bg-paper-band"
                      >
                        {leadArticle.coverImageUrl && (
                          <Image
                            src={leadArticle.coverImageUrl}
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 66vw"
                            className="object-cover img-warm transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                          />
                        )}
                      </Link>
                      <div className="mt-6 grid gap-5 md:grid-cols-[1fr_15rem]">
                        <h2 className="font-serif text-display-md text-ink">
                          <Link href={`/article/${leadArticle.slug}`} className="headline-link">
                            {leadArticle.title}
                          </Link>
                        </h2>
                        <div className="md:border-l md:border-rule md:pl-6">
                          <p className="font-serif text-lg italic leading-snug text-ink-2">{leadArticle.excerpt}</p>
                          <p className="meta mt-4">
                            <Link href={`/author/${leadArticle.author.slug}`} className="text-ink-2 hover:text-clay">
                              {leadArticle.author.displayName}
                            </Link>
                            <br />
                            <time dateTime={leadArticle.publishedAt}>{formatDate(leadArticle.publishedAt)}</time> ·{' '}
                            {formatReadingTime(leadArticle.readingTimeMinutes)}
                          </p>
                        </div>
                      </div>
                    </article>
                  )}

                  {columnArticles.length > 0 && (
                    <div className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
                      <ol className="border-t border-ink lg:border-t-0 divide-y divide-rule">
                        {columnArticles.map((article, i) => (
                          <li
                            key={article.id}
                            className="group py-6 lg:first:pt-0 rise"
                            style={{ animationDelay: `${80 + i * 60}ms` }}
                          >
                            {i === 0 && article.coverImageUrl && (
                              <Link
                                href={`/article/${article.slug}`}
                                tabIndex={-1}
                                aria-hidden
                                className="relative block aspect-[3/2] overflow-hidden rounded-md bg-paper-band mb-4"
                              >
                                <Image
                                  src={article.coverImageUrl}
                                  alt=""
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 30vw"
                                  className="object-cover img-warm"
                                />
                              </Link>
                            )}
                            <h3
                              className={`font-serif text-ink ${
                                i === 0 ? 'text-[1.5rem] leading-[1.18]' : 'text-[1.1875rem] leading-snug'
                              }`}
                            >
                              <Link href={`/article/${article.slug}`} className="headline-link">
                                {article.title}
                              </Link>
                            </h3>
                            {i === 0 && (
                              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-3">{article.excerpt}</p>
                            )}
                            <p className="meta mt-2.5">
                              {article.author.displayName} · {formatReadingTime(article.readingTimeMinutes)}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </section>

                {/* Everything older, as a dated ruled list */}
                {archiveArticles.length > 0 && (
                  <section aria-labelledby="section-archive" className="mt-20 md:mt-28 grid lg:grid-cols-12 lg:gap-x-10">
                    <div className="lg:col-span-8">
                      <div className="rule-dot-t pt-4 mb-2">
                        <h2 id="section-archive" className="font-serif text-display-sm md:text-display-md text-ink">
                          Earlier in {category.name}
                        </h2>
                      </div>
                      <ul>
                        {archiveArticles.map((article) => (
                          <li key={article.id} className="group border-b border-rule">
                            <article className="grid grid-cols-[1fr_6.5rem] sm:grid-cols-[6.5rem_1fr_9rem] gap-x-6 gap-y-2 py-6">
                              <time dateTime={article.publishedAt} className="hidden sm:block meta pt-1">
                                {formatDate(article.publishedAt)}
                              </time>
                              <div className="min-w-0">
                                <h3 className="font-serif text-[1.3125rem] leading-snug text-ink">
                                  <Link href={`/article/${article.slug}`} className="headline-link">
                                    {article.title}
                                  </Link>
                                </h3>
                                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3 line-clamp-2">
                                  {article.excerpt}
                                </p>
                                <p className="meta mt-2">
                                  {article.author.displayName}
                                  <span className="sm:hidden"> · {formatDate(article.publishedAt)}</span> ·{' '}
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
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Other sections, as an index */}
          {otherCategories.length > 0 && (
            <section aria-labelledby="other-sections">
              <div className="rule-dot-t pt-4 mb-2">
                <h2 id="other-sections" className="font-serif text-display-sm md:text-display-md text-ink">
                  Other sections
                </h2>
              </div>
              <ul className="grid md:grid-cols-2 md:gap-x-12">
                {otherCategories.map((cat) => (
                  <li key={cat.id} className="border-b border-rule">
                    <Link href={`/category/${cat.slug}`} className="group grid grid-cols-[1fr_auto] gap-4 items-baseline py-5">
                      <span className="min-w-0">
                        <span className="block font-serif font-bold text-[1.375rem] leading-tight text-ink headline-link">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="block mt-1 text-[0.875rem] leading-relaxed text-ink-3 line-clamp-1">
                            {cat.description}
                          </span>
                        )}
                      </span>
                      <span
                        aria-hidden
                        className="text-ink-4 transition-all duration-300 group-hover:text-clay group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
