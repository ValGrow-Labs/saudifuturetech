import React from 'react';
import Link from 'next/link';
import { PageHeading } from '@/components/ui/PageHeading';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/prisma';
import {
  requireAuth,
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
} from '@/lib/auth/guard';
import { ArticleRowActions } from '@/components/admin/ArticleRowActions';
import { TriggerSchedulerButton } from '@/components/admin/TriggerSchedulerButton';
import { ArticleStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface AdminArticlesPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
    author?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const currentUser = await requireAuth();
  const params = await searchParams;

  const activeStatus = params.status || 'ALL';
  const categoryFilter = params.category || '';
  const searchQuery = params.q?.trim() || '';
  const authorFilter = params.author || '';

  // Tab counts queries
  const [
    totalCount,
    publishedCount,
    inReviewCount,
    scheduledCount,
    draftCount,
    categories,
    authors,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ArticleStatus.IN_REVIEW } }),
    prisma.article.count({ where: { status: ArticleStatus.SCHEDULED } }),
    prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
    prisma.category.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Construct query where clause
  const where: any = {};

  if (activeStatus && activeStatus !== 'ALL') {
    where.status = activeStatus as ArticleStatus;
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter };
  }

  if (authorFilter) {
    where.author = { slug: authorFilter };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { slug: { contains: searchQuery, mode: 'insensitive' } },
      { excerpt: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      author: true,
      category: true,
      articleTags: {
        include: { tag: true },
      },
    },
  });

  const tabs = [
    { label: 'All', key: 'ALL', count: totalCount },
    { label: 'Published', key: 'PUBLISHED', count: publishedCount },
    { label: 'In review', key: 'IN_REVIEW', count: inReviewCount },
    { label: 'Scheduled', key: 'SCHEDULED', count: scheduledCount },
    { label: 'Drafts', key: 'DRAFT', count: draftCount },
  ];

  const hasFilters = Boolean(searchQuery || categoryFilter);

  return (
    <div className="space-y-6">
      <PageHeading title="Articles" description="Every article in the CMS, newest edits first.">
        {canPublishArticle(currentUser) && <TriggerSchedulerButton variant="outline" size="md" />}
        <Link href="/admin/articles/new">
          <Button variant="primary" size="md">
            New article
          </Button>
        </Link>
      </PageHeading>

      {/* Status tabs */}
      <nav aria-label="Filter by status" className="flex items-end gap-6 overflow-x-auto border-b border-rule">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const href =
            tab.key === 'ALL'
              ? `/admin/articles${categoryFilter ? `?category=${categoryFilter}` : ''}`
              : `/admin/articles?status=${tab.key}${categoryFilter ? `&category=${categoryFilter}` : ''}`;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative -mb-px shrink-0 pb-2.5 pt-1 text-sm whitespace-nowrap border-b-2 transition-colors ${
                isActive ? 'border-clay text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 font-sans text-[0.71875rem] tabular ${isActive ? 'text-ink-3' : 'text-ink-4'}`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Search & section filter */}
      <form method="GET" action="/admin/articles" className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        {activeStatus !== 'ALL' && <input type="hidden" name="status" value={activeStatus} />}

        <div className="flex-1">
          <label htmlFor="article-search" className="sr-only">
            Search
          </label>
          <input
            id="article-search"
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search headline, slug or standfirst"
            className="field"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="article-category" className="sr-only">
            Section
          </label>
          <select id="article-category" name="category" defaultValue={categoryFilter} className="field sm:w-48">
            <option value="">All sections</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <Button type="submit" variant="outline" size="md">
            Filter
          </Button>

          {hasFilters && (
            <Link
              href={`/admin/articles${activeStatus !== 'ALL' ? `?status=${activeStatus}` : ''}`}
              className="row-action px-1"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles match"
          description={
            hasFilters
              ? 'Nothing matches this search in the current tab. Clear the filters or try another word.'
              : 'There are no articles with this status yet.'
          }
          actionLabel={hasFilters ? 'Clear filters' : 'See all articles'}
          actionHref="/admin/articles"
        />
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="data-table min-w-[60rem]">
            <thead>
              <tr>
                <th>Headline</th>
                <th>Section</th>
                <th>Author</th>
                <th>Status</th>
                <th>Flags</th>
                <th>Date</th>
                <th className="text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const userCanEdit = canEditArticle(currentUser, article);
                const userCanPublish = canPublishArticle(currentUser);
                const userCanDelete = canDeleteArticle(currentUser, article);
                const flags = [
                  article.featured && 'Lead',
                  article.isEditorsPick && 'Pick',
                  article.isTrending && 'Trending',
                ].filter(Boolean) as string[];

                return (
                  <tr key={article.id}>
                    <td className="max-w-[26rem]">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-serif text-[1rem] leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                      >
                        {article.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="font-sans text-[0.6875rem] text-ink-4 truncate max-w-[18rem]">
                          /{article.slug}
                        </span>
                        {article.sampleContent && (
                          <span className="font-sans text-[0.6875rem] text-ink-3">Sample</span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap text-[0.8125rem]">{article.category.name}</td>

                    <td className="whitespace-nowrap text-[0.8125rem]">
                      {article.author.name}
                      {currentUser.authorId === article.authorId && (
                        <span className="ml-1.5 font-sans text-[0.6875rem] text-ink-4">(you)</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap">
                      <StatusBadge status={article.status as any} />
                    </td>

                    <td className="whitespace-nowrap font-sans text-[0.71875rem] text-ink-2">
                      {flags.length > 0 ? flags.join(' · ') : <span className="text-ink-4">—</span>}
                    </td>

                    <td className="whitespace-nowrap font-sans text-[0.71875rem] tabular">
                      {article.status === 'SCHEDULED' && article.scheduledFor ? (
                        <>
                          <div className="text-ink">{formatDate(article.scheduledFor)}</div>
                          <div className="text-ink-4">Scheduled</div>
                        </>
                      ) : (
                        <>
                          <div className="text-ink-2">{formatDate(article.publishedAt || article.updatedAt)}</div>
                          <div className="text-ink-4">{article.readingTime} min read</div>
                        </>
                      )}
                    </td>

                    <td className="text-right">
                      <ArticleRowActions
                        articleId={article.id}
                        slug={article.slug}
                        status={article.status}
                        canPublish={userCanPublish}
                        canEdit={userCanEdit}
                        canDelete={userCanDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

