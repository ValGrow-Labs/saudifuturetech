# Saudi Future Tech — Technology Stack Specification

**Document Version:** 1.0.0  
**Phase:** Phase 0 (Discovery & Architecture)  
**Status:** Approved Technical Architecture  

---

## 1. Architecture Philosophy & Design Principles

The technical foundation of **Saudi Future Tech** is governed by four core principles:

1. **Monolithic Simplicity:** Avoid fragmented microservices. The entire application (public reader portal, editorial API, and administrative CMS) will operate within a single, highly cohesive full-stack codebase.
2. **Server-First Performance & SEO:** Editorial media sites live or die by search indexing and sub-second Largest Contentful Paint (LCP). Server Components, static generation, and incremental revalidation take precedence over heavy client-side SPAs.
3. **Data Sovereignty & Type Integrity:** End-to-end TypeScript from database models up to React view components ensures compile-time validation, minimizing runtime bugs and data corruption.
4. **Editorial Ergonomics:** The authoring and publishing experience must be instantaneous, responsive, and resilient, with zero barrier between writing and publication.

---

## 2. Technology Stack Overview

| Tier | Chosen Technology | Version / Specification | Primary Function |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **Next.js** | 15.x (App Router) | Full-stack React framework (SSR, SSG, ISR, Server Actions) |
| **Language** | **TypeScript** | 5.x (Strict Mode) | Type safety, maintainability, self-documenting code |
| **Styling Engine** | **Tailwind CSS** | v3.4+ / v4.x | Utility-first, zero-runtime CSS generation |
| **Component Library** | **shadcn/ui** | Radix UI Primitives | Accessible, composable, headless UI primitives |
| **Icons** | **Lucide React** | Latest | Lightweight, tree-shakable SVG iconography |
| **Database** | **PostgreSQL** | 16+ | Relational persistence, JSONB, full-text search indexing |
| **ORM / Data Layer**| **Prisma ORM** | 6.x | Declarative data modeling, automated migrations, type-safe client |
| **Authentication** | **Auth.js (NextAuth v5)**| 5.x | Secure session cookies, RBAC, credentials provider |
| **Rich Text Editor** | **Tiptap** | v2.x (ProseMirror engine) | Headless, customizable WYSIWYG editor for articles |
| **Media & Asset CDN**| **Cloudinary** (or S3/R2) | Managed CDN & Transformations | On-the-fly image optimization, responsive formatting (WebP/AVIF) |
| **Email / Newsletter**| **Resend** | REST API & React Email | Transactional emails and weekly newsletter dispatch |
| **Hosting & Edge CDN**| **Vercel** | Enterprise/Pro Edge Network | Automated git deployments, global edge caching, serverless compute |
| **Database Hosting** | **Neon / Supabase** | Managed PostgreSQL | Serverless PostgreSQL with pooling, point-in-time recovery |
| **Code Quality** | **ESLint & Prettier** | Modern flat config | Automated linting, code styling, and import sorting |

---

## 3. Detailed Component Evaluation & Rationale

### 3.1. Core Web Framework: Next.js (App Router)
* **Why Next.js?**
  * **Hybrid Rendering:** Supports Incremental Static Regeneration (ISR). Articles are statically generated at build time or on first request, then cached at the edge. When an editor updates an article, on-demand revalidation (`revalidateTag` / `revalidatePath`) purges the edge cache in under 150ms without rebuilding the site.
  * **Server Components (RSC):** The public reading experience ships zero unnecessary JavaScript to the client browser. HTML is rendered on the server, resulting in near-perfect Core Web Vitals (LCP < 1.0s, CLS = 0).
  * **Unified Server Actions:** Admin operations (publishing, editing, uploading) use native React Server Actions, eliminating the need to write boilerplate REST/GraphQL controllers.
* **Alternative Considered:**
  * *Astro:* Exceptional for static blogs, but building a full-featured authenticated admin CMS with live collaborative drafts inside Astro requires introducing third-party React micro-apps or external headless CMS setups. Next.js App Router handles both the ultra-fast public portal and the complex admin panel in one unified environment.
  * *Remix / React Router v7:* Strong server-side data fetching, but lacks the native global edge ISR caching primitives that Vercel provides out-of-the-box for high-traffic media portals.

---

