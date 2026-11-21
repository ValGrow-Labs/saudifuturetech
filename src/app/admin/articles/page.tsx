import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
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
    { label: 'All Stories', key: 'ALL', count: totalCount, icon: FileText },
    { label: 'Published', key: 'PUBLISHED', count: publishedCount, icon: CheckCircle2 },
    { label: 'In Review Queue', key: 'IN_REVIEW', count: inReviewCount, icon: Clock },
    { label: 'Scheduled', key: 'SCHEDULED', count: scheduledCount, icon: Calendar },
    { label: 'Drafts', key: 'DRAFT', count: draftCount, icon: Layers },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-editorial-hairline">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
            Content Management System
          </div>
          <PageHeading
            title="Articles & Editorial Reports"
            description="Manage publication status, review submissions, and draft technology coverage across Vision 2030 sectors."
            size="lg"
          />
        </div>

        <div className="flex items-center gap-3">
          {canPublishArticle(currentUser) && (
            <TriggerSchedulerButton variant="outline" size="md" />
          )}
          <Link href="/admin/articles/new">
            <Button
              variant="primary"
              size="md"
              className="font-sans uppercase tracking-wider text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-editorial-hairline pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStatus === tab.key;
          const href =
            tab.key === 'ALL'
              ? `/admin/articles${categoryFilter ? `?category=${categoryFilter}` : ''}`
              : `/admin/articles?status=${tab.key}${categoryFilter ? `&category=${categoryFilter}` : ''}`;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-none text-xs font-sans font-bold transition-editorial shrink-0 ${
                isActive
                  ? 'bg-editorial-pure text-ink-high border-b-2 border-ink-high shadow-xs'
                  : 'text-ink-body hover:text-ink-high hover:bg-editorial-sand/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ink-high' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono ${
                  isActive ? 'bg-editorial-sand text-ink-high border border-editorial-hairline' : 'bg-editorial-sand/40 text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search & Category Filter Bar */}
      <form method="GET" action="/admin/articles" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {activeStatus !== 'ALL' && <input type="hidden" name="status" value={activeStatus} />}

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search headline, slug, or keywords..."
            className="w-full bg-editorial-pure border border-editorial-hairline rounded-none pl-9 pr-3 py-2 text-xs text-ink-high placeholder-ink-muted/60 focus:outline-none focus:border-ink-high transition-editorial font-sans shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            name="category"
            defaultValue={categoryFilter}
            className="bg-editorial-pure border border-editorial-hairline rounded-none px-3 py-2 text-xs text-ink-high focus:outline-none focus:border-ink-high transition-editorial font-sans shadow-xs"
          >
            <option value="">All Pillars</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <Button type="submit" variant="secondary" size="sm" className="font-sans uppercase tracking-wider text-xs">
            Filter
          </Button>

          {(searchQuery || categoryFilter) && (
            <Link
              href={`/admin/articles${activeStatus !== 'ALL' ? `?status=${activeStatus}` : ''}`}
              className="text-xs text-ink-muted hover:text-ink-high px-2 py-1 font-sans font-medium"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Articles Table */}
      {articles.length === 0 ? (
        <EmptyState
          title="No articles match criteria"
          description="Try clearing your search query or selecting a different status filter tab."
          actionLabel="View All Articles"
          actionHref="/admin/articles"
        />
      ) : (
        <div className="bg-editorial-pure rounded-none border border-editorial-hairline overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-editorial-hairline bg-editorial-sand text-ink-muted font-sans uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">Story Headline</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Author Byline</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Flags</th>
                  <th className="py-3 px-4 font-bold">Published / Updated</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-hairline">
                {articles.map((article) => {
                  const userCanEdit = canEditArticle(currentUser, article);
                  const userCanPublish = canPublishArticle(currentUser);
                  const userCanDelete = canDeleteArticle(currentUser, article);

                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-editorial-sand/40 transition-editorial text-ink-body"
                    >
                      <td className="py-3 px-4 max-w-sm sm:max-w-md">
                        <div className="font-bold font-serif line-clamp-1 hover:text-amber-800 transition-colors">
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            {article.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-ink-muted font-mono truncate max-w-[200px]">
                            /{article.slug}
                          </span>
                          {article.sampleContent && (
                            <span className="text-[9px] font-mono px-1 rounded-none bg-editorial-sand text-ink-muted border border-editorial-hairline">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none bg-editorial-sand border border-editorial-hairline text-[11px] font-sans font-medium text-ink-body">
                          {article.category.name}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-medium text-ink-body font-sans">
                        {article.author.name}
                        {currentUser.authorId === article.authorId && (
                          <span className="ml-1.5 text-[9px] uppercase font-mono px-1 py-0.2 rounded-none bg-amber-100 text-amber-800 border border-amber-300">
                            You
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={article.status as any} />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {article.featured && (
                            <span className="text-[9px] uppercase font-bold font-sans px-1 py-0.5 rounded-none bg-brand-yellow text-ink-high border border-ink-high/20">
                              Featured
                            </span>
                          )}
                          {article.isEditorsPick && (
                            <span className="text-[9px] uppercase font-bold font-sans px-1 py-0.5 rounded-none bg-amber-50 text-amber-800 border border-amber-300">
                              Pick
                            </span>
                          )}
                          {article.isTrending && (
                            <span className="text-[9px] uppercase font-bold font-sans px-1 py-0.5 rounded-none bg-purple-50 text-purple-800 border border-purple-300">
                              Trending
                            </span>
                          )}
                          {!article.featured && !article.isEditorsPick && !article.isTrending && (
                            <span className="text-ink-muted text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-ink-muted font-mono text-[11px]">
                        {article.status === 'SCHEDULED' && article.scheduledFor ? (
                          <div className="text-amber-800 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-700" />
                            <span>{formatDate(article.scheduledFor)}</span>
                          </div>
                        ) : (
                          <div>{formatDate(article.publishedAt || article.updatedAt)}</div>
                        )}
                        <div className="text-[10px] text-ink-muted/70">
                          {article.status === 'SCHEDULED' ? 'Scheduled drop' : `${article.readingTime} min read`}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
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
        </div>
      )}
    </div>
  );
}

