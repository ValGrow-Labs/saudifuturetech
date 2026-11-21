# Saudi Future Tech — Feature Specification Document

**Document Version:** 1.0.0  
**Phase:** Phase 0 (Discovery & Architecture)  
**Status:** Approved Functional Blueprint  

---

## Part A: Public Website Architecture & Page Specifications

The public web experience is designed for seamless readability, instant navigation, and deep discoverability. Every page is server-rendered with Next.js App Router for optimal SEO indexing and sub-second load times.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   PUBLIC SITEMAP                       │
                    └───────────────────────────┬────────────────────────────┘
                                                │
         ┌───────────────────┬──────────────────┴──────────────────┬───────────────────┐
         ▼                   ▼                                     ▼                   ▼
  ┌──────────────┐    ┌──────────────┐                      ┌──────────────┐    ┌──────────────┐
  │   Homepage   │    │ Latest News  │                      │  Categories  │    │   Articles   │
  │     (/)      │    │   (/latest)  │                      │ (/category/*)│    │ (/article/*) │
  └──────────────┘    └──────────────┘                      └──────────────┘    └──────────────┘
         │                   │                                     │                   │
         └───────────────────┼─────────────────────────────────────┼───────────────────┘
                             │
         ┌───────────────────┼─────────────────────────────────────┬───────────────────┐
         ▼                   ▼                                     ▼                   ▼
  ┌──────────────┐    ┌──────────────┐                      ┌──────────────┐    ┌──────────────┐
  │Search Results│    │Author Profile│                      │   Corporate  │    │  Newsletter  │
  │  (/search)   │    │ (/author/*)  │                      │(About/Contact│    │(/newsletter) │
  └──────────────┘    └──────────────┘                      │  /Privacy)   │    └──────────────┘
                                                            └──────────────┘
```

---

### 1. Homepage (`/`)
* **Role:** Primary editorial flagship showcasing breaking developments, deep-dive investigations, and category curation.
* **Sections:**
  1. **Breaking / Top Ticker:** Real-time stream of recent news items with timestamp.
  2. **Hero Lead Story:** Asymmetrical high-impact editorial showcase with primary headline, summary standfirst, author byline, and responsive photography.
  3. **Secondary Featured Grid:** 3-column curated grid of high-priority analysis pieces.
  4. **Trending & Most Read:** Numbered sidebar/rail ranking the top 5 trending articles based on 48-hour velocity.
  5. **Category Rails:** Dedicated horizontal sections for each of the 6 core pillars (`AI & Deep Tech`, `GovTech`, `Cybersecurity`, `Smart Cities`, `FinTech`, `Clean Energy`) displaying 3–4 recent stories per category.
  6. **Editor's Picks:** High-value long-form investigations hand-picked by senior editorial staff.
  7. **Newsletter Dispatch Callout:** High-conversion subscription banner.

### 2. Latest News (`/latest`)
* **Role:** Reverse-chronological real-time stream of all published articles.
* **Features:**
  * Category quick-filter tabs (All, AI, GovTech, Cyber, etc.).
  * Infinite scroll or server-paginated index (15 articles per page).
  * Date markers grouping articles by "Today", "Yesterday", and specific calendar dates.
  * Estimated reading time and author byline on every card.

### 3. Category Pages (`/category/[slug]`)
* **Role:** Thematic hubs for dedicated industry domains (e.g., `/category/ai-deep-tech`).
* **Features:**
  * Category banner with title, description, and thematic accent color indicator.
  * Lead story within the category.
  * Grid of chronological category stories.
  * Sub-tag filters (e.g., under AI: `#LLMs`, `#Robotics`, `#SDAIA`).
  * Dedicated category RSS feed link (`/category/[slug]/feed.xml`).

### 4. Individual Article Pages (`/article/[slug]`)
* **Role:** Core reading canvas optimized for readability and engagement.
* **Features:**
  * Category breadcrumb navigation (`Home > AI & Deep Tech > Article Title`).
  * Headline (H1 Manrope), Standfirst excerpt, Author avatar and byline, publication timestamp, and last-updated timestamp.
  * Social sharing suite: One-click copy link, X (Twitter), LinkedIn, WhatsApp, and Web Share API.
  * High-resolution hero image with caption and photo credit.
  * Long-form article body with rich typography:
    * Drop caps, pull quotes, responsive image embeds with zoom modal, inline code snippets, data tables, and callout callout boxes.
  * Estimated reading time dynamically calculated from word count (~220 wpm).
  * Tag list linking to topic archive pages.
  * Author bio card with links to other articles by this author.
  * Related articles module (3 articles algorithmically matched by category and shared tags).
  * End-of-article newsletter capture form.

### 5. Search Results (`/search`)
* **Role:** Interactive search experience across the entire article corpus.
* **Features:**
  * Real-time debounced query input.
  * Category and date-range filter facets.
  * Keyword highlighting in search snippets.
  * Zero-state suggestions and trending search queries when the input is empty.

### 6. Author Profile Pages (`/author/[slug]`)
* **Role:** Dedicated byline archive for journalists and contributors.
* **Features:**
  * High-resolution author portrait.
  * Author name, editorial role/title, and extended biography.
  * Verified links to LinkedIn, Twitter/X, and personal website.
  * Chronological grid of all articles published under this author's byline.

### 7. About Us (`/about`)
* **Role:** Institutional credibility, mission statement, and editorial principles.
* **Features:**
  * Publication mission and coverage philosophy.
  * Editorial independence and ethics policy.
  * Editorial masthead and leadership profiles.
  * Contact details for press inquiries and story tips.

### 8. Contact Us (`/contact`)
* **Role:** Communications hub for tips, corrections, press releases, and advertising.
* **Features:**
  * Form with fields: Name, Email, Inquiry Type (Editorial Tip, Correction Request, Advertising, General Inquiry), Subject, Message.
  * CSRF protection and rate-limiting.
  * Secure server-side validation with automated email notification to the editorial desk.

### 9. Newsletter Landing Page (`/newsletter`)
* **Role:** Dedicated acquisition funnel for the weekly editorial digest.
* **Features:**
  * Overview of the newsletter format ("The Saudi Tech Weekly").
  * Preview of past editions and topics covered.
  * Double opt-in email submission form.
  * Privacy assurance statement (strictly no spam, easy 1-click unsubscribe).

### 10. Privacy Policy & Legal (`/privacy`, `/terms`)
* **Role:** Regulatory compliance with Saudi Personal Data Protection Law (PDPL) and international standards (GDPR).
* **Features:**
  * Plain-English explanation of data handling (newsletter emails, anonymized view logs).
  * Cookie and tracking disclosure.
  * User rights (right to access, rectification, and deletion).

---

## Part B: Editorial Category Specifications

| Category | Slug | Remit & Topic Coverage | Accent Tone |
| :--- | :--- | :--- | :--- |
| **AI & Deep Tech** | `ai-deep-tech` | Generative AI, sovereign LLMs (ALLaM), supercomputing clusters, robotics, computer vision, data centers. | `#B7F36B` |
| **GovTech** | `govtech` | Digital government platforms (Absher, Tawakkalna), DGA standards, open data, national ID, digital public infrastructure. | `#4E95FF` |
| **Cybersecurity** | `cybersecurity` | NCA compliance frameworks (ECC/CSCC), cyber defense, threat intelligence, sovereign data encryption, Zero Trust. | `#FF5C5C` |
| **Smart Cities & Infra**| `smart-cities-infra` | NEOM (THE LINE, OXAGON, Trojena), Red Sea Global, ROSHN, 5G/6G telecom networks, IoT, digital twins. | `#FFB800` |
| **FinTech** | `fintech` | SAMA regulatory sandbox, Open Banking, Mada/SARIE, digital banking licenses, payments, venture funding. | `#00E5FF` |
| **Clean Energy** | `clean-energy` | Green hydrogen, solar gigaprojects (Sudair, Shuaibah), carbon capture (CCUS), smart power grids, EV infrastructure. | `#00FF9D` |

---

## Part C: Administration CMS (`/admin`) Requirements

The admin system is a secure, authenticated, modular portal located under `/admin`.

### 1. Dashboard & Real-Time Metrics (`/admin`)
* **Key Performance Indicators (KPIs):**
  * Total published articles.
  * Drafts pending editorial review.
  * 24-hour and 30-day article views.
  * Active newsletter subscribers.
* **Quick Actions:** Create new article, upload media, view review queue.
* **Recent Activity Feed:** Real-time audit log of articles created, published, or modified by staff members.

### 2. Article Editor & Management (`/admin/articles`)
* **Article List View:** Filterable table by Status (`DRAFT`, `IN_REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`), Category, Author, and Date. Search by title.
* **Tiptap WYSIWYG Editor:**
  * Rich formatting: H2, H3, bold, italic, strikethrough, blockquote, code blocks, lists (ordered/unordered), tables, horizontal rules.
  * Inline media insertion directly from the Media Library.
  * Auto-save draft capability with dirty state detection.
* **Editorial Sidebar Controls:**
  * Title & Auto-slug generator (with manual edit override).
  * Standfirst excerpt editor.
  * Primary Category picker and Tag multi-selector.
  * Author assignment dropdown (defaults to current user).
  * Cover Image picker with focal point selection and Alt text input.
  * SEO metadata editor (custom meta title, description, and canonical URL).
  * Promotion flags: Toggle `Featured Story`, `Editor's Pick`, `Trending`.
  * Publishing controls: Save Draft, Submit for Review, Schedule for Date/Time, Publish Now.

### 3. Publishing & Scheduling Engine
* **Draft Workflow:** Authors create drafts and click "Submit for Review".
* **Editorial Review Queue:** Editors receive a filtered list of `IN_REVIEW` articles to inspect, edit, and either approve or reject with notes.
* **Scheduled Publishing:** Editors can assign a future UTC date and time. An automated background worker transitions the article to `PUBLISHED` when the timestamp is reached.

### 4. Category Management (`/admin/categories`)
* Interface to create, edit, and reorder categories.
* Fields: Category Name, Slug, Description, Accent Color hex, Navigation Display Order, and SEO meta fields.

### 5. Author Management (`/admin/authors`)
* Manage author bylines and profiles.
* Fields: Display name, slug, job title, bio, portrait avatar upload, social handles (Twitter/X, LinkedIn, Website), and `isFeatured` author toggle.

### 6. Media Library (`/admin/media`)
* Centralized asset management repository.
* Direct signed upload to Cloudinary/S3.
* Grid view with thumbnail preview, file dimensions, file size, MIME type, and upload date.
* Search by file name or alt text.
* 1-click "Copy CDN URL" and "Insert into Editor" actions.

### 7. Featured Layout Manager (`/admin/featured`)
* Visual curation tool to assign articles to homepage slots:
  * Slot 1: Hero Lead Story.
  * Slots 2–4: Secondary Featured Grid.
  * Slots 5–9: Trending / Breaking Highlights.
  * Editor's Choice Section.

### 8. Newsletter Management (`/admin/subscribers`)
* Table of all subscribers: Email, Status (`ACTIVE`, `PENDING`, `UNSUBSCRIBED`), Source, and Signup Date.
* Metrics: Growth rate, unsubscribes, bounce rate.
* 1-click CSV export of subscriber lists for marketing compliance.

### 9. Analytics (`/admin/analytics`)
* Internal privacy-friendly metrics:
  * Top 20 performing articles by 7-day and 30-day view counts.
  * Category distribution breakdown.
  * Top external traffic referral sources.

### 10. Website Settings (`/admin/settings`)
* Global site configuration: Site title, default meta description, contact email, social media URLs, maintenance mode toggle.

### 11. User & Role Management (`/admin/users`)
* User directory for editorial team:
  * Add new users with role assignment (`SUPER_ADMIN`, `EDITOR`, `AUTHOR`).
  * Reset passwords and manage account statuses (`ACTIVE`, `SUSPENDED`).

---

## Part D: Role & Permissions Matrix

| Feature / Action | Super Admin | Editor | Author |
| :--- | :---: | :---: | :---: |
| Access `/admin` Dashboard | Yes | Yes | Yes |
| Create New Draft Article | Yes | Yes | Yes |
| Edit Own Drafts | Yes | Yes | Yes |
| Edit Other Authors' Drafts | Yes | Yes | No |
| Submit Article for Review | Yes | Yes | Yes |
| Approve & Publish Articles | Yes | Yes | No |
| Schedule Articles for Future | Yes | Yes | No |
| Delete Articles | Yes | No | No |
| Manage Categories (Add/Edit) | Yes | Yes | No |
| Manage Media Library (Upload/View) | Yes | Yes | Yes (Upload only) |
| Delete Media Assets | Yes | Yes | No |
| Curate Homepage Featured Slots | Yes | Yes | No |
| View Newsletter Subscribers | Yes | Yes | No |
| Export Subscribers CSV | Yes | No | No |
| Create / Edit User Accounts | Yes | No | No |
| Assign User Roles | Yes | No | No |
| Modify Global Site Settings | Yes | No | No |
| Run Database Seed / Maintenance | Yes | No | No |

