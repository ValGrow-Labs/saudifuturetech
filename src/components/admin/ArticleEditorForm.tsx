'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  ArrowDownCircle,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Loader2,
  Clock,
  Eye,
  Calendar,
  MessageSquare,
  History,
  X,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthenticatedUser } from '@/lib/auth/guard';
import {
  createArticleAction,
  updateArticleAction,
  submitForReviewAction,
  requestRevisionsAction,
  publishArticleAction,
  scheduleArticleAction,
  unpublishArticleAction,
} from '@/actions/articles';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface AuthorOption {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewHistoryItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  userName: string | null;
  userRole: string | null;
  feedback: string | null;
  createdAt: Date;
}

interface ArticleEditorFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    coverImageAlt?: string | null;
    coverImageCaption?: string | null;
    imageCredit?: string | null;
    status: string;
    featured: boolean;
    isEditorsPick: boolean;
    isTrending: boolean;
    readingTime: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    scheduledFor?: Date | null;
    authorId: string;
    categoryId: string;
    tags?: string[];
    reviewHistory?: ReviewHistoryItem[];
  };
  categories: CategoryOption[];
  authors: AuthorOption[];
  currentUser: AuthenticatedUser;
  isNew?: boolean;
}

export function ArticleEditorForm({
  initialData,
  categories,
  authors,
  currentUser,
  isNew = false,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [authorId, setAuthorId] = useState(
    initialData?.authorId ||
      (currentUser.role === 'AUTHOR' && currentUser.authorId ? currentUser.authorId : authors[0]?.id || '')
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  );
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.coverImageAlt || '');
  const [coverImageCaption, setCoverImageCaption] = useState(initialData?.coverImageCaption || '');
  const [imageCredit, setImageCredit] = useState(initialData?.imageCredit || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [isEditorsPick, setIsEditorsPick] = useState(initialData?.isEditorsPick || false);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Modal Dialog States
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const defaultFutureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [scheduleDateTime, setScheduleDateTime] = useState(
    initialData?.scheduledFor ? new Date(initialData.scheduledFor).toISOString().slice(0, 16) : defaultFutureDate
  );
  const [scheduleNotes, setScheduleNotes] = useState('');

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [authorSubmitNotes, setAuthorSubmitNotes] = useState('');

  const canPublish = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'EDITOR';
  const isAuthor = currentUser.role === 'AUTHOR';
  const currentStatus = initialData?.status || 'DRAFT';

  // Find latest revision feedback if in DRAFT and was returned by editor
  const latestRevision = initialData?.reviewHistory?.find(
    (h) => h.newStatus === 'DRAFT' && h.previousStatus === 'IN_REVIEW' && h.feedback
  );

  // Live reading time calculation
  const calculatedReadingTime = Math.max(1, Math.ceil((content.trim().split(/\s+/).length || 1) / 200));

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSave = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    if (!isNew && initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('categoryId', categoryId);
    formData.append('authorId', authorId);
    formData.append('coverImage', coverImage);
    formData.append('coverImageAlt', coverImageAlt);
    formData.append('coverImageCaption', coverImageCaption);
    formData.append('imageCredit', imageCredit);
    formData.append('tags', tags);
    formData.append('featured', String(featured));
    formData.append('isEditorsPick', String(isEditorsPick));
    formData.append('isTrending', String(isTrending));
    formData.append('seoTitle', seoTitle);
    formData.append('seoDescription', seoDescription);
    formData.append('actionType', isNew ? 'draft' : 'save');

    startTransition(async () => {
      try {
        const result = isNew
          ? await createArticleAction(undefined, formData)
          : await updateArticleAction(undefined, formData);

        if (result?.error) {
          setErrorMsg(result.error);
        } else if (result?.success) {
          setSuccessMsg('Story draft saved successfully.');
          if (isNew && result.articleId) {
            router.push(`/admin/articles/${result.articleId}/edit`);
          }
        }
      } catch {
        setErrorMsg('An unexpected error occurred while saving.');
      }
    });
  };

  const handleConfirmSubmitForReview = () => {
    if (!initialData?.id) return;
    setErrorMsg(null);
    setShowSubmitModal(false);

    startTransition(async () => {
      const res = await submitForReviewAction(initialData.id, authorSubmitNotes);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Story submitted for editorial review.');
        router.refresh();
      }
    });
  };

  const handleConfirmRequestRevisions = () => {
    if (!initialData?.id) return;
    if (!revisionFeedback.trim()) {
      setErrorMsg('Editorial feedback is required when requesting revisions.');
      return;
    }
    setErrorMsg(null);
    setShowRevisionModal(false);

    startTransition(async () => {
      const res = await requestRevisionsAction(initialData.id, revisionFeedback);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Article returned to author with revision feedback.');
        setRevisionFeedback('');
        router.refresh();
      }
    });
  };

  const handlePublishNow = () => {
    if (!initialData?.id) return;
    if (confirm('Publish this story immediately to the live public site?')) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await publishArticleAction(initialData.id);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Story published live to saudifuturetech.com!');
          router.refresh();
        }
      });
    }
  };

  const handleConfirmSchedule = () => {
    if (!initialData?.id) return;
    setErrorMsg(null);
    setShowScheduleModal(false);

    startTransition(async () => {
      const res = await scheduleArticleAction(initialData.id, scheduleDateTime, scheduleNotes);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Story successfully scheduled for publication.`);
        router.refresh();
      }
    });
  };

  const handleUnpublish = () => {
    if (!initialData?.id) return;
    if (confirm('Revert this article to DRAFT? It will be removed immediately from public access.')) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await unpublishArticleAction(initialData.id);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Story reverted to draft.');
          router.refresh();
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Workflow Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sft">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded-sm bg-brand-dark hover:bg-brand-surface border border-sft text-sft-text-muted hover:text-brand-cloud transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-yellow" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <StatusBadge status={currentStatus as any} />
              {initialData?.scheduledFor && currentStatus === 'SCHEDULED' && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-xs border border-amber-500/30">
                  Scheduled for {formatDate(initialData.scheduledFor)}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-cloud font-heading tracking-tight">
              {isNew ? 'Create New Editorial Report' : title || 'Untitled Story'}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && initialData?.id && (
            <Link
              href={`/admin/articles/${initialData.id}/preview`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-brand-dark hover:bg-brand-surface border border-sft text-brand-cloud text-xs font-heading font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Preview Canvas</span>
            </Link>
          )}

          {/* Save Draft */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={handleSave}
            className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </Button>

          {/* Submit for Review (if in DRAFT) */}
          {!isNew && currentStatus === 'DRAFT' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setShowSubmitModal(true)}
              className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5 text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </Button>
          )}

          {/* Request Revisions (Editor/SuperAdmin only when IN_REVIEW) */}
          {canPublish && !isNew && currentStatus === 'IN_REVIEW' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setShowRevisionModal(true)}
              className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5 text-rose-400 border-rose-500/40 hover:bg-rose-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revisions</span>
            </Button>
          )}

          {/* Schedule Publication (Editor/SuperAdmin) */}
          {canPublish && !isNew && (currentStatus === 'DRAFT' || currentStatus === 'IN_REVIEW') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setShowScheduleModal(true)}
              className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5 text-sky-400 border-sky-500/40 hover:bg-sky-500/10"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </Button>
          )}

          {/* Publish / Unpublish (Editor/SuperAdmin) */}
          {canPublish && !isNew && (
            <>
              {currentStatus === 'PUBLISHED' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleUnpublish}
                  className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5 text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Unpublish to Draft</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  onClick={handlePublishNow}
                  className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5 bg-brand-yellow text-brand-graphite hover:bg-brand-yellow/90"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Story</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Editor Revision Feedback Alert Box (For Author / Editor awareness) */}
      {latestRevision && currentStatus === 'DRAFT' && (
        <div className="p-4 bg-amber-500/10 border-l-4 border-brand-yellow rounded-r-sm text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-brand-yellow font-bold font-heading uppercase tracking-wider text-[11px]">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Editorial Revision Requested by {latestRevision.userName || 'Editor'}</span>
            <span className="text-sft-text-muted font-mono font-normal">
              ({formatDate(latestRevision.createdAt)})
            </span>
          </div>
          <p className="text-brand-cloud font-sans text-xs sm:text-sm leading-relaxed pl-6">
            &ldquo;{latestRevision.feedback}&rdquo;
          </p>
          <p className="text-[11px] text-sft-text-muted pl-6">
            Please make the requested updates to your analysis, then click <strong>Submit for Review</strong>.
          </p>
        </div>
      )}

      {/* In-Review Queue Notice for Authors */}
      {isAuthor && currentStatus === 'IN_REVIEW' && (
        <div className="p-3.5 bg-sky-500/10 border border-sky-500/30 rounded-sm text-xs text-sky-200 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            This report is currently in the <strong>Editorial Review Queue</strong> awaiting desk review. You can continue updating your draft if needed.
          </span>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-sm text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-heading uppercase tracking-wide text-[11px] block">Error</span>
            <p className="font-sans text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-sm text-xs text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-heading uppercase tracking-wide text-[11px] block">Success</span>
            <p className="font-sans text-emerald-300">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (Content, SEO, Review History) & Right Column (Pillar, Placement, Artwork) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Story Headline <span className="text-brand-yellow">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Inside Saudi Arabia's Sovereign Compute Blueprint..."
                className="w-full bg-brand-dark border border-sft rounded-sm px-3.5 py-2.5 text-base sm:text-lg font-bold font-heading text-brand-cloud placeholder-sft-text-muted/60 focus:outline-none focus:border-brand-yellow transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                  URL Slug <span className="text-brand-yellow">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[10px] font-mono text-brand-yellow hover:underline cursor-pointer"
                >
                  {autoSlug ? 'Auto-generating from title (Click to unlock)' : 'Manual slug editing'}
                </button>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-brand-dark border border-r-0 border-sft rounded-l-sm text-xs font-mono text-sft-text-muted">
                  /article/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  className="flex-1 bg-brand-dark border border-sft rounded-r-sm px-3 py-2 text-xs font-mono text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors"
                  required
                />
              </div>
            </div>

            {/* Standfirst / Excerpt */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="excerpt" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Editorial Standfirst / Subtitle <span className="text-brand-yellow">*</span>
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A high-level 2-3 sentence overview of key findings, strategic context, and technical analysis..."
                className="w-full bg-brand-dark border border-sft rounded-sm p-3 text-xs sm:text-sm font-sans text-brand-cloud placeholder-sft-text-muted/60 focus:outline-none focus:border-brand-yellow transition-colors leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Main Body Content Editor */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Full Article Text & Analysis <span className="text-brand-yellow">*</span>
              </label>
              <span className="text-[11px] font-mono text-sft-text-muted">
                ~{calculatedReadingTime} min read ({content.trim().split(/\s+/).filter(Boolean).length} words)
              </span>
            </div>

            <textarea
              id="content"
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or paste full editorial report markdown/paragraphs here. Double line breaks represent new paragraphs..."
              className="w-full bg-brand-dark border border-sft rounded-sm p-4 text-xs sm:text-sm font-mono text-brand-cloud placeholder-sft-text-muted/60 focus:outline-none focus:border-brand-yellow transition-colors leading-relaxed"
              required
            />
            <p className="text-[11px] text-sft-text-muted">
              Tip: Use double line-breaks to separate paragraphs. Headings starting with ## are rendered as architectural section breaks.
            </p>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-brand-yellow uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Search Engine Optimization (SEO) Metadata</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seoTitle" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                SEO Meta Title
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Leave blank to use story headline'}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted/60 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seoDescription" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                SEO Meta Description
              </label>
              <textarea
                id="seoDescription"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || 'Leave blank to use standfirst'}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted/60 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>
          </div>

          {/* Editorial Review History Audit Log */}
          {initialData?.reviewHistory && initialData.reviewHistory.length > 0 && (
            <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-heading text-brand-yellow uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Editorial Review History ({initialData.reviewHistory.length})</span>
              </div>

              <div className="space-y-3 divide-y divide-sft/40">
                {initialData.reviewHistory.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-1 text-xs font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-xs bg-brand-dark border border-sft text-brand-cloud font-bold">
                          {item.previousStatus} &rarr; {item.newStatus}
                        </span>
                        <span className="font-bold text-brand-cloud font-heading">{item.userName || 'System'}</span>
                        {item.userRole && (
                          <span className="text-[10px] text-sft-text-muted uppercase font-mono">
                            ({item.userRole})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-sft-text-muted font-mono">{formatDate(item.createdAt)}</span>
                    </div>
                    {item.feedback && (
                      <p className="text-sft-text-body bg-brand-dark/50 p-2.5 rounded-sm border border-sft/60 leading-relaxed font-sans text-xs mt-1">
                        &ldquo;{item.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Categorization & Byline */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              Editorial Pillar & Byline
            </h3>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Category Pillar <span className="text-brand-yellow">*</span>
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Byline */}
            <div className="space-y-1.5">
              <label htmlFor="authorId" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Author Byline <span className="text-brand-yellow">*</span>
              </label>
              {currentUser.role === 'AUTHOR' ? (
                <div className="p-2.5 bg-brand-dark border border-sft rounded-sm text-xs text-brand-cloud">
                  <div className="font-bold">{authors.find((a) => a.id === authorId)?.name || currentUser.name}</div>
                  <div className="text-[10px] text-brand-yellow font-mono mt-0.5">Locked to your verified Author profile</div>
                </div>
              ) : (
                <select
                  id="authorId"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud focus:outline-none focus:border-brand-yellow transition-colors"
                  required
                >
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Taxonomy Tags */}
            <div className="space-y-1.5">
              <label htmlFor="tags" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Taxonomy Tags (Comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. AI, Sovereign Cloud, Vision 2030"
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>
          </div>

          {/* Editorial Curation Toggles */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              Placement Flags
            </h3>

            <label className="flex items-center gap-2.5 text-xs text-brand-cloud cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded-xs border-sft bg-brand-dark text-brand-yellow focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-heading font-bold">Featured Lead Story (Homepage Hero)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-brand-cloud cursor-pointer">
              <input
                type="checkbox"
                checked={isEditorsPick}
                onChange={(e) => setIsEditorsPick(e.target.checked)}
                className="rounded-xs border-sft bg-brand-dark text-brand-yellow focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-heading font-bold">Editor’s Pick Badge</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-brand-cloud cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="rounded-xs border-sft bg-brand-dark text-brand-yellow focus:ring-0 focus:ring-offset-0"
              />
              <span className="font-heading font-bold">Trending Analysis</span>
            </label>
          </div>

          {/* Media & Artwork */}
          <div className="bg-brand-surface rounded-sm border border-sft p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              Hero Artwork & Photography
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="coverImage" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Cover Image URL <span className="text-brand-yellow">*</span>
              </label>
              <input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors font-mono"
                required
              />
            </div>

            {/* Thumbnail Preview */}
            {coverImage && (
              <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden border border-sft bg-brand-dark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={coverImageAlt || 'Cover preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="coverImageAlt" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Alt Text (Accessibility)
              </label>
              <input
                id="coverImageAlt"
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Description of visual elements..."
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="coverImageCaption" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Photo Caption
              </label>
              <input
                id="coverImageCaption"
                type="text"
                value={coverImageCaption}
                onChange={(e) => setCoverImageCaption(e.target.value)}
                placeholder="e.g. Server rack topology inside King Abdulaziz City..."
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="imageCredit" className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Photo Attribution / Credit
              </label>
              <input
                id="imageCredit"
                type="text"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
                placeholder="e.g. SPA / Saudi Future Tech"
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-2 text-xs text-brand-cloud placeholder-sft-text-muted focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Author Submit for Review Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-brand-surface border border-brand-yellow/40 rounded-sm p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sft pb-3">
              <h3 className="text-sm font-bold uppercase font-heading text-brand-yellow">
                Submit Story for Editorial Review
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-sft-text-muted hover:text-brand-cloud">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-sft-text-muted leading-relaxed">
              Your article will be placed into the Section Editor queue for evaluation and approval. You may include an optional note for the editing desk:
            </p>
            <textarea
              rows={3}
              value={authorSubmitNotes}
              onChange={(e) => setAuthorSubmitNotes(e.target.value)}
              placeholder="e.g. Ready for review. Source attribution verified with Ministry of Communications."
              className="w-full bg-brand-dark border border-sft rounded-sm p-2.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-sft">
              <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={handleConfirmSubmitForReview}
                className="text-xs font-heading uppercase"
              >
                {isPending ? 'Submitting...' : 'Confirm Submission'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Revisions Dialog (Editor) */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-brand-surface border border-rose-500/40 rounded-sm p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sft pb-3">
              <h3 className="text-sm font-bold uppercase font-heading text-rose-400">
                Request Revisions from Author
              </h3>
              <button onClick={() => setShowRevisionModal(false)} className="text-sft-text-muted hover:text-brand-cloud">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-sft-text-muted leading-relaxed">
              The article will return to <strong>DRAFT</strong> status. The author will see your feedback immediately at the top of their editor screen:
            </p>
            <textarea
              rows={4}
              required
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder="e.g. Please verify the compute budget figure cited in Section 2, and add the missing photo attribution."
              className="w-full bg-brand-dark border border-sft rounded-sm p-2.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-sft">
              <Button variant="outline" size="sm" onClick={() => setShowRevisionModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isPending || !revisionFeedback.trim()}
                onClick={handleConfirmRequestRevisions}
                className="text-xs font-heading uppercase bg-rose-500 hover:bg-rose-600 text-white"
              >
                {isPending ? 'Sending...' : 'Send Revision Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule Publication Dialog (Editor) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-brand-surface border border-sky-500/40 rounded-sm p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sft pb-3">
              <h3 className="text-sm font-bold uppercase font-heading text-sky-400">
                Schedule Article Publication
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-sft-text-muted hover:text-brand-cloud">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Future Publication Date & Time (UTC / Local)
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="w-full bg-brand-dark border border-sft rounded-sm p-2 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-sft-text-muted font-heading">
                Optional Editorial Notes
              </label>
              <input
                type="text"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                placeholder="e.g. Embargoed until SPA press release at 09:00 UTC."
                className="w-full bg-brand-dark border border-sft rounded-sm p-2 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-sft">
              <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={handleConfirmSchedule}
                className="text-xs font-heading uppercase bg-sky-500 hover:bg-sky-600 text-white"
              >
                {isPending ? 'Scheduling...' : 'Confirm Schedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
