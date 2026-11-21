# Executive Newsletter System & Campaign Distribution Guide

**Saudi Future Tech** — [https://saudifuturetech.com](https://saudifuturetech.com)  
**Publication Focus:** Technology news, sovereign computing, AI, and Vision 2030 developments.  
**System Component:** Audience Subscription Engine, Consent Verification, and Campaign Dispatch

---

## 1. Overview & Objectives

The Saudi Future Tech Executive Newsletter delivers weekly technology intelligence directly to enterprise leaders, government officials, investors, and researchers across the Kingdom.

The system is designed with rigorous privacy and regulatory compliance standards:
1. **Explicit Opt-in Consent:** Subscribers must verify agreement to receive executive intelligence before an email is accepted.
2. **Anti-Bot Rate Limiting:** Subscription endpoints enforce IP/identifier limits (5 submissions per 10 minutes) using PostgreSQL rate limiting records.
3. **One-Click Unsubscribe Tokens:** Every subscriber is assigned a unique, cryptographically random unsubscribe token (`crypto.randomUUID()`). Email recipients can unsubscribe with one click without needing to log in.
4. **Resend Email Integration:** Reliable transactional and campaign delivery via Resend API, with graceful offline development fallbacks.
5. **Audience Administration:** Full subscriber lifecycle controls, status toggling, deletion, and CSV export for staff.

---

## 2. Public Subscription Touchpoints

Subscribers can opt in from three prominent locations across the website:
1. **Homepage Newsletter Banner (`src/components/public/NewsletterBanner.tsx`):** High-impact dark graphite section positioned between featured reports and the latest story grid.
2. **Dedicated Landing Page (`/newsletter`):** Full-page executive overview detailing publication coverage pillars (Foundation Models, Cognitive Infrastructure, Green Hydrogen, Regulated Sandboxes) and executive editorial standards.
3. **Site Footer (`src/components/public/SiteFooter.tsx`):** Persistent, compact subscription form at the base of every page on `saudifuturetech.com`.

### Subscription Validation Rules
- **Email:** Standard RFC 5322 regex validation, maximum 254 characters, lowercase trimmed.
- **Consent:** Required checkbox. Omitting consent returns: *"You must agree to receive the executive briefing to subscribe."*
- **Duplicates:**
  - If email is already `ACTIVE`: informs the reader they are already subscribed.
  - If email is `UNSUBSCRIBED`: reactivates the account to `ACTIVE`, updates `consentGivenAt`, and clears `unsubscribedAt`.

---

## 3. Unsubscription & Preference Management

Every dispatched briefing includes an unsubscription link:
```
https://saudifuturetech.com/unsubscribe?token=<SECURE_TOKEN>
```

When clicked:
1. The user lands on the dedicated `/unsubscribe` page.
2. The page verifies the token in the database.
3. Clicking **Confirm Unsubscribe** transitions the subscriber to `UNSUBSCRIBED` status and timestamps `unsubscribedAt`.
4. The user is displayed a clean confirmation state with an option to re-subscribe if performed by mistake.

---

## 4. Backstage Subscriber Management (`/admin/subscribers`)

Accessible to Editors and Super Admins:
- **Filter Tabs:** All Subscribers, Active (default), Unsubscribed.
- **Search Bar:** Real-time email search.
- **Actions:**
  - `Mark Unsubscribed` / `Reactivate`: Toggles status without deleting history.
  - `Delete`: Permanently purges subscriber from database.
- **CSV Export:** `/api/admin/subscribers/export`
  - Restricts access to authenticated staff (`SUPER_ADMIN`, `EDITOR`).
  - Exports a structured CSV with headers: `ID`, `Email`, `Status`, `Consent Given Date`, `Subscribed Date`, `Unsubscribed Date`.
  - Automatically triggers an attachment download titled `sft-active-subscribers-YYYY-MM-DD.csv`.

---

## 5. Campaign Creation & Dispatch (`/admin/campaigns`)

### Campaign Workflow
1. **Drafting (`/admin/campaigns/new`):**
   - Internal campaign title
   - Email subject line
   - Preview text (inbox preheader)
   - Article content / Executive commentary
2. **Canvas Preview (`/admin/campaigns/[id]/preview`):**
   - Renders the exact responsive HTML email canvas matching Saudi Future Tech's brand identity.
   - Deep Graphite header banner with Sunshine Yellow brand mark.
   - Editorial white card with typography, headings, and signature.
   - Footer with dynamic `{{UNSUBSCRIBE_TOKEN}}` substitution preview and Riyadh HQ byline.
3. **Dispatch Execution (`sendCampaignAction`):**
   - Validates user permissions.
   - Queries all subscribers with status `ACTIVE`.
   - In production (with `RESEND_API_KEY` set): batch sends personalized emails with each subscriber's unique token.
   - In development (when `RESEND_API_KEY` is omitted): safely persists draft updates, logs diagnostic guidance, and avoids throwing fatal runtime exceptions.

