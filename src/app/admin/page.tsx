import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Layers,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  Edit,
  Calendar,
  Mail,
  CheckCircle2,
  Sparkles,
  History,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { requireAuth, canPublishArticle } from '@/lib/auth/guard';
import { TriggerSchedulerButton } from '@/components/admin/TriggerSchedulerButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const currentUser = await requireAuth();

  // 1. Fetch real metric counts and pipeline data from PostgreSQL
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
  ]);

  const userCanPublish = canPublishArticle(currentUser);

  // 4 Core High-Level Editorial KPIs
  const kpis = [
    {
      label: 'Live Stories',
      value: publishedCount,
      subtext: 'Visible to readers',
      badge: 'Production',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: FileText,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200',
      href: '/admin/articles?status=PUBLISHED',
    },
    {
      label: 'Review Queue',
      value: inReviewCount,
      subtext: inReviewCount === 1 ? '1 story needs approval' : inReviewCount > 1 ? `${inReviewCount} stories need approval` : 'Queue is clear',
      badge: inReviewCount > 0 ? 'Needs Attention' : 'All Clear',
      badgeStyle: inReviewCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-editorial-sand text-ink-muted border-editorial-hairline',
      icon: Clock,
      iconColor: inReviewCount > 0 ? 'text-amber-700' : 'text-ink-muted',
      iconBg: inReviewCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-editorial-sand border-editorial-hairline',
      href: '/admin/articles?status=IN_REVIEW',
      alert: inReviewCount > 0,
    },
    {
      label: 'Active Drafts',
      value: draftCount,
      subtext: scheduledCount > 0 ? `${scheduledCount} scheduled to drop` : 'Unpublished works in progress',
      badge: scheduledCount > 0 ? `${scheduledCount} Scheduled` : 'Drafting',
      badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: Layers,
      iconColor: 'text-sky-700',
      iconBg: 'bg-sky-50 border-sky-200',
      href: '/admin/articles?status=DRAFT',
    },
    {
      label: 'Subscribers',
      value: activeSubscribersCount,
      subtext: 'Executive weekly briefing readers',
      badge: 'Active Audience',
      badgeStyle: 'bg-editorial-sand text-ink-high border-editorial-hairline',
      icon: Mail,
      iconColor: 'text-brand-gold',
      iconBg: 'bg-editorial-sand border-editorial-hairline',
      href: '/admin/subscribers',
    },
  ];

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      {/* 1. Header: Clean Editorial Greeting & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-editorial-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted font-sans">
              Editorial Operations
            </span>
            <span className="text-ink-muted text-xs">&bull;</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-xs">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-high font-serif tracking-tight">
            Editorial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-ink-body font-serif italic">
            Welcome back, {currentUser.name}. Overview of stories, reviews, and editorial audience.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userCanPublish && (
            <TriggerSchedulerButton variant="outline" size="md" />
          )}
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xs bg-brand-yellow hover:bg-amber-400 text-ink-high font-sans font-bold text-xs uppercase tracking-wider transition-editorial shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Draft New Story</span>
          </Link>
        </div>
      </div>

      {/* 2. Priority Alert (Only Shown When Items Await Review!) */}
      {inReviewCount > 0 && (
        <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-300 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink-high font-serif">
                  {inReviewCount} {inReviewCount === 1 ? 'Story' : 'Stories'} Awaiting Editorial Review
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded-xs">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-ink-muted font-sans mt-0.5">
                Submitted by contributors awaiting editor verification, feedback, or publication sign-off.
              </p>
            </div>
          </div>
          <Link
            href="/admin/articles?status=IN_REVIEW"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-high hover:bg-ink-body text-white font-sans font-bold text-xs rounded-xs transition-editorial shrink-0"
          >
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Four Core Metric Cards (Spacious, Un-cramped, High Clarity) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`p-5 bg-editorial-pure rounded-xs border transition-editorial hover:shadow-xs group ${
                kpi.alert
                  ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/20'
                  : 'border-editorial-hairline hover:border-ink-high/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted font-sans">
                  {kpi.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xs border flex items-center justify-center ${kpi.iconBg} ${kpi.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-black font-serif text-ink-high tracking-tight">
                  {kpi.value}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border font-sans ${kpi.badgeStyle}`}
                >
                  {kpi.badge}
                </span>
              </div>

              <p className="text-xs text-ink-muted mt-2 font-sans font-medium">
                {kpi.subtext}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 4. Main Editorial Stories Table (Full Width, Prominent, Highly Legible) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-high font-serif">
              Recent Stories
            </h2>
            <p className="text-xs text-ink-muted font-sans">
              Latest published investigations, in-review drafts, and editorial submissions.
            </p>
          </div>
          <Link
            href="/admin/articles"
            className="text-xs font-bold text-ink-high hover:text-brand-gold flex items-center gap-1 font-sans uppercase tracking-wider transition-editorial"
          >
            <span>View All ({totalArticles})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-editorial-pure rounded-xs border border-editorial-hairline overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-editorial-hairline bg-editorial-sand/60 text-ink-muted font-sans uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">Story Headline</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Author</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Last Updated</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-hairline">
                {recentArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-ink-muted font-sans">
                      No stories found. Click &quot;Draft New Story&quot; above to begin.
                    </td>
                  </tr>
                ) : (
                  recentArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-editorial-sand/30 transition-editorial text-ink-body group"
                    >
                      {/* Story Headline (Clean, no raw slug codes) */}
                      <td className="py-3.5 px-4 max-w-md">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="font-serif font-bold text-sm text-ink-high group-hover:text-brand-gold transition-colors line-clamp-1"
                        >
                          {article.title}
                        </Link>
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-editorial-sand text-[11px] font-sans font-medium text-ink-high border border-editorial-hairline">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: article.category.accentColor || '#F4C542' }}
                            aria-hidden="true"
                          />
                          {article.category.name}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-sans text-ink-body font-medium">
                        {article.author.name}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={article.status as any} />
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-sans text-ink-muted text-[11px]">
                        {formatDate(article.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                        <Link
                          href={`/admin/articles/${article.id}/preview`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xs text-[11px] font-sans font-semibold text-ink-muted hover:text-ink-high hover:bg-editorial-sand border border-transparent hover:border-editorial-hairline transition-editorial"
                          title="Preview Story"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Preview</span>
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xs text-[11px] font-sans font-semibold text-ink-high bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline transition-editorial"
                          title="Edit Story"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Lower Section: Scheduled Releases & Editorial Activity (Balanced 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Scheduled Pipeline */}
        <div className="bg-editorial-pure rounded-xs border border-editorial-hairline p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-editorial-hairline">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-high" />
              <h3 className="font-serif font-bold text-base text-ink-high">
                Scheduled Drops
              </h3>
            </div>
            {scheduledArticles.length > 0 && (
              <Link
                href="/admin/articles?status=SCHEDULED"
                className="text-xs font-bold text-ink-high hover:text-brand-gold font-sans uppercase tracking-wider"
              >
                View ({scheduledArticles.length})
              </Link>
            )}
          </div>

          {scheduledArticles.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted space-y-3 font-sans">
              <div className="w-10 h-10 rounded-xs bg-editorial-sand border border-editorial-hairline flex items-center justify-center mx-auto text-ink-muted">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-ink-high text-xs">No upcoming scheduled releases</p>
                <p className="text-[11px] text-ink-muted max-w-xs mx-auto">
                  Stories scheduled with a future release date will automatically drop via the automated cron.
                </p>
              </div>
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-ink-high font-bold text-xs transition-editorial"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New Story</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scheduledArticles.map((scheduled) => (
                <div
                  key={scheduled.id}
                  className="p-3 bg-editorial-sand/40 border border-editorial-hairline rounded-xs flex items-center justify-between gap-3 hover:border-ink-high/30 transition-editorial"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-amber-800 font-bold">
                        {scheduled.scheduledFor ? formatDate(scheduled.scheduledFor) : 'Upcoming'}
                      </span>
                      <span className="text-ink-muted">&bull;</span>
                      <span className="font-sans text-ink-muted">{scheduled.category.name}</span>
                    </div>
                    <Link
                      href={`/admin/articles/${scheduled.id}/edit`}
                      className="font-serif font-bold text-xs text-ink-high hover:text-brand-gold truncate block"
                    >
                      {scheduled.title}
                    </Link>
                  </div>
                  <Link
                    href={`/admin/articles/${scheduled.id}/edit`}
                    className="px-2 py-1 text-[11px] font-sans font-semibold rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-high shrink-0 hover:bg-editorial-sand"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Review Activity */}
        <div className="bg-editorial-pure rounded-xs border border-editorial-hairline p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-editorial-hairline">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-ink-high" />
              <h3 className="font-serif font-bold text-base text-ink-high">
                Editorial Activity
              </h3>
            </div>
            <span className="text-[11px] font-sans text-ink-muted">
              Recent workflow notes
            </span>
          </div>

          {recentReviewHistory.length === 0 ? (
            <div className="py-6 text-center text-xs text-ink-muted font-sans">
              No recent editorial workflow activity recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviewHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs p-3 rounded-xs bg-editorial-sand/30 border border-editorial-hairline space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans font-semibold text-ink-high truncate">
                      {entry.userName || 'Staff Member'}
                    </span>
                    <span className="text-[10px] text-ink-muted font-sans shrink-0">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>

                  <Link
                    href={`/admin/articles/${entry.article.id}/edit`}
                    className="font-serif font-bold text-xs text-ink-high hover:text-brand-gold line-clamp-1 block"
                  >
                    {entry.article.title}
                  </Link>

                  <div className="flex items-center gap-1.5 text-[11px] text-ink-muted font-sans">
                    <span className="px-1.5 py-0.5 rounded-xs bg-editorial-sand border border-editorial-hairline text-[10px] uppercase font-semibold text-ink-body">
                      {entry.previousStatus} &rarr; {entry.newStatus}
                    </span>
                    {entry.feedback && (
                      <span className="italic text-ink-body truncate">
                        &mdash; &ldquo;{entry.feedback}&rdquo;
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
