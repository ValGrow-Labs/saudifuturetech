import React from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeading } from '@/components/ui/PageHeading';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { requireAuth, canPublishArticle } from '@/lib/auth/guard';
import { TriggerSchedulerButton } from '@/components/admin/TriggerSchedulerButton';

export const dynamic = 'force-dynamic';

function ListHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3 pb-2">
      <h2 className="font-serif text-[1.25rem] leading-tight text-ink">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="text-[0.8125rem] text-ink-2 hover:text-clay transition-colors whitespace-nowrap">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-4 border-b border-rule text-sm text-ink-3">{children}</p>;
}

export default async function AdminDashboardPage() {
  const currentUser = await requireAuth();

  const [
    publishedCount,
    draftCount,
    inReviewCount,
    scheduledCount,
    totalArticles,
    activeSubscribersCount,
    recentArticles,
    scheduledArticles,
    recentReviewHistory,
    reviewQueue,
  ] = await Promise.all([
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'IN_REVIEW' } }),
    prisma.article.count({ where: { status: 'SCHEDULED' } }),
    prisma.article.count(),
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.article.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, slug: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true, accentColor: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'SCHEDULED' },
      orderBy: { scheduledFor: 'asc' },
      take: 3,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.articleReviewHistory.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        article: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'IN_REVIEW' },
      orderBy: { updatedAt: 'asc' },
      take: 5,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const userCanPublish = canPublishArticle(currentUser);

  return (
    <div className="space-y-12 pb-12">
      <PageHeading title="Overview" description="What needs attention today.">
        {userCanPublish && <TriggerSchedulerButton variant="outline" size="md" />}
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center rounded-sm bg-ink text-paper-sheet hover:bg-clay transition-colors text-sm font-medium px-4 py-2 active:translate-y-px"
        >
          New article
        </Link>
      </PageHeading>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        <Link href="/admin/articles?status=PUBLISHED" className="hover:opacity-80 transition-opacity">
          <StatCard label="Published" value={publishedCount} description="Live on the site" />
        </Link>
        <Link href="/admin/articles?status=IN_REVIEW" className="hover:opacity-80 transition-opacity">
          <StatCard
            label="In review"
            value={inReviewCount}
            description={inReviewCount > 0 ? 'Needs an editor' : 'Queue is clear'}
          />
        </Link>
        <Link href="/admin/articles?status=DRAFT" className="hover:opacity-80 transition-opacity">
          <StatCard
            label="Drafts"
            value={draftCount}
            description={scheduledCount > 0 ? `Plus ${scheduledCount} scheduled` : 'Not yet submitted'}
          />
        </Link>
        <Link href="/admin/subscribers" className="hover:opacity-80 transition-opacity">
          <StatCard label="Subscribers" value={activeSubscribersCount} description="Active newsletter readers" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12">
        {/* Needs review */}
        <section className="lg:col-span-7">
          <ListHeading
            title="Needs review"
            href={inReviewCount > 0 ? '/admin/articles?status=IN_REVIEW' : undefined}
            linkLabel={`All ${inReviewCount}`}
          />
          {reviewQueue.length === 0 ? (
            <EmptyLine>Nothing is waiting for review.</EmptyLine>
          ) : (
            <ul>
              {reviewQueue.map((a) => (
                <li key={a.id} className="py-3 border-b border-rule flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="font-serif text-[1.0625rem] leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                    >
                      {a.title}
                    </Link>
                    <p className="meta mt-1">
                      {a.author.name} · {a.category.name}
                    </p>
                  </div>
                  <span className="font-sans text-[0.71875rem] text-ink-3 tabular whitespace-nowrap">
                    {formatDate(a.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Scheduled */}
        <section className="lg:col-span-5">
          <ListHeading
            title="Scheduled"
            href={scheduledArticles.length > 0 ? '/admin/articles?status=SCHEDULED' : undefined}
            linkLabel={`All ${scheduledCount}`}
          />
          {scheduledArticles.length === 0 ? (
            <EmptyLine>Nothing scheduled. Set a release time in the editor and the scheduler publishes it for you.</EmptyLine>
          ) : (
            <ul>
              {scheduledArticles.map((s) => (
                <li key={s.id} className="py-3 border-b border-rule">
                  <p className="font-sans text-[0.71875rem] text-ink tabular">
                    {s.scheduledFor ? formatDate(s.scheduledFor) : 'Time not set'}
                    <span className="text-ink-4"> · {s.category.name}</span>
                  </p>
                  <Link
                    href={`/admin/articles/${s.id}/edit`}
                    className="mt-1 block font-serif text-[1.0625rem] leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently updated */}
        <section className="lg:col-span-7">
          <ListHeading title="Recently updated" href="/admin/articles" linkLabel={`All ${totalArticles} articles`} />
          {recentArticles.length === 0 ? (
            <EmptyLine>
              No articles yet.{' '}
              <Link href="/admin/articles/new" className="text-ink link-rule">
                Write the first one
              </Link>
            </EmptyLine>
          ) : (
            <ul>
              {recentArticles.map((article) => (
                <li key={article.id} className="py-3 border-b border-rule grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="font-serif text-[1.0625rem] leading-snug text-ink hover:text-clay transition-colors line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <StatusBadge status={article.status as any} className="justify-self-end" />
                  <p className="meta truncate">
                    {article.author.name} · {article.category.name} · {formatDate(article.updatedAt)}
                  </p>
                  <span className="flex gap-3 justify-self-end">
                    <Link href={`/admin/articles/${article.id}/preview`} className="row-action">
                      Preview
                    </Link>
                    <Link href={`/admin/articles/${article.id}/edit`} className="row-action">
                      Edit
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activity */}
        <section className="lg:col-span-5">
          <ListHeading title="Review activity" />
          {recentReviewHistory.length === 0 ? (
            <EmptyLine>No status changes recorded yet.</EmptyLine>
          ) : (
            <ul>
              {recentReviewHistory.map((entry) => (
                <li key={entry.id} className="py-3 border-b border-rule">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] text-ink truncate">{entry.userName || 'Someone'}</span>
                    <span className="font-sans text-[0.6875rem] text-ink-4 tabular shrink-0">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/articles/${entry.article.id}/edit`}
                    className="mt-0.5 block font-serif text-[0.9375rem] leading-snug text-ink-2 hover:text-clay transition-colors line-clamp-1"
                  >
                    {entry.article.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StatusBadge status={entry.previousStatus as any} />
                    <span className="text-ink-4 text-xs" aria-hidden>
                      →
                    </span>
                    <StatusBadge status={entry.newStatus as any} />
                  </div>
                  {entry.feedback && (
                    <p className="mt-1.5 text-[0.8125rem] text-ink-3 italic line-clamp-2">&ldquo;{entry.feedback}&rdquo;</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
