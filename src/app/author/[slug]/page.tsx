import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ArrowRight, BookOpen, Award, Layers } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { getAuthorBySlug, getArticlesByAuthor, getAllAuthorSlugs } from '@/lib/data';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
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
      title: `Author Not Found | ${DEFAULT_SEO.siteName}`,
      description: 'The requested editorial contributor profile could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${author.displayName} — Editorial Profile | ${DEFAULT_SEO.siteName}`;
  const description = author.bio || `${author.displayName} reports for ${DEFAULT_SEO.siteName}.`;
  const authorUrl = getCanonicalUrl(`/author/${author.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: authorUrl,
    },
    openGraph: {
      title,
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
      title,
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
    { label: 'Contributors', href: '/#about' },
    { label: author.displayName, current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body">
      {/* Schema.org Structured Data */}
      <AuthorProfileJsonLd author={author} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <MainContainer size="default">
          {/* Breadcrumbs */}
          <div className="pb-6 border-b border-editorial-hairline">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Author Masthead / Hero Card */}
          <div className="pt-4">
            <AuthorBioCard author={author} isProfileHeader={true} />
          </div>

          {/* Editorial Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-editorial-pure rounded-xs border border-editorial-hairline shadow-xs text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans flex items-center justify-center sm:justify-start gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
                Published Reports
              </span>
              <p className="text-xl sm:text-2xl font-serif font-black text-ink-high">
                {articles.length} Dispatches
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans flex items-center justify-center sm:justify-start gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-gold" />
                Editorial Standing
              </span>
              <p className="text-xl sm:text-2xl font-serif font-black text-ink-high">
                Senior Staff
              </p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-editorial-hairline">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans flex items-center justify-center sm:justify-start gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-gold" />
                Coverage Integrity
              </span>
              <p className="text-xs sm:text-sm text-ink-muted font-sans font-medium pt-1">
                Peer-reviewed technical analysis
              </p>
            </div>
          </div>

          {/* Author's Articles Stream */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-ink-high pb-2.5">
              <h2 className="text-xl font-serif font-bold text-ink-high">
                Articles &amp; Investigations by {author.displayName}
              </h2>
              <span className="text-xs text-ink-muted font-sans">
                {articles.length} Published
              </span>
            </div>

            {articles.length === 0 ? (
              <div className="p-12 text-center bg-editorial-pure rounded-xs border border-editorial-hairline space-y-3">
                <p className="text-base text-ink-high font-serif font-bold">
                  No published reports yet
                </p>
                <p className="text-xs text-ink-muted max-w-sm mx-auto font-sans">
                  This contributor’s upcoming research pieces are currently undergoing editorial review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="group bg-editorial-pure rounded-xs border border-editorial-hairline overflow-hidden hover:shadow-xs transition-editorial flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/9] w-full bg-editorial-stone overflow-hidden">
                        <Link href={`/article/${article.slug}`} className="block h-full w-full">
                          <Image
                            src={article.coverImageUrl}
                            alt={article.coverImageAlt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-[1.03] transition-editorial duration-500"
                          />
                        </Link>
                        <div className="absolute top-2.5 left-2.5">
                          <CategoryBadge category={article.category} size="sm" />
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted font-sans">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatReadingTime(article.readingTimeMinutes)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>

                        <h3 className="text-lg font-serif font-bold text-ink-high group-hover:text-brand-gold transition-editorial leading-snug line-clamp-2">
                          <Link href={`/article/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-ink-body font-sans leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-editorial-hairline mt-4 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-ink-muted font-sans">
                        Full Briefing
                      </span>

                      <Link
                        href={`/article/${article.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-high hover:text-brand-gold font-sans uppercase tracking-wider"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter Subscription */}
          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}
