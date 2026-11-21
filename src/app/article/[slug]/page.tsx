import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, Calendar } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { ReadingProgressBar } from '@/components/public/ReadingProgressBar';
import { SocialShareButtons } from '@/components/public/SocialShareButtons';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { RelatedArticles } from '@/components/public/RelatedArticles';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getArticleBySlug, getRelatedArticles, getAllArticleSlugs } from '@/lib/data';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { NewsArticleJsonLd, BreadcrumbJsonLd } from '@/lib/seo/json-ld';

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
      title: `Article Not Found | ${DEFAULT_SEO.siteName}`,
      description: 'The requested technology report could not be found.',
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111827]">
      {/* Schema.org Structured Data */}
      <NewsArticleJsonLd article={article} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Sticky Top Reading Progress Indicator */}
      <ReadingProgressBar />

      {/* Global Header */}
      <SiteHeader />

      {/* Main Reading Canvas */}
      <main className="flex-1 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <MainContainer size="default">
          {/* Breadcrumb Trail */}
          <div className="pb-6 border-b border-[#E2E8E4]">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Article Header Canvas */}
          <header className="max-w-3xl mx-auto pt-8 pb-6 space-y-5">
            {/* Category Pill & Reading Time */}
            <div className="flex items-center gap-3">
              <CategoryBadge category={article.category} size="md" />
              <span className="text-xs text-[#4B5563] flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                {formatReadingTime(article.readingTimeMinutes)}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-black text-[#111827] tracking-tight leading-[1.14]">
              {article.title}
            </h1>

            {/* Standfirst Excerpt */}
            <p className="text-lg sm:text-2xl text-[#111827] font-serif italic leading-relaxed pt-1">
              {article.excerpt}
            </p>

            {/* Byline & Sharing Bar */}
            <div className="pt-6 border-t border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Author Info */}
              <div className="flex items-center gap-3.5">
                {article.author.avatarUrl && (
                  <Link
                    href={`/author/${article.author.slug}`}
                    className="relative w-11 h-11 rounded-full overflow-hidden bg-[#F1F5F2] border border-[#E2E8E4] shrink-0 hover:border-[#0B6E4F] transition-colors"
                  >
                    <Image
                      src={article.author.avatarUrl}
                      alt={article.author.displayName}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </Link>
                )}

                <div>
                  <Link
                    href={`/author/${article.author.slug}`}
                    className="text-xs sm:text-sm font-bold text-[#111827] hover:text-[#0B6E4F] transition-colors font-sans block"
                  >
                    {article.author.displayName}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-[#4B5563] font-sans mt-0.5">
                    <span>{article.author.title}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4B5563]" />
                      {formatDate(article.publishedAt)}
                    </span>
                    {article.updatedAt && (
                      <>
                        <span>•</span>
                        <span className="text-[#C9A227] font-medium">Updated {formatDate(article.updatedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Sharing Controls */}
              <SocialShareButtons title={article.title} />
            </div>
          </header>

          {/* Hero Photography in Reading Canvas */}
          <figure className="max-w-4xl mx-auto my-8 space-y-2">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F1F5F2] rounded-md border border-[#E2E8E4]">
              <Image
                src={article.coverImageUrl}
                alt={article.coverImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
            {article.coverImageCaption && (
              <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#4B5563] font-sans px-1 gap-1">
                <span>{article.coverImageCaption}</span>
                {article.imageCredit && <span className="text-[#4B5563]/80">{article.imageCredit}</span>}
              </figcaption>
            )}
          </figure>

          {/* Long-Form Article Body Canvas (65-75 chars per line) */}
          <div className="max-w-3xl mx-auto space-y-8 font-serif text-[#111827] text-lg sm:text-xl leading-[1.8] pt-2">
            {article.sections.map((section, idx) => (
              <section key={idx} className="space-y-6">
                {section.heading && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#111827] pt-6 tracking-tight">
                    {section.heading}
                  </h2>
                )}

                {section.subheading && (
                  <h3 className="text-base sm:text-lg font-bold text-[#0B6E4F] font-sans tracking-wider uppercase">
                    {section.subheading}
                  </h3>
                )}

                {section.paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    className={`leading-[1.8] ${idx === 0 && pIdx === 0 ? 'drop-cap' : ''}`}
                  >
                    {para}
                  </p>
                ))}

                {/* Editorial Pull Quote */}
                {section.pullQuote && (
                  <blockquote className="my-8 p-6 sm:p-8 bg-[#F1F5F2] rounded-md border-l-4 border-[#C9A227] space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-[#111827] font-serif italic leading-snug">
                      &ldquo;{section.pullQuote.quote}&rdquo;
                    </p>
                    {section.pullQuote.attribution && (
                      <cite className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] font-sans not-italic pt-1">
                        — {section.pullQuote.attribution}
                      </cite>
                    )}
                  </blockquote>
                )}

                {/* Technical Key Takeaway Box */}
                {section.takeaway && (
                  <div className="my-6 p-5 sm:p-6 bg-white rounded-md border border-[#E2E8E4] space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227] font-sans block">
                      Architectural Takeaway
                    </span>
                    <p className="text-sm sm:text-base text-[#111827] leading-relaxed font-sans font-medium">
                      {section.takeaway}
                    </p>
                  </div>
                )}

                {/* Technical Comparison Table */}
                {section.table && (
                  <div className="my-8 overflow-x-auto bg-white rounded-md border border-[#E2E8E4] shadow-xs">
                    <table className="w-full text-left text-xs sm:text-sm text-[#111827] font-sans">
                      <thead className="bg-[#F1F5F2] text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E2E8E4]">
                        <tr>
                          {section.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8E4]">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#F1F5F2]/50 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-4 py-3.5 ${
                                  cIdx === 0 ? 'font-bold text-[#111827] font-sans' : 'font-mono text-xs'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {/* Topic Taxonomy Tags */}
            <div className="pt-8 mt-12 border-t border-[#E2E8E4]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] font-sans block mb-3">
                Related Topics & Taxonomy:
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs font-sans px-3 py-1.5 rounded-md bg-[#F1F5F2] border border-[#E2E8E4] text-[#111827] hover:border-[#0B6E4F] hover:text-[#0B6E4F] transition-colors font-medium"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Biography Card */}
            <div className="pt-8">
              <AuthorBioCard author={article.author} />
            </div>
          </div>

          {/* Related Articles Section */}
          <div className="pt-12">
            <RelatedArticles
              articles={relatedArticles}
              categoryName={article.category.name}
              categorySlug={article.category.slug}
            />
          </div>

          {/* Weekly Dispatch Capture */}
          <NewsletterBanner />
        </MainContainer>
      </main>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

