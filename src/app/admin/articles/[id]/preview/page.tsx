import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { requireAuth, canPublishArticle } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { AuthorBioCard } from '@/components/public/AuthorBioCard';
import { formatDate, formatReadingTime } from '@/lib/utils';
import { ArticlePreviewBanner } from '@/components/admin/ArticlePreviewBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Article preview | Saudi Future Tech',
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
  if (currentUser.role === 'AUTHOR' && article.status !== 'PUBLISHED' && article.authorId !== currentUser.authorId) {
    notFound();
  }

  const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);
  const userCanPublish = canPublishArticle(currentUser);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-10 -mt-6 lg:-mt-8 bg-paper text-ink-2">
      <ArticlePreviewBanner articleId={article.id} status={article.status} canPublish={userCanPublish} />

      <article className="max-w-[52rem] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header>
          <CategoryBadge
            category={{
              name: article.category.name,
              slug: article.category.slug,
              color: article.category.accentColor || '',
            }}
            clickable={false}
          />
          <h1 className="mt-4 font-serif text-display-lg text-ink">{article.title}</h1>
          {article.excerpt && <p className="standfirst mt-6">{article.excerpt}</p>}

          <div className="mt-10 border-t border-rule pt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            {article.author.avatar && (
              <span className="relative w-9 h-9 rounded-full overflow-hidden bg-paper-band shrink-0">
                <Image src={article.author.avatar} alt="" fill sizes="36px" className="object-cover img-warm" />
              </span>
            )}
            <p className="meta leading-relaxed">
              By <span className="text-ink">{article.author.name}</span>
              {article.author.title && <span className="hidden md:inline">, {article.author.title}</span>}
              <span className="mx-2 text-ink-4">·</span>
              {formatDate(article.publishedAt || article.updatedAt)}
              <span className="mx-2 text-ink-4">·</span>
              {formatReadingTime(article.readingTime)}
            </p>
          </div>
        </header>

        {article.coverImage && (
          <figure className="mt-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-band">
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 832px"
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
        )}

        <div className="prose-sft max-w-measure mt-12 text-[1.125rem] sm:text-[1.1875rem]">
          {paragraphs.map((p, idx) => {
            if (p.startsWith('## ')) {
              return (
                <h2 key={idx} className="mt-14 mb-5 font-serif text-display-sm text-ink">
                  {p.replace(/^##\s+/, '')}
                </h2>
              );
            }
            if (p.startsWith('### ')) {
              return (
                <h3 key={idx} className="mt-10 mb-3 font-serif text-[1.375rem] leading-snug text-ink">
                  {p.replace(/^###\s+/, '')}
                </h3>
              );
            }
            if (p.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="my-10 border-l-2 border-clay pl-6 font-serif italic text-[1.5rem] leading-[1.25] text-ink"
                >
                  {p.replace(/^>\s+/, '')}
                </blockquote>
              );
            }
            return <p key={idx}>{p}</p>;
          })}
        </div>

        <div className="max-w-measure">
          {article.articleTags.length > 0 && (
            <div className="mt-10 border-t border-rule pt-4">
              <p className="meta uppercase tracking-[0.04em]">Filed under</p>
              <p className="mt-2 text-[0.9375rem] text-ink">
                {article.articleTags.map(({ tag }) => tag.name).join(', ')}
              </p>
            </div>
          )}

          <AuthorBioCard
            className="mt-12"
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
