import React from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { requireAuth, canPublishArticle } from '@/lib/auth/guard';
import { TriggerSchedulerButton } from '@/components/admin/TriggerSchedulerButton';
import { RiyadhSkyline } from '@/components/public/RiyadhSkyline';
import { SITE_NAME_AR, hijriDate } from '@/lib/arabic';

export const dynamic = 'force-dynamic';

function ListHeading({
  title,
  href,
  linkLabel,
  accent = false,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 pt-3 pb-2 ${
        accent ? 'border-t-2 border-clay' : 'border-t-2 border-ink'
      }`}
    >
      <h2 className="font-serif text-[1.25rem] font-bold leading-tight text-ink">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-[0.8125rem] font-medium text-ink-2 hover:text-clay transition-colors whitespace-nowrap"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const currentUser = await requireAuth();

  const now = new Date();
  const gregorianDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  })
    .format(now)
    .toUpperCase();
  const hijriStr = hijriDate(now).toUpperCase();

  const [
    // 1. Articles metrics
    publishedCount,
    draftCount,
    inReviewCount,
    scheduledCount,
    totalArticles,

    // 2. Directory metrics
    totalStartups,
    publishedStartups,
    crVerifiedStartups,
    totalOpportunities,
    publishedOpportunities,
    openOpportunities,
    totalInvestors,
    publishedInvestors,
    cmaAuthorizedInvestors,

    // 3. Audience metrics
    activeSubscribersCount,

    // 4. Action queues & recent items
    reviewQueue,
    scheduledArticles,
    recentArticles,
    recentOpportunities,
    recentReviewHistory,
  ] = await Promise.all([
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'IN_REVIEW' } }),
    prisma.article.count({ where: { status: 'SCHEDULED' } }),
    prisma.article.count(),

    prisma.startup.count(),
    prisma.startup.count({ where: { isPublished: true } }),
    prisma.startup.count({ where: { crVerified: true } }),

    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { isPublished: true } }),
    prisma.opportunity.count({ where: { isPublished: true, status: 'OPEN' } }),

    prisma.investor.count(),
    prisma.investor.count({ where: { isPublished: true } }),
    prisma.investor.count({ where: { isCmaAuthorized: true } }),

    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),

    prisma.article.findMany({
      where: { status: 'IN_REVIEW' },
      orderBy: { updatedAt: 'asc' },
      take: 4,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
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

    prisma.article.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true, accentColor: true } },
      },
    }),

    prisma.opportunity.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: 'desc' }, { deadline: 'asc' }, { updatedAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        organization: true,
        category: true,
        status: true,
        deadline: true,
        fundingAmount: true,
      },
    }),

    prisma.articleReviewHistory.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        article: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  const userCanPublish = canPublishArticle(currentUser);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Broadsheet Masthead Banner with Riyadh Skyline */}
      <div className="border-b border-rule pb-6">
        {/* Decorative Skyline silhouette */}
        <div aria-hidden="true" className="w-full overflow-hidden select-none mb-3">
          <div className="flex items-end justify-center overflow-hidden text-ink/90 opacity-90">
            <RiyadhSkyline className="w-full !h-10 md:!h-14" />
          </div>
          <div className="h-[2px] bg-ink" />
          <div className="mt-[2px] h-px bg-gold/70" />
        </div>

        {/* Dateline Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 text-[0.71875rem] font-sans text-ink-3 uppercase tracking-wider border-b border-rule">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{gregorianDate}</span>
            <span>·</span>
            <span>{hijriStr}</span>
            <span className="hidden md:inline">· RIYADH, KINGDOM OF SAUDI ARABIA</span>
          </div>
          <div className="flex items-center gap-3">
            <span lang="ar" dir="rtl" className="font-serif normal-case text-ink-2 font-medium tracking-normal text-xs">
              {SITE_NAME_AR}
            </span>
            <span className="hidden sm:inline text-ink-4">|</span>
            <span className="inline-flex items-center gap-1.5 text-moss font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-moss" aria-hidden="true" />
              NEWSROOM ONLINE
            </span>
          </div>
        </div>

        {/* Primary Page Heading & Quick Actions */}
        <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-clay mb-1">
              Editorial Operations & Ecosystem Backstage
            </p>
            <h1 className="font-serif text-[2.25rem] sm:text-[2.625rem] font-bold text-ink tracking-tight leading-none">
              Command Desk
            </h1>
            <p className="mt-2 text-sm text-ink-3 max-w-2xl leading-relaxed">
              Real-time publishing pipeline, verified startup registry, and active opportunity ledger for Saudi Arabia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {userCanPublish && <TriggerSchedulerButton variant="outline" size="md" />}
            <Link
              href="/admin/startups"
              className="inline-flex items-center justify-center rounded-sm border border-rule bg-paper-sheet hover:border-ink hover:text-ink text-ink-2 text-sm font-medium px-3.5 py-2 transition-colors active:translate-y-px"
            >
              Startups Directory
            </Link>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center justify-center rounded-sm bg-clay text-paper-sheet hover:bg-clay-dark text-sm font-medium px-4 py-2 transition-colors active:translate-y-px shadow-sm"
            >
              + New Article
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Unified 4-Pillar Operational KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Pillar 1: Editorial Publishing */}
        <Link
          href="/admin/articles"
          className="group block bg-paper-sheet border border-rule hover:border-ink p-5 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rule pb-2.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
              Editorial Publishing
            </span>
            {inReviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-alert">
                <span className="w-1.5 h-1.5 rounded-full bg-alert animate-pulse" />
                {inReviewCount} need review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-moss">
                <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                Queue clear
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] font-bold leading-none text-ink tabular">{publishedCount}</span>
            <span className="text-xs text-ink-3">Live stories</span>
          </div>
          <p className="mt-2 text-xs text-ink-3 border-t border-rule/60 pt-2 flex items-center justify-between">
            <span>
              {draftCount} drafts · {scheduledCount} scheduled
            </span>
            <span className="text-ink group-hover:text-clay font-medium transition-colors">Manage →</span>
          </p>
        </Link>

        {/* Pillar 2: Saudi Startups Registry */}
        <Link
          href="/admin/startups"
          className="group block bg-paper-sheet border border-rule hover:border-ink p-5 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rule pb-2.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
              Startups Registry
            </span>
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-moss">
              <span className="w-1.5 h-1.5 rounded-full bg-moss" />
              Verified
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] font-bold leading-none text-ink tabular">{publishedStartups}</span>
            <span className="text-xs text-ink-3">Tracked ventures</span>
          </div>
          <p className="mt-2 text-xs text-ink-3 border-t border-rule/60 pt-2 flex items-center justify-between">
            <span>
              {crVerifiedStartups} CR verified · {totalStartups} total
            </span>
            <span className="text-ink group-hover:text-clay font-medium transition-colors">Directory →</span>
          </p>
        </Link>

        {/* Pillar 3: Grants & Opportunities */}
        <Link
          href="/admin/opportunities"
          className="group block bg-paper-sheet border border-rule hover:border-ink p-5 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rule pb-2.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
              Capital & Grants
            </span>
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-moss">
              <span className="w-1.5 h-1.5 rounded-full bg-moss" />
              {openOpportunities} open now
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] font-bold leading-none text-ink tabular">
              {publishedOpportunities}
            </span>
            <span className="text-xs text-ink-3">Programmes</span>
          </div>
          <p className="mt-2 text-xs text-ink-3 border-t border-rule/60 pt-2 flex items-center justify-between">
            <span>
              {openOpportunities} active · {totalOpportunities} total
            </span>
            <span className="text-ink group-hover:text-clay font-medium transition-colors">Ledger →</span>
          </p>
        </Link>

        {/* Pillar 4: Investors & Newsletter */}
        <Link
          href="/admin/investors"
          className="group block bg-paper-sheet border border-rule hover:border-ink p-5 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rule pb-2.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
              Investors & Readers
            </span>
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-ink-3">
              <span className="w-1.5 h-1.5 rounded-full bg-clay" />
              Institutional
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] font-bold leading-none text-ink tabular">{publishedInvestors}</span>
            <span className="text-xs text-ink-3">Active funds</span>
          </div>
          <p className="mt-2 text-xs text-ink-3 border-t border-rule/60 pt-2 flex items-center justify-between">
            <span>
              {cmaAuthorizedInvestors} CMA authorized · {activeSubscribersCount} readers
            </span>
            <span className="text-ink group-hover:text-clay font-medium transition-colors">Network →</span>
          </p>
        </Link>
      </div>

      {/* 3. Balanced Two-Column Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column (Primary Editorial Workflows - 7 cols) */}
        <div className="lg:col-span-7 space-y-9">
          {/* Section A: Needs Review Queue */}
          <section>
            <ListHeading
              title="Editorial Review Queue"
              href={inReviewCount > 0 ? '/admin/articles?status=IN_REVIEW' : undefined}
              linkLabel={inReviewCount > 0 ? `All ${inReviewCount} pending` : undefined}
              accent={inReviewCount > 0}
            />

            {reviewQueue.length === 0 ? (
              <div className="p-5 border border-rule bg-paper-sheet flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-moss shrink-0" aria-hidden="true" />
                <p className="text-sm text-ink-2">
                  The editorial queue is clear. All submitted reports have been reviewed and published.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-rule border-b border-rule">
                {reviewQueue.map((a) => (
                  <li key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[0.71875rem] font-sans text-ink-3 mb-1">
                        <span className="text-clay font-medium">{a.category.name}</span>
                        <span>·</span>
                        <span>By {a.author.name}</span>
                        <span>·</span>
                        <span className="tabular">{formatDate(a.updatedAt)}</span>
                      </div>
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="font-serif text-[1.125rem] font-bold leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                      >
                        {a.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="inline-flex items-center justify-center rounded-sm bg-clay text-paper-sheet hover:bg-clay-dark px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs"
                      >
                        Review Story
                      </Link>
                      <Link
                        href={`/admin/articles/${a.id}/preview`}
                        className="text-xs text-ink-3 hover:text-ink transition-colors px-2 py-1"
                      >
                        Preview ↗
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Section B: Recently Updated Articles */}
          <section>
            <ListHeading
              title="Recently Updated Stories"
              href="/admin/articles"
              linkLabel={`All ${totalArticles} stories`}
            />

            {recentArticles.length === 0 ? (
              <p className="py-4 border-b border-rule text-sm text-ink-3">
                No articles yet.{' '}
                <Link href="/admin/articles/new" className="text-ink link-rule">
                  Write the first one
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-rule border-b border-rule">
                {recentArticles.map((article) => (
                  <li key={article.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.6875rem] font-semibold text-clay uppercase tracking-wider">
                          {article.category.name}
                        </span>
                        <span className="text-ink-4 text-xs">·</span>
                        <StatusBadge status={article.status as any} />
                      </div>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-serif text-[1.0625rem] font-medium leading-snug text-ink hover:text-clay transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <p className="meta mt-1">
                        {article.author.name} · Updated {formatDate(article.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <Link href={`/admin/articles/${article.id}/preview`} className="row-action">
                        Preview ↗
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="row-action font-medium text-ink">
                        Edit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Section C: Active Opportunities & Cohorts */}
          <section>
            <ListHeading
              title="Active Opportunities & Cohorts"
              href="/admin/opportunities"
              linkLabel={`Manage all (${totalOpportunities})`}
            />

            <div className="border border-rule divide-y divide-rule bg-paper-sheet">
              {recentOpportunities.map((opp) => (
                <div key={opp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-ink-3 mb-1">
                      <span className="font-semibold text-ink">{opp.organization}</span>
                      <span>·</span>
                      <span className="text-clay font-medium">{opp.category.replace('_', ' ')}</span>
                      {opp.fundingAmount && (
                        <>
                          <span>·</span>
                          <span className="text-ink-2">{opp.fundingAmount}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-ink hover:text-clay transition-colors line-clamp-1">
                      {opp.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-sans whitespace-nowrap ${
                        opp.status === 'OPEN'
                          ? 'text-moss'
                          : opp.status === 'CLOSING_SOON'
                          ? 'text-alert font-medium'
                          : 'text-ink-3'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          opp.status === 'OPEN' ? 'bg-moss' : opp.status === 'CLOSING_SOON' ? 'bg-alert' : 'bg-ink-4'
                        }`}
                      />
                      {opp.status.replace('_', ' ')}
                    </span>
                    <Link
                      href={`/admin/opportunities`}
                      className="text-xs text-ink-3 hover:text-ink link-rule"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Operations & System Audit - 5 cols) */}
        <div className="lg:col-span-5 space-y-9">
          {/* Section A: Fast Operations Hub */}
          <section>
            <ListHeading title="Quick Operations" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/admin/articles/new"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  + New Article
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">Draft & publish an editorial report</span>
              </Link>

              <Link
                href="/admin/startups"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  + Register Startup
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">Add verified Saudi venture</span>
              </Link>

              <Link
                href="/admin/opportunities"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  + Post Grant / Cohort
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">List government or VC programme</span>
              </Link>

              <Link
                href="/admin/investors"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  + Add Investor
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">Track fund, angel, or corporate VC</span>
              </Link>

              <Link
                href="/admin/campaigns"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  Sunday Brief
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">Compose newsletter dispatch</span>
              </Link>

              <Link
                href="/admin/categories"
                className="p-3.5 bg-paper-sheet border border-rule hover:border-ink transition-colors flex flex-col justify-between h-24 group shadow-subtle"
              >
                <span className="text-xs font-semibold text-ink group-hover:text-clay transition-colors">
                  Editorial Desks
                </span>
                <span className="text-[0.6875rem] text-ink-3 leading-snug">Pillars, sections & colors</span>
              </Link>
            </div>
          </section>

          {/* Section B: Scheduled Publications */}
          <section>
            <ListHeading
              title="Scheduled Dispatches"
              href={scheduledArticles.length > 0 ? '/admin/articles?status=SCHEDULED' : undefined}
              linkLabel={scheduledArticles.length > 0 ? `All ${scheduledCount}` : undefined}
            />

            {scheduledArticles.length === 0 ? (
              <div className="p-4 border border-rule bg-paper-sheet text-xs text-ink-3 leading-relaxed">
                <p className="font-medium text-ink mb-1">Automated Publishing Active</p>
                No stories are currently queued for automatic release. Set a release date and time in the article editor to schedule future publication.
              </div>
            ) : (
              <ul className="divide-y divide-rule border-b border-rule">
                {scheduledArticles.map((s) => (
                  <li key={s.id} className="py-3">
                    <p className="font-sans text-[0.71875rem] text-ink tabular flex items-center justify-between">
                      <span>{s.scheduledFor ? formatDate(s.scheduledFor) : 'Time pending'}</span>
                      <span className="text-clay font-medium">{s.category.name}</span>
                    </p>
                    <Link
                      href={`/admin/articles/${s.id}/edit`}
                      className="mt-1 block font-serif text-[1rem] font-medium leading-snug text-ink hover:text-clay transition-colors line-clamp-2"
                    >
                      {s.title}
                    </Link>
                    <p className="text-[0.6875rem] text-ink-4 mt-0.5">Author: {s.author.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Section C: Editorial Review History & Audit Trail */}
          <section>
            <ListHeading title="Editorial Audit Trail" />
            {recentReviewHistory.length === 0 ? (
              <p className="py-4 border-b border-rule text-sm text-ink-3">No status changes recorded yet.</p>
            ) : (
              <ul className="divide-y divide-rule border-b border-rule">
                {recentReviewHistory.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="font-semibold text-ink truncate">{entry.userName || 'Editor'}</span>
                      <span className="font-sans text-[0.6875rem] text-ink-4 tabular shrink-0">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/admin/articles/${entry.article.id}/edit`}
                      className="mt-1 block font-serif text-[0.9375rem] font-medium leading-snug text-ink-2 hover:text-clay transition-colors line-clamp-1"
                    >
                      {entry.article.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <StatusBadge status={entry.previousStatus as any} />
                      <span className="text-ink-4 text-xs" aria-hidden="true">
                        →
                      </span>
                      <StatusBadge status={entry.newStatus as any} />
                    </div>
                    {entry.feedback && (
                      <p className="mt-1.5 text-[0.8125rem] text-ink-3 italic bg-paper-band/50 p-2 border-l-2 border-rule">
                        &ldquo;{entry.feedback}&rdquo;
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