### 3.2. Styling & Design System: Tailwind CSS + shadcn/ui
* **Why Tailwind CSS & shadcn/ui?**
  * **Zero Runtime Overhead:** Tailwind compiles down to a minimal static CSS file.
  * **Component Ownership:** Unlike monolithic component libraries (MUI, Ant Design), `shadcn/ui` copies accessible Radix UI components directly into the repository (`components/ui/*`). We maintain full code ownership to customize theme tokens, hover states, and typography.
  * **Accessibility (a11y):** Radix UI primitives handle keyboard navigation, ARIA attributes, focus trapping, and screen-reader requirements automatically.
* **Alternative Considered:**
  * *Chakra UI / Emotion:* Runtime CSS-in-JS adds significant execution overhead to React 19 / Server Components and increases bundle sizes.
  * *Raw CSS Modules:* Slower authoring velocity, repetitive media queries, and lack of design token consistency.

---

### 3.3. Database: PostgreSQL 16+
* **Why PostgreSQL?**
  * **Relational Integrity:** Editorial workflows require strict relational constraints: foreign keys between Articles, Authors, Categories, Tags, and Media items.
  * **Full-Text Search:** PostgreSQL provides native `tsvector` and `tsquery` search with English stemming, dictionary ranking, and `pg_trgm` fuzzy matching. This eliminates the need for expensive third-party search infrastructure (e.g., Algolia, Elasticsearch) during early and growth stages.
  * **ACID Guarantees:** Guarantees atomic transaction execution during publishing, ensuring audit logs, view counts, and publishing states remain consistent.
* **Alternative Considered:**
  * *MongoDB / Document DB:* Weak relational constraints lead to orphaned tags, inconsistent category assignments, and complex multi-document joins.
  * *SQLite:* Not suitable for multi-region serverless deployments or concurrent admin writing while serving high-volume read traffic.

---

### 3.4. ORM & Query Layer: Prisma ORM
* **Why Prisma?**
  * **Single Source of Truth:** The `schema.prisma` file provides a declarative definition of all entities, fields, relationships, and indexes.
  * **Type Generation:** Prisma Client auto-generates TypeScript types for all database queries. If a field changes in the schema, TypeScript immediately flags all affected components during compilation.
  * **Migration Tooling:** `prisma migrate` provides versioned, repeatable SQL migration files suitable for automated CI/CD pipelines.
* **Alternative Considered:**
  * *Drizzle ORM:* Highly efficient and closer to raw SQL, but Prisma's schema ergonomics, declarative relational relations, and ecosystem tooling (Prisma Studio for internal data review) make it ideal for a media editorial team.

---

### 3.5. Authentication & Authorization: Auth.js (NextAuth v5)
* **Why Auth.js?**
  * **Self-Contained & Self-Hosted:** All user credentials and session data reside directly inside our PostgreSQL database. No reliance on external user directories.
  * **JWT / Encrypted HTTP-Only Cookies:** Eliminates client-side token exposure to XSS attacks.
  * **Role-Based Access Control (RBAC):** Token callbacks embed user role claims (`SUPER_ADMIN`, `EDITOR`, `AUTHOR`) verified by edge middleware and server actions before granting access to `/admin` routes.
* **Alternative Considered:**
  * *Clerk / Auth0:* External SaaS dependencies with recurrent user-tier billing and vendor lock-in. Unnecessary for an internal editorial team of 5–50 staff members.

---

### 3.6. Media Storage & Delivery: Cloudinary (or S3 + CDN)
* **Why Cloudinary?**
  * **Automatic Responsive Art Direction:** Automatically serves optimized AVIF/WebP formats resized specifically for the viewer's device viewport.
  * **Dynamic Cropping:** Editorial cover images can be cropped with smart focal-point detection (aspect ratios 16:9 for hero, 1:1 for thumbnails, 1200x630 for OpenGraph).
  * **Secure Signed Uploads:** The browser uploads directly to the Cloudinary API using temporary HMAC-SHA256 signatures generated by Next.js Server Actions, preventing heavy image payloads from congesting the web server.

---

### 3.7. Hosting & Deployment: Vercel + Managed Serverless Postgres
* **Why Vercel?**
  * First-party hosting for Next.js App Router.
  * Instant global Edge Network with Anycast DNS.
  * Automated preview deployments on every Git pull request.
  * Native support for `revalidateTag()` cache invalidation across all edge nodes worldwide within milliseconds.
* **Managed Postgres Pairings:**
  * **Neon** or **Supabase**: Both provide managed PostgreSQL with built-in connection pooling (PgBouncer), SSL enforcement, daily automated backups, and serverless auto-scaling.

