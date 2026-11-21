import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Calendar, Hash, Layers } from 'lucide-react';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { SITE_NAME } from '@/lib/constants';
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
      title: `Category Not Found | ${DEFAULT_SEO.siteName}`,
      description: 'The requested technology category archive could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} — Editorial Archive | ${DEFAULT_SEO.siteName}`;
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
  const subsequentArticles = articles.slice(1);
  const subtopics = category.tags || [];
  const otherCategories = allCategories.filter((c) => c.slug !== category.slug);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/#pillars' },
    { label: category.name, current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body">
      {/* Schema.org Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main className="flex-1 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <MainContainer size="default">
          {/* Breadcrumb Navigation */}
          <div className="pb-6 border-b border-editorial-hairline">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Category Masthead */}
          <header className="pt-6 pb-10 border-b border-editorial-hairline space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: category.color || '#D49A3D' }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted font-sans">
                    Editorial Pillar Archive
                  </span>
                  <span className="text-xs text-editorial-hairline">•</span>
                  <span className="text-xs text-ink-muted font-sans font-medium">
                    {articles.length} In-Depth {articles.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-ink-high tracking-tight leading-tight">
                  {category.name}
                </h1>

                <p className="text-base sm:text-lg text-ink-body font-sans leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Subtopics / Beats */}
              <div className="bg-editorial-sand p-4 sm:p-5 rounded-xs border border-editorial-hairline shrink-0 md:max-w-xs w-full space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-brand-gold" />
                  Key Focus Beats
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subtopics.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-[11px] font-sans px-2.5 py-1 rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-high hover:border-ink-high transition-editorial"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Category Content Area */}
          {articles.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-editorial-pure rounded-xs border border-editorial-hairline p-8 my-8">
              <Layers className="w-10 h-10 text-ink-muted mx-auto" />
              <h2 className="text-xl font-serif font-bold text-ink-high">
                Coverage in Preparation
              </h2>
              <p className="text-sm text-ink-muted max-w-md mx-auto font-sans">
                Our editorial team is finalizing comprehensive analyses for this pillar. Check back shortly for investigative dispatches.
              </p>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16 pt-4">
              {/* Lead Feature Article */}
              {leadArticle && (
                <article className="group bg-editorial-pure rounded-xs border border-editorial-hairline overflow-hidden hover:shadow-xs transition-editorial">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Visual Canvas */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:col-span-7 bg-editorial-stone min-h-[300px]">
                      <Link href={`/article/${leadArticle.slug}`} className="block h-full w-full">
                        <Image
                          src={leadArticle.coverImageUrl}
                          alt={leadArticle.coverImageAlt}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 65vw"
                          className="object-cover group-hover:scale-[1.02] transition-editorial duration-500"
                        />
                      </Link>
                      <div className="absolute top-4 left-4">
                        <CategoryBadge category={leadArticle.category} size="md" />
                      </div>
                    </div>

                    {/* Text Editorial Canvas */}
                    <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between space-y-6 bg-editorial-pure">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs text-ink-muted font-sans">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatReadingTime(leadArticle.readingTimeMinutes)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(leadArticle.publishedAt)}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink-high group-hover:text-brand-gold transition-editorial leading-snug">
                          <Link href={`/article/${leadArticle.slug}`}>
                            {leadArticle.title}
                          </Link>
                        </h2>

                        <p className="text-sm sm:text-base text-ink-body font-sans leading-relaxed line-clamp-4">
                          {leadArticle.excerpt}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-editorial-hairline flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {leadArticle.author.avatarUrl && (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-editorial-sand border border-editorial-hairline shrink-0">
                              <Image
                                src={leadArticle.author.avatarUrl}
                                alt={leadArticle.author.displayName}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/author/${leadArticle.author.slug}`}
                              className="text-xs font-bold text-ink-high font-sans hover:text-brand-gold transition-editorial block"
                            >
                              {leadArticle.author.displayName}
                            </Link>
                            <span className="text-[11px] text-ink-muted font-sans block">
                              {leadArticle.author.title}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/article/${leadArticle.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-high hover:text-brand-gold font-sans uppercase tracking-wider"
                          aria-label={`Read full report: ${leadArticle.title}`}
                        >
                          <span>Read Report</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-editorial" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* Subsequent Stories Grid */}
              {subsequentArticles.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-ink-high pb-2.5">
                    <h3 className="text-xl font-serif font-bold text-ink-high">
                      Further Reporting in {category.name}
                    </h3>
                    <span className="text-xs text-ink-muted font-sans">
                      {subsequentArticles.length} {subsequentArticles.length === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subsequentArticles.map((article) => (
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
                                <Clock className="w-3 h-3" />
                                {formatReadingTime(article.readingTimeMinutes)}
                              </span>
                              <span>•</span>
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>

                            <h4 className="text-lg font-serif font-bold text-ink-high group-hover:text-brand-gold transition-editorial leading-snug line-clamp-2">
                              <Link href={`/article/${article.slug}`}>
                                {article.title}
                              </Link>
                            </h4>

                            <p className="text-xs sm:text-sm text-ink-body font-sans leading-relaxed line-clamp-3">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-editorial-hairline mt-4 flex items-center justify-between text-xs">
                          <Link
                            href={`/author/${article.author.slug}`}
                            className="text-xs text-ink-muted hover:text-ink-high transition-editorial font-sans"
                          >
                            By <span className="font-semibold text-ink-high">{article.author.displayName}</span>
                          </Link>

                          <Link
                            href={`/article/${article.slug}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-high hover:text-brand-gold font-sans uppercase tracking-wider"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Archive Index Status */}
              <div className="p-6 bg-editorial-sand rounded-xs border border-editorial-hairline text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans block">
                  Archive Index Status
                </span>
                <p className="text-xs text-ink-body font-sans max-w-lg mx-auto">
                  Displaying all verified editorial investigations in the {category.name} vertical. New technical briefings are published on a rolling weekly schedule.
                </p>
              </div>
            </div>
          )}

          {/* Explore Other Pillars Bar */}
          <section className="pt-12 border-t border-editorial-hairline space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-sans">
              Explore Complementary Pillars:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="p-3.5 rounded-xs bg-editorial-pure border border-editorial-hairline hover:border-ink-high transition-editorial flex flex-col justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-bold text-ink-high font-sans group-hover:text-brand-gold transition-editorial truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted font-sans">
                    View vertical →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Weekly Dispatch Banner */}
          <NewsletterBanner />
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}
