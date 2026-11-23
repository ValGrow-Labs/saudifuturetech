import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { ReadingProgressBar } from '@/components/public/ReadingProgressBar';
import { SocialShareButtons } from '@/components/public/SocialShareButtons';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { RelatedArticles } from '@/components/public/RelatedArticles';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { getArticleBySlug, getRelatedArticles, getAllArticleSlugs } from '@/lib/data';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { NewsArticleJsonLd, BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import type { ArticleSection } from '@/types';

// Next.js ISR: Revalidate article every 60 seconds
export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: `Article not found | ${DEFAULT_SEO.siteName}`,
      description: 'We couldn’t find this story.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${article.seoTitle || article.title} | ${DEFAULT_SEO.siteName}`;
  const description = article.seoDescription || article.excerpt;
  const articleUrl = getCanonicalUrl(`/article/${article.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author.displayName],
      images: [
        {
          url: article.coverImageUrl,
          alt: article.coverImageAlt || article.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: DEFAULT_SEO.social.twitter,
      images: [article.coverImageUrl],
    },
  };
}

function sectionId(heading: string, idx: number) {
  const base = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `s${idx + 1}-${base}`;
}

/** One section of the body: heading, paragraphs and any inserts, in reading order. */
function BodySection({ section, idx }: { section: ArticleSection; idx: number }) {
  return (
    <section aria-labelledby={section.heading ? sectionId(section.heading, idx) : undefined}>
      {section.heading && (
        <h2
          id={sectionId(section.heading, idx)}
          className="scroll-mt-28 mt-14 mb-5 font-serif text-display-sm text-ink"
        >
          {section.heading}
        </h2>
      )}

      {section.subheading && (
        <p className="-mt-2 mb-5 font-serif italic text-[1.1875rem] leading-snug text-ink-3">{section.subheading}</p>
      )}

      {section.paragraphs.map((para, pIdx) => (
        <p key={pIdx} className={idx === 0 && pIdx === 0 ? 'drop-cap' : undefined}>
          {para}
        </p>
      ))}

      {section.pullQuote && (
        <figure className="my-10 border-l-2 border-clay pl-6 sm:pl-8">
          <blockquote>
            <p className="font-serif italic text-[1.625rem] sm:text-[2rem] leading-[1.22] tracking-[-0.01em] text-ink">
              “{section.pullQuote.quote}”
            </p>
          </blockquote>
          {section.pullQuote.attribution && (
            <figcaption className="meta mt-4 not-italic">— {section.pullQuote.attribution}</figcaption>
          )}
        </figure>
      )}

      {section.inlineImage && (
        <figure className="my-10">
          <div className="relative aspect-[3/2] overflow-hidden bg-paper-band">
            <Image
              src={section.inlineImage.url}
              alt={section.inlineImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 680px"
              className="object-cover img-warm"
            />
          </div>
          {section.inlineImage.caption && <figcaption className="meta mt-2">{section.inlineImage.caption}</figcaption>}
        </figure>
      )}

      {section.takeaway && (
        <aside className="my-10 border-t border-ink pt-3 font-sans">
          <p className="meta uppercase tracking-[0.04em] text-ink">The short version</p>
          <p className="mt-2 text-[1rem] leading-relaxed text-ink-2">{section.takeaway}</p>
        </aside>
      )}

      {section.codeBlock && (
        <figure className="my-10">
          <div className="flex items-baseline justify-between border-b border-rule pb-1.5">
            <span className="meta uppercase tracking-[0.04em]">{section.codeBlock.language}</span>
          </div>
          <pre className="overflow-x-auto bg-paper-sheet px-4 py-4 font-mono text-[0.8125rem] leading-relaxed text-ink-2">
            <code>{section.codeBlock.code}</code>
          </pre>
          {section.codeBlock.caption && <figcaption className="meta mt-2">{section.codeBlock.caption}</figcaption>}
        </figure>
      )}

      {section.table && (
        <div className="my-10 -mx-4 sm:mx-0 overflow-x-auto px-4 sm:px-0">
          <table className="w-full min-w-[30rem] border-collapse text-left font-sans text-[0.875rem] leading-snug">
            <thead>
              <tr className="border-b border-ink">
                {section.table.headers.map((h, hIdx) => (
                  <th key={hIdx} scope="col" className="meta uppercase tracking-[0.04em] py-2 pr-4 font-normal align-bottom">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-rule hover:bg-paper-sheet/60 transition-colors">
                  {row.map((cell, cIdx) =>
                    cIdx === 0 ? (
                      <th key={cIdx} scope="row" className="py-3 pr-4 font-medium text-ink align-top">
                        {cell}
                      </th>
                    ) : (
                      <td key={cIdx} className="py-3 pr-4 text-ink-2 align-top tabular">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.slug, article.category.slug, 3);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: article.category.name, href: `/category/${article.category.slug}` },
    { label: article.title, current: true },
  ];

  const contents = article.sections
    .map((s, idx) => (s.heading ? { id: sectionId(s.heading, idx), label: s.heading } : null))
    .filter((x): x is { id: string; label: string } => x !== null);

  const wasUpdated =
    article.updatedAt && formatDate(article.updatedAt) !== formatDate(article.publishedAt);

  return (
    <>
      <NewsArticleJsonLd article={article} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ReadingProgressBar />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-6 md:pt-8 pb-24">
          <nav aria-label="Breadcrumb" className="meta">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2 text-ink-4">/</span>
            <Link href={`/category/${article.category.slug}`} className="hover:text-ink">
              {article.category.name}
            </Link>
          </nav>

          <article>
            {/* Headline block */}
            <header className="mt-10 md:mt-14 grid lg:grid-cols-12 lg:gap-x-10">
              <div className="lg:col-span-10 xl:col-span-9 rise">
                <CategoryBadge category={article.category} size="md" />
                <h1 className="mt-4 font-serif text-display-lg text-ink">{article.title}</h1>
                <p className="standfirst mt-6 max-w-3xl">{article.excerpt}</p>
              </div>

              <div className="lg:col-span-12 mt-10 border-t border-rule pt-4 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="meta leading-relaxed">
                  By{' '}
                  <Link href={`/author/${article.author.slug}`} className="text-ink link-rule">
                    {article.author.displayName}
                  </Link>
                  {article.author.title && <span className="hidden md:inline">, {article.author.title}</span>}
                  <span className="mx-2 text-ink-4">·</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  <span className="mx-2 text-ink-4">·</span>
                  {formatReadingTime(article.readingTimeMinutes)}
                  {wasUpdated && article.updatedAt && (
                    <>
                      <span className="mx-2 text-ink-4">·</span>
                      Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
                    </>
                  )}
                </p>
                <SocialShareButtons title={article.title} className="lg:hidden" />
              </div>
            </header>

            {/* Lead image */}
            <figure className="mt-8">
              <div className="relative aspect-[3/2] md:aspect-[16/9] lg:aspect-[2/1] w-full overflow-hidden bg-paper-band">
                <Image
                  src={article.coverImageUrl}
                  alt={article.coverImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1344px) 100vw, 1344px"
                  className="object-cover img-warm"
                />
              </div>
              {(article.coverImageCaption || article.imageCredit) && (
                <figcaption className="mt-2.5 flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6 text-[0.8125rem] leading-snug text-ink-3">
                  {article.coverImageCaption && <span className="max-w-2xl">{article.coverImageCaption}</span>}
                  {article.imageCredit && <span className="meta shrink-0">{article.imageCredit}</span>}
                </figcaption>
              )}
            </figure>

            {/* Body */}
            <div className="mt-12 md:mt-16 grid lg:grid-cols-12 lg:gap-x-10">
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-28 space-y-10">
                  {contents.length > 1 && (
                    <nav aria-label="In this story" className="border-t-2 border-ink pt-3">
                      <p className="meta uppercase tracking-[0.04em]">In this story</p>
                      <ol className="mt-3">
                        {contents.map((c, i) => (
                          <li key={c.id} className="border-b border-rule">
                            <a
                              href={`#${c.id}`}
                              className="group grid grid-cols-[1.75rem_1fr] gap-2 py-2.5 text-[0.875rem] leading-snug text-ink-2 hover:text-clay transition-colors"
                            >
                              <span className="font-sans tabular text-[0.75rem] text-ink-4 pt-px">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span>{c.label}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                  <SocialShareButtons title={article.title} stacked />
                </div>
              </aside>

              <div className="lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-5">
                <div className="prose-sft max-w-measure text-[1.125rem] sm:text-[1.1875rem]">
                  {article.sections.map((section, idx) => (
                    <BodySection key={idx} section={section} idx={idx} />
                  ))}
                </div>

                <div className="max-w-measure">
                  <p aria-hidden className="mt-10 font-serif text-clay text-lg">■</p>

                  {article.tags.length > 0 && (
                    <div className="mt-10 border-t border-rule pt-4">
                      <p className="meta uppercase tracking-[0.04em]">Filed under</p>
                      <ul className="mt-2 flex flex-wrap gap-x-1 gap-y-1 text-[0.9375rem] text-ink">
                        {article.tags.map((tag, i) => (
                          <li key={tag}>
                            <Link href={`/search?q=${encodeURIComponent(tag)}`} className="link-rule hover:text-clay">
                              {tag}
                            </Link>
                            {i < article.tags.length - 1 && <span className="text-ink-4">,</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <AuthorBioCard author={article.author} className="mt-12" />
                </div>
              </div>
            </div>
          </article>

          <div className="mt-24 md:mt-28 space-y-20 md:space-y-28">
            <RelatedArticles
              articles={relatedArticles}
              categoryName={article.category.name}
              categorySlug={article.category.slug}
            />
            <NewsletterBanner />
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
