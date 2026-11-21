import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { requireAuth, canPublishArticle } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { ArticlePreviewBanner } from '@/components/admin/ArticlePreviewBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial Story Preview | Saudi Future Tech',
  robots: {
    index: false,
    follow: false,
  },
};

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminArticlePreviewPage({ params }: PreviewPageProps) {
  const currentUser = await requireAuth();
  const { id } = await params;

  const article = await prisma.article.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      author: true,
      category: true,
      articleTags: {
        include: { tag: true },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Authors can only preview their own unpublished drafts/in-review stories
  if (
    currentUser.role === 'AUTHOR' &&
    article.status !== 'PUBLISHED' &&
    article.authorId !== currentUser.authorId
  ) {
    notFound();
  }

  const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);
  const userCanPublish = canPublishArticle(currentUser);

  return (
    <div className="min-h-screen bg-editorial-paper text-ink-body font-sans -m-4 sm:-m-6 lg:-m-8 selection:bg-brand-yellow/30">
      {/* Sticky Administrative Preview Banner */}
      <ArticlePreviewBanner
        articleId={article.id}
        status={article.status}
        canPublish={userCanPublish}
      />

      {/* Main Reading Canvas */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Breadcrumb / Category Header */}
        <div className="flex items-center gap-3">
          <CategoryBadge
            category={{
              name: article.category.name,
              slug: article.category.slug,
              color: article.category.accentColor || '#F4C542',
            }}
          />
          <span className="text-sft-text-muted">&bull;</span>
          <div className="flex items-center gap-1.5 text-xs text-sft-text-muted font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatReadingTime(article.readingTime)}</span>
          </div>
        </div>

        {/* Headline & Standfirst */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-cloud font-heading tracking-tight leading-[1.15]">
            {article.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-sft-text-muted font-sans font-light leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Byline & Timestamp Capsule */}
        <div className="flex items-center justify-between py-4 border-y border-sft text-xs">
          <div className="flex items-center gap-3">
            {article.author.avatar && (
              <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-dark border border-sft relative">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-bold text-brand-cloud font-heading">{article.author.name}</div>
              <div className="text-[11px] text-sft-text-muted">{article.author.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sft-text-muted font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-brand-yellow" />
            <span>{formatDate(article.publishedAt || article.updatedAt)}</span>
          </div>
        </div>

        {/* Hero Artwork */}
        <figure className="space-y-2">
          <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden bg-brand-dark border border-sft">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
          {(article.coverImageCaption || article.imageCredit) && (
            <figcaption className="text-[11px] text-sft-text-muted flex items-center justify-between font-sans px-1">
              <span>{article.coverImageCaption}</span>
              {article.imageCredit && <span className="font-mono text-sft-text-muted/70">Photo: {article.imageCredit}</span>}
            </figcaption>
          )}
        </figure>

        {/* Article Body Content */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-sft-text-body font-sans">
          {paragraphs.map((p, idx) => {
            if (p.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-extrabold text-brand-cloud font-heading pt-4 pb-2 border-b border-sft"
                >
                  {p.replace(/^##\s+/, '')}
                </h2>
              );
            }
            if (p.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-brand-yellow font-heading pt-3">
                  {p.replace(/^###\s+/, '')}
                </h3>
              );
            }
            if (p.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="p-4 bg-brand-dark/80 border-l-2 border-brand-yellow text-brand-cloud italic my-4 rounded-r-sm font-sans"
                >
                  {p.replace(/^>\s+/, '')}
                </blockquote>
              );
            }
            return <p key={idx} className="leading-relaxed">{p}</p>;
          })}
        </div>

        {/* Taxonomy Tags */}
        {article.articleTags.length > 0 && (
          <div className="pt-6 border-t border-sft space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sft-text-muted font-heading block">
              Related Topics & Keywords
            </span>
            <div className="flex flex-wrap gap-2">
              {article.articleTags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 rounded-xs bg-brand-dark border border-sft text-xs font-mono text-sft-text-body"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Card */}
        <div className="pt-6 border-t border-sft">
          <AuthorBioCard
            author={{
              id: article.author.id,
              displayName: article.author.name,
              slug: article.author.slug,
              title: article.author.title,
              avatarUrl: article.author.avatar || '',
              bio: article.author.bio || '',
              location: article.author.location || '',
              twitterHandle: (article.author.socialLinks as any)?.twitter,
              linkedinUrl: (article.author.socialLinks as any)?.linkedin,
            }}
          />
        </div>
      </article>
    </div>
  );
}
