# Saudi Future Tech — Editorial CMS User Guide

**System:** Backstage Editorial Platform  
**URL:** [https://saudifuturetech.com/admin](https://saudifuturetech.com/admin)  
**Target Audience:** Editorial Staff, Section Editors, Columnists, and Journalists  

---

## 1. Getting Started & Signing In

1. Navigate to [`/admin/login`](file:///Users/rishivarma/saudi-future-tech/src/app/admin/login/page.tsx).
2. Enter your authorized staff email address and password.
3. Click **Sign In to Editorial Console**.
4. Upon successful verification, you will be redirected to the Backstage Dashboard (`/admin`).

> [!NOTE]
> For development and staging environments, pre-configured credential buttons are available at the bottom of the login card for one-click testing of Super Admin, Editor, Author, and Inactive profiles.

---

## 2. The Editorial Dashboard (`/admin`)

The Dashboard provides a real-time pulse of publication operations:
- **Published Stories:** Total live articles indexed and accessible on the public site.
- **Editorial Review Queue:** Count of submitted articles awaiting Section Editor approval.
- **Active Drafts:** Stories currently in progress across editorial desks.
- **Editorial Pillars & Authors:** Overview of active coverage categories and journalists.
- **Recent Editorial Activity:** Live table of recent article updates with direct links to edit, preview, and monitor story lifecycle states.

---

## 3. Creating & Drafting Stories

### 3.1. Initiating a Draft
1. Click **Draft New Article** from the dashboard or navigate to **Articles** (`/admin/articles`) and click **Create New Article**.
2. Fill in the core editorial fields:
   - **Story Headline:** Enter the article title. An SEO-friendly URL slug is automatically generated in real-time.
   - **URL Slug:** You may click to unlock manual slug editing if a custom URL structure is desired.
   - **Editorial Standfirst / Subtitle:** Enter a 2-3 sentence executive summary that primes the reader with key analytical takeaways.
   - **Full Article Text & Analysis:** Write or paste your report content. Use double line breaks between paragraphs. Section headings starting with `##` will automatically render as architectural section breaks on the public site. Live word count and reading time estimates update automatically as you type.

### 3.2. Byline & Taxonomy Configuration
- **Category Pillar:** Select the appropriate Vision 2030 sector (e.g. *AI & Deep Tech*, *GovTech*, *Cybersecurity*, *FinTech*, *Clean Energy*, *Smart Cities & Infra*).
- **Author Byline:**
  - For **Authors**, this field is locked automatically to your verified contributor profile.
  - For **Editors**, you may select any approved contributor from the dropdown.
- **Taxonomy Tags:** Add relevant keywords separated by commas (e.g., `Sovereign AI, Data Center, NEOM`).

### 3.3. Artwork & Photography
- **Cover Image URL:** Provide a high-resolution Unsplash or publication artwork URL. A real-time thumbnail preview confirms the image loads properly.
- **Alt Text:** Describe visual elements for screen readers and accessibility.
- **Photo Caption & Attribution:** Enter the photo caption and credit the photographer, agency, or institution (e.g., `SPA / Saudi Future Tech`).

### 3.4. Curation Flags & Placement
- **Featured Lead Story:** Check this box to feature the story as the prominent Hero article on the public homepage.
- **Editor's Pick:** Displays the exclusive Editor's Pick badge.
- **Trending Analysis:** Surfaces the story in the homepage and category trending rails.

---

## 4. Editorial Workflow Lifecycle

```
[ DRAFT ]  ──(Author submits)──>  [ IN_REVIEW ]  ──(Editor approves)──>  [ PUBLISHED ]
    │                                     │                                    │
    └──(Author/Editor saves)              └──(Editor returns)                  └──(Editor unpublishes)
```

1. **Saving Drafts:** Click **Save Draft** at any time. Drafts are saved securely to PostgreSQL and remain completely invisible to public readers.
2. **Submitting for Review:** When drafting is complete, click **Submit for Review**. The article transitions to `IN_REVIEW` and appears in the Section Editor's review queue.
3. **Editor Review:** Section Editors can review the submission, inspect the live canvas preview, and suggest edits or approve.
4. **Publishing:** Section Editors and Super Admins can click **Publish Story**. The article goes live immediately on saudifuturetech.com, and relevant page caches are automatically invalidated.
5. **Reverting / Unpublishing:** If a live story requires retraction or major revisions, an editor can click **Unpublish to Draft** to immediately remove it from public view.

---

## 5. Using the Article Canvas Preview

To verify how your story appears to readers:
1. From the article list or editor, click **Preview Canvas** (`/admin/articles/[id]/preview`).
2. The preview renders the exact production reading layout, including typography, hero photography, captions, and author bio cards.
3. A sticky administrative banner displays the current lifecycle status and provides one-click shortcuts to edit or approve the piece.
4. Preview pages enforce `noindex` headers to ensure unfinished stories are never indexed by external search engines.

---

## 6. Managing Categories & Taxonomy

Section Editors and Super Admins can access:
- **Editorial Pillars (`/admin/categories`):** Configure pillar names, slug routes, descriptions, accent colors, and homepage display ordering. Deleting a pillar with linked articles is automatically prevented.
- **Topic Tags (`/admin/tags`):** Add, rename, or prune cross-cutting taxonomy tags.
- **Contributor Bylines (`/admin/authors`):** Create journalist profiles, update biographies, upload avatars, and manage social links.

