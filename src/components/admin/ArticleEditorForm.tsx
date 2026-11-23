'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
          setSuccessMsg('Draft saved.');
          if (isNew && result.articleId) {
            router.push(`/admin/articles/${result.articleId}/edit`);
          }
        }
      } catch {
        setErrorMsg("We couldn't save this. Try again.");
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
        setSuccessMsg('Submitted for review.');
        router.refresh();
      }
    });
  };

  const handleConfirmRequestRevisions = () => {
    if (!initialData?.id) return;
    if (!revisionFeedback.trim()) {
      setErrorMsg('Add a note so the author knows what to change.');
      return;
    }
    setErrorMsg(null);
    setShowRevisionModal(false);

    startTransition(async () => {
      const res = await requestRevisionsAction(initialData.id, revisionFeedback);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Sent back to the author with your notes.');
        setRevisionFeedback('');
        router.refresh();
      }
    });
  };

  const handlePublishNow = () => {
    if (!initialData?.id) return;
    if (confirm('Publish this article now? It will go live on the site immediately.')) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await publishArticleAction(initialData.id);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Published. The article is now live.');
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
        setSuccessMsg('Scheduled.');
        router.refresh();
      }
    });
  };

  const handleUnpublish = () => {
    if (!initialData?.id) return;
    if (confirm('Move this article back to draft? It will be removed from the public site.')) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await unpublishArticleAction(initialData.id);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Moved back to draft.');
          router.refresh();
        }
      });
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const showPublish = canPublish && !isNew && currentStatus !== 'PUBLISHED';
  const showSubmit = !isNew && currentStatus === 'DRAFT';
  // One filled button per view: Publish if available, then Submit for review, else Save draft.
  const saveIsPrimary = !showPublish && !showSubmit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 border-b border-rule">
        <div className="min-w-0">
          <Link href="/admin/articles" className="meta hover:text-ink transition-colors">
            ← Articles
          </Link>
          <h1 className="mt-2 font-serif text-display-sm text-ink line-clamp-2">
            {isNew ? 'New article' : title || 'Untitled article'}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge status={currentStatus as any} />
            {initialData?.scheduledFor && currentStatus === 'SCHEDULED' && (
              <span className="font-sans text-[0.71875rem] text-ink-3 tabular">
                for {formatDate(initialData.scheduledFor)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {!isNew && initialData?.id && (
            <Link href={`/admin/articles/${initialData.id}/preview`} className="row-action">
              Preview
            </Link>
          )}
          <Button
            type="button"
            variant={saveIsPrimary ? 'primary' : 'secondary'}
            size="md"
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending ? 'Saving…' : 'Save draft'}
          </Button>
        </div>
      </div>

      {/* Revision notes from an editor */}
      {latestRevision && currentStatus === 'DRAFT' && (
        <div className="border-l-2 border-clay pl-4 py-1 max-w-3xl">
          <p className="text-[0.8125rem] text-ink">
            Changes requested by {latestRevision.userName || 'an editor'}
            <span className="ml-2 font-sans text-[0.6875rem] text-ink-4">{formatDate(latestRevision.createdAt)}</span>
          </p>
          <p className="mt-1 font-serif text-[1.0625rem] leading-relaxed text-ink-2">&ldquo;{latestRevision.feedback}&rdquo;</p>
          <p className="mt-1 text-[0.8125rem] text-ink-3">Make the changes, then submit for review again.</p>
        </div>
      )}

      {isAuthor && currentStatus === 'IN_REVIEW' && (
        <p className="border-l-2 border-clay pl-3 text-sm text-ink-2">
          This article is waiting for an editor. You can keep editing while it&rsquo;s in review.
        </p>
      )}

      {errorMsg && (
        <p role="alert" className="border-l-2 border-clay pl-3 text-sm text-ink-2">
          {errorMsg}
        </p>
      )}

      {successMsg && (
        <p role="status" className="border-l-2 border-moss pl-3 text-sm text-ink-2">
          {successMsg}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <label htmlFor="title" className="field-label">
              Headline <span className="text-ink-4">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="What happened, in one line"
              className="field font-serif !text-[1.5rem] leading-tight !py-2.5"
              required
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="slug" className="field-label">
                Slug <span className="text-ink-4">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[0.75rem] text-ink-3 hover:text-clay transition-colors"
              >
                {autoSlug ? 'From headline · edit manually' : 'Editing manually'}
              </button>
            </div>
            <div className="flex items-stretch">
              <span className="inline-flex items-center px-3 border border-r-0 border-rule bg-paper-band rounded-l-sm font-sans text-[0.75rem] text-ink-3">
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
                className="field font-sans !text-[0.8125rem] !rounded-l-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="field-label">
              Standfirst <span className="text-ink-4">*</span>
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Two or three sentences that tell the reader why this matters."
              className="field font-serif !text-[1.0625rem] !leading-relaxed"
              required
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="content" className="field-label">
                Body <span className="text-ink-4">*</span>
              </label>
              <span className="font-sans text-[0.6875rem] text-ink-3 tabular">
                {wordCount} words · ~{calculatedReadingTime} min read
              </span>
            </div>
            <textarea
              id="content"
              rows={22}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing. Leave a blank line between paragraphs."
              className="field font-serif !text-[1.0625rem] !leading-[1.75] !px-5 !py-4"
              required
            />
            <p className="field-hint">
              Blank line = new paragraph. Start a line with <code className="font-mono">##</code> for a section heading,{' '}
              <code className="font-mono">###</code> for a subheading, <code className="font-mono">&gt;</code> for a quote.
            </p>
          </div>

          {initialData?.reviewHistory && initialData.reviewHistory.length > 0 && (
            <section className="pt-2">
              <div className="flex items-baseline justify-between border-t-2 border-ink pt-3 pb-2">
                <h2 className="font-serif text-[1.25rem] text-ink">History</h2>
                <span className="font-sans text-[0.6875rem] text-ink-4 tabular">
                  {initialData.reviewHistory.length} {initialData.reviewHistory.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
              <ul>
                {initialData.reviewHistory.map((item) => (
                  <li key={item.id} className="py-3 border-b border-rule">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StatusBadge status={item.previousStatus as any} />
                        <span className="text-ink-4 text-xs" aria-hidden>
                          →
                        </span>
                        <StatusBadge status={item.newStatus as any} />
                        <span className="ml-2 text-[0.8125rem] text-ink">{item.userName || 'System'}</span>
                        {item.userRole && (
                          <span className="font-sans text-[0.6875rem] text-ink-4">
                            {item.userRole.replace('_', ' ').toLowerCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-sans text-[0.6875rem] text-ink-4 tabular">{formatDate(item.createdAt)}</span>
                    </div>
                    {item.feedback && (
                      <p className="mt-1.5 text-[0.875rem] italic text-ink-3 leading-relaxed">&ldquo;{item.feedback}&rdquo;</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Publishing */}
          <section className="panel p-5">
            <h2 className="panel-title">Publishing</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
              <dt className="text-ink-3">Status</dt>
              <dd>
                <StatusBadge status={currentStatus as any} />
              </dd>
              {initialData?.scheduledFor && currentStatus === 'SCHEDULED' && (
                <>
                  <dt className="text-ink-3">Goes live</dt>
                  <dd className="font-sans text-[0.75rem] text-ink tabular">{formatDate(initialData.scheduledFor)}</dd>
                </>
              )}
              <dt className="text-ink-3">Length</dt>
              <dd className="font-sans text-[0.75rem] text-ink-2 tabular">~{calculatedReadingTime} min read</dd>
            </dl>

            {isNew ? (
              <p className="mt-4 pt-4 border-t border-rule text-[0.8125rem] text-ink-3 leading-relaxed">
                Save the draft first. Then you can submit it for review, schedule it or publish it.
              </p>
            ) : (
              <div className="mt-4 pt-4 border-t border-rule flex flex-col gap-2">
                {showPublish && (
                  <Button type="button" variant="primary" size="md" disabled={isPending} onClick={handlePublishNow} className="w-full">
                    Publish now
                  </Button>
                )}

                {showSubmit && (
                  <Button
                    type="button"
                    variant={showPublish ? 'outline' : 'primary'}
                    size="md"
                    disabled={isPending}
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full"
                  >
                    Submit for review
                  </Button>
                )}

                {canPublish && (currentStatus === 'DRAFT' || currentStatus === 'IN_REVIEW') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isPending}
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full"
                  >
                    Schedule…
                  </Button>
                )}

                {canPublish && currentStatus === 'IN_REVIEW' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isPending}
                    onClick={() => setShowRevisionModal(true)}
                    className="w-full"
                  >
                    Request changes…
                  </Button>
                )}

                {canPublish && currentStatus === 'PUBLISHED' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isPending}
                    onClick={handleUnpublish}
                    className="w-full !text-clay hover:!border-clay"
                  >
                    Unpublish
                  </Button>
                )}

                {!canPublish && !showSubmit && (
                  <p className="text-[0.8125rem] text-ink-3 leading-relaxed">
                    An editor publishes or schedules this article.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Section & author */}
          <section className="panel p-5 space-y-4">
            <h2 className="panel-title">Section &amp; author</h2>
            <div>
              <label htmlFor="categoryId" className="field-label">
                Section
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="authorId" className="field-label">
                Author
              </label>
              {currentUser.role === 'AUTHOR' ? (
                <>
                  <p id="authorId" className="text-sm text-ink py-1">
                    {authors.find((a) => a.id === authorId)?.name || currentUser.name}
                  </p>
                  <p className="field-hint !mt-0.5">Authors publish under their own byline.</p>
                </>
              ) : (
                <select
                  id="authorId"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="field"
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
          </section>

          {/* Tags */}
          <section className="panel p-5">
            <h2 className="panel-title">Tags</h2>
            <div className="mt-3">
              <label htmlFor="tags" className="field-label">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Cloud, Fintech"
                className="field"
              />
              <p className="field-hint">Separate with commas.</p>
            </div>
          </section>

          {/* Placement */}
          <section className="panel p-5">
            <h2 className="panel-title">Placement</h2>
            <div className="mt-3 space-y-2.5">
              <label className="flex items-start gap-2.5 text-sm text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-0.5 accent-[#A63D24]"
                />
                <span>
                  Lead story
                  <span className="block text-[0.75rem] text-ink-3">Top of the homepage</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditorsPick}
                  onChange={(e) => setIsEditorsPick(e.target.checked)}
                  className="mt-0.5 accent-[#A63D24]"
                />
                <span>Editor&rsquo;s pick</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-ink-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="mt-0.5 accent-[#A63D24]"
                />
                <span>Trending</span>
              </label>
            </div>
          </section>

          {/* Cover image */}
          <section className="panel p-5 space-y-4">
            <h2 className="panel-title">Cover image</h2>
            <div>
              <label htmlFor="coverImage" className="field-label">
                Cover image URL <span className="text-ink-4">*</span>
              </label>
              <input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://"
                className="field font-sans !text-[0.75rem]"
                required
              />
            </div>

            {coverImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-band">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={coverImageAlt || 'Cover preview'}
                  className="w-full h-full object-cover img-warm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
            )}

            <div>
              <label htmlFor="coverImageAlt" className="field-label">
                Alt text
              </label>
              <input
                id="coverImageAlt"
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="What the image shows"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="coverImageCaption" className="field-label">
                Caption
              </label>
              <input
                id="coverImageCaption"
                type="text"
                value={coverImageCaption}
                onChange={(e) => setCoverImageCaption(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="imageCredit" className="field-label">
                Credit
              </label>
              <input
                id="imageCredit"
                type="text"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
                placeholder="Photographer / agency"
                className="field"
              />
            </div>
          </section>

          {/* SEO */}
          <section className="panel p-5 space-y-4">
            <h2 className="panel-title">Search &amp; sharing</h2>
            <div>
              <label htmlFor="seoTitle" className="field-label">
                SEO title
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Uses the headline if blank'}
                className="field"
              />
              <p className="field-hint">
                <span className="font-sans tabular">{seoTitle.length}</span> characters · aim for under 60
              </p>
            </div>

            <div>
              <label htmlFor="seoDescription" className="field-label">
                SEO description
              </label>
              <textarea
                id="seoDescription"
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || 'Uses the standfirst if blank'}
                className="field"
              />
              <p className="field-hint">
                <span className="font-sans tabular">{seoDescription.length}</span> characters · aim for under 160
              </p>
            </div>
          </section>
        </aside>
      </div>

      {/* Submit for review */}
      {showSubmitModal && (
        <EditorDialog title="Submit for review" onClose={() => setShowSubmitModal(false)}>
          <p className="text-sm text-ink-3 leading-relaxed">
            An editor will read it and either publish it or send it back with notes.
          </p>
          <div>
            <label htmlFor="submit-notes" className="field-label">
              Note for the editor <span className="font-normal text-ink-4">(optional)</span>
            </label>
            <textarea
              id="submit-notes"
              rows={3}
              value={authorSubmitNotes}
              onChange={(e) => setAuthorSubmitNotes(e.target.value)}
              placeholder="Anything they should check first"
              className="field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={isPending} onClick={handleConfirmSubmitForReview}>
              {isPending ? 'Submitting…' : 'Submit for review'}
            </Button>
          </div>
        </EditorDialog>
      )}

      {/* Request changes */}
      {showRevisionModal && (
        <EditorDialog title="Request changes" onClose={() => setShowRevisionModal(false)}>
          <p className="text-sm text-ink-3 leading-relaxed">
            The article goes back to draft. The author sees your note at the top of the editor.
          </p>
          <div>
            <label htmlFor="revision-notes" className="field-label">
              What needs to change
            </label>
            <textarea
              id="revision-notes"
              rows={4}
              required
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder="Check the figure in section two and add a photo credit."
              className="field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRevisionModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPending || !revisionFeedback.trim()}
              onClick={handleConfirmRequestRevisions}
            >
              {isPending ? 'Sending…' : 'Send back to author'}
            </Button>
          </div>
        </EditorDialog>
      )}

      {/* Schedule */}
      {showScheduleModal && (
        <EditorDialog title="Schedule" onClose={() => setShowScheduleModal(false)}>
          <div>
            <label htmlFor="schedule-at" className="field-label">
              Publish on
            </label>
            <input
              id="schedule-at"
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              className="field font-sans"
            />
            <p className="field-hint">Your local time. The scheduler publishes it when the time arrives.</p>
          </div>
          <div>
            <label htmlFor="schedule-notes" className="field-label">
              Note <span className="font-normal text-ink-4">(optional)</span>
            </label>
            <input
              id="schedule-notes"
              type="text"
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Embargoed until 09:00"
              className="field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={isPending} onClick={handleConfirmSchedule}>
              {isPending ? 'Scheduling…' : 'Schedule'}
            </Button>
          </div>
        </EditorDialog>
      )}
    </div>
  );
}

function EditorDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-paper-sheet border border-rule shadow-lift rounded-sm p-6 max-w-md w-full space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-[1.375rem] text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
