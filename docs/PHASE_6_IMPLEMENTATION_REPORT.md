# Phase 6 Implementation Report: Publishing Workflow & Newsletter System

**Saudi Future Tech** — [https://saudifuturetech.com](https://saudifuturetech.com)  
**Publication Focus:** Saudi Arabia’s National Technology Ecosystem, Vision 2030 Transformation, and Global Frontier Innovation.  
**Implementation Phase:** Phase 6 — Editorial Publishing Workflow & Newsletter System  
**Date of Completion:** November 15, 2026  
**Status:** Completed & Production Ready (52/52 E2E Tests Passing)  

---

## Executive Summary

Phase 6 elevates **Saudi Future Tech** into a mature media organization by introducing a multi-tier **Editorial Publishing Workflow** with mandatory feedback loops and audit histories, an **Automated Publishing Scheduler** with atomic concurrency protections, a **Public Newsletter Subscription Engine** with explicit consent and anti-bot rate limiting, and an **Executive Campaign Management & Dispatch** subsystem with full-fidelity email canvas previews.

All capabilities adhere strictly to the approved brand palette:
- **Deep Graphite:** `#25282B` (Primary background, editorial cards, headers)
- **Soft Cloud White:** `#F5F6F3` (Typography, reading canvas, contrast text)
- **Sunshine Yellow:** `#F4C542` (Active markers, editorial badges, primary CTA highlights)

---

## 1. System Deliverables & Architecture

| Module | Core Files | Key Features Delivered |
| :--- | :--- | :--- |
| **Editorial Workflow** | `src/actions/articles.ts`<br/>`src/components/admin/ArticleEditorForm.tsx`<br/>`src/components/admin/ArticleRowActions.tsx` | Contributor drafts, submission to review, editor revision request with required feedback, approved publication, unpublishing, immutable `ArticleReviewHistory` audit trail. |
| **Publishing Scheduler** | `src/lib/scheduler/publisher.ts`<br/>`src/app/api/cron/publish-scheduled/route.ts`<br/>`src/components/admin/TriggerSchedulerButton.tsx` | Schedule future publication dates, atomic transaction concurrency guards, secret-protected cron endpoint, backstage manual trigger button. |
| **Newsletter Engine** | `src/actions/newsletter.ts`<br/>`src/lib/newsletter/rate-limit.ts`<br/>`src/components/public/NewsletterForm.tsx`<br/>`src/app/newsletter/page.tsx` | Explicit consent checkbox, database-backed rate limiting, duplicate handling, secure unsubscription tokens (`crypto.randomUUID()`), dedicated `/newsletter` and `/unsubscribe` pages. |
| **Subscriber Management** | `src/app/admin/subscribers/page.tsx`<br/>`src/components/admin/SubscriberManager.tsx`<br/>`src/app/api/admin/subscribers/export/route.ts` | Filter by status (`ALL`, `ACTIVE`, `UNSUBSCRIBED`), real-time search, reactivate/unsubscribe toggles, authenticated CSV export endpoint (`/api/admin/subscribers/export`). |
| **Campaign Manager** | `src/app/admin/campaigns/page.tsx`<br/>`src/components/admin/CampaignEditorForm.tsx`<br/>`src/app/admin/campaigns/[id]/preview/page.tsx` | Campaign drafting, responsive HTML email canvas preview matching brand typography and colors, safe dispatch with Resend provider fallback. |
| **Admin Dashboard Enhancement** | `src/app/admin/page.tsx` | Real-time PostgreSQL KPIs: Published Stories, Review Queue, Scheduled Releases, Active Drafts, Newsletter Audience, Desks & Authors. Scheduled drops pipeline and audit history feed. |

---

## 2. Database Schema Additions & Migrations

The database was upgraded with migration `20261115120000_phase6_workflow_scheduler_newsletter`:

1. **`Article` Model Additions:**
   - `scheduledFor DateTime?`: Timestamp for automated publication.
   - Index `@@index([status, scheduledFor])`: Optimized cron and dashboard queries.
   - Relation `reviewHistory ArticleReviewHistory[]`: Cascade deletion on article removal.
2. **`ArticleReviewHistory` Model:**
   - Tracks `previousStatus`, `newStatus`, `userId`, `userName`, `userRole`, `feedback`, and `createdAt`.
3. **`NewsletterSubscriber` Model & `SubscriberStatus` Enum:**
   - Enums: `ACTIVE`, `UNSUBSCRIBED`, `BOUNCED`.
   - Fields: `email` (unique), `unsubscribeToken` (unique), `consentGivenAt`, `unsubscribedAt`.
4. **`NewsletterCampaign` Model & `CampaignStatus` Enum:**
   - Enums: `DRAFT`, `SCHEDULED`, `SENDING`, `SENT`, `FAILED`.
   - Fields: `title`, `subject`, `previewText`, `content`, `sentAt`, `recipientCount`, `failureReason`.

---

## 3. Verification & Quality Assurance

### 3.1. Automated Test Suite (`tests/phase6-e2e.ts`)
A dedicated end-to-end verification suite was authored and executed. All **52 tests passed with 0 failures**:
1. **RBAC & Workflow Permissions (7/7 passed):**
   - Verified Super Admin and Editor publishing authority.
   - Verified Author cannot publish directly.
   - Verified Author cannot edit stories belonging to another byline.
   - Verified Editor and Admin can edit across all desks.
2. **Editorial State Machine & History (9/9 passed):**
   - Story created in `DRAFT`.
   - Author submits -> `IN_REVIEW`.
   - Editor requests revisions with mandatory notes -> transitions back to `DRAFT`.
   - Verified feedback message and editor role in `ArticleReviewHistory`.
   - Author resubmits -> `IN_REVIEW`.
   - Editor approves -> `PUBLISHED` with `publishedAt` populated.
   - Editor unpublishes -> returns to `DRAFT`.
3. **Publishing Scheduler & Concurrency Guard (11/11 passed):**
   - Verified past timestamps are flagged and rejected.
   - Article successfully scheduled for future release.
   - Atomic simulation with past timestamp: `publishScheduledArticles()` successfully processes and publishes article, sets `publishedAt`, clears `scheduledFor`, and logs audit record.
   - Concurrency guard: immediate re-run returns `published: 0` (no duplicate publish).
   - Cron Route: unauthenticated request returns `401 Unauthorized`; authenticated request with `CRON_SECRET` returns `200 OK` with JSON execution metrics.
4. **Newsletter Subscriptions & Security (12/12 passed):**
   - Valid subscription creates `ACTIVE` record with unique token and `consentGivenAt`.
   - Rejection without consent verified.
   - Duplicate subscription identifies existing active subscriber.
   - Token-based unsubscription transitions status to `UNSUBSCRIBED`.
   - Re-subscribing with previously unsubscribed email successfully reactivates to `ACTIVE`.
   - CSV export route rejects unauthenticated access with `401`.
5. **Campaigns & Public Routes (13/13 passed):**
   - Campaign draft created and subject verified.
   - Unsubscribe token replacement verified.
   - HTTP 200 OK confirmed for `/`, `/newsletter`, `/unsubscribe?token=...`, `/latest`, `/article/[slug]`, `/category/[slug]`, and `/admin/login`.

---

## 4. Visual Assets & Screenshots

The following interface screenshots were captured at 1440x950 resolution and saved to the project artifact directory:
- [phase6-admin-dashboard.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-admin-dashboard.png): 6-card metric overview, Review Queue alert, Scheduled Drops pipeline, and Review History audit feed.
- [phase6-admin-articles-scheduled.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-admin-articles-scheduled.png): Articles list filtered by the Scheduled tab, showing target drop dates and "Run Scheduler Now" action.
- [phase6-admin-editor-history.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-admin-editor-history.png): Article editor displaying the revision feedback banner and audit timeline.
- [phase6-admin-subscribers.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-admin-subscribers.png): Newsletter subscriber management table, status filters, and CSV export.
- [phase6-admin-campaign-preview.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-admin-campaign-preview.png): Branded executive email preview canvas with unsubscribe placeholder.
- [phase6-newsletter-public.png](file:///Users/rishivarma/.gemini/antigravity/brain/56f98a69-c72d-4184-9e8d-afcb58c4c2e6/phase6-newsletter-public.png): Public `/newsletter` page with value proposition and explicit consent form.

