# Saudi Future Tech

> *"The Future Is Being Built Today."*

Official technical repository and architectural blueprint for **Saudi Future Tech** ([https://saudifuturetech.com](https://saudifuturetech.com)), an authoritative, English-language technology news and innovation publication dedicated to covering the Kingdom of Saudi Arabia's burgeoning technology ecosystem and global frontier developments.

---

## Current Status: Phase 0 Completed (Architecture & Planning)

This project is currently at **Phase 0 (Discovery, Architecture Planning & Technical Blueprint)**. 

In accordance with strict technical governance:
- **No application source code or dependencies have been installed yet.**
- **No active databases or live deployments have been created.**
- Complete architectural specifications, database designs, design tokens, feature requirements, and implementation roadmaps have been documented and approved below.
- Development will begin in **Phase 1: Project Foundation & Design System**.

---

## Technical Documentation Index

All architectural specifications are organized in the [`docs/`](./docs) directory:

| Document | Description |
| :--- | :--- |
| **[`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md)** | Product vision, target audience personas, editorial pillars, and brand positioning. |
| **[`docs/TECH_STACK.md`](./docs/TECH_STACK.md)** | Evaluation of Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma, Auth.js, and Vercel. |
| **[`docs/SYSTEM_ARCHITECTURE.md`](./docs/SYSTEM_ARCHITECTURE.md)** | Multi-tier system architecture, ISR caching, publishing state machine, RBAC, and media pipelines. |
| **[`docs/DATABASE_DESIGN.md`](./docs/DATABASE_DESIGN.md)** | Complete Entity-Relationship Diagram (ERD), table definitions, indexes, constraints, and Prisma schema. |
| **[`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md)** | Brand color tokens (`#071521`, `#102B35`, `#B7F36B`, `#F3F5F2`), typography (Manrope & Inter), and UI component specs. |
| **[`docs/FEATURE_SPECIFICATION.md`](./docs/FEATURE_SPECIFICATION.md)** | Functional specifications for all 10 public pages, 6 editorial categories, admin CMS modules, and RBAC matrix. |
| **[`docs/IMPLEMENTATION_ROADMAP.md`](./docs/IMPLEMENTATION_ROADMAP.md)** | Phased 9-stage engineering roadmap from Phase 0 through Phase 8 testing and launch. |
| **[`docs/ENVIRONMENT_CHECKLIST.md`](./docs/ENVIRONMENT_CHECKLIST.md)** | External service access inventory, DNS records plan, and `.env.example` template. |

---

## Technology Stack Summary

* **Framework:** Next.js 15.x (App Router, React Server Components, Server Actions)
* **Language:** TypeScript 5.x (Strict Mode)
* **Design & Styling:** Tailwind CSS, shadcn/ui (Radix UI primitives), Lucide React
* **Typography:** Manrope (Headings), Inter (Body) via `next/font`
* **Database:** PostgreSQL 16+ with Connection Pooling (PgBouncer)
* **ORM:** Prisma ORM 6.x
* **Authentication:** Auth.js (NextAuth v5) with HTTP-Only Cookies and RBAC
* **Editorial Editor:** Tiptap WYSIWYG
* **Media & Asset CDN:** Cloudinary (Direct signed client-to-cloud uploads)
* **Email & Newsletter:** Resend API
* **Hosting & CDN:** Vercel Edge Network

---

## Editorial Categories

1. **AI & Deep Tech:** Sovereign foundation models (ALLaM), supercomputing, robotics, industrial automation.
2. **GovTech:** Digital public infrastructure, Absher, Tawakkalna, DGA, open data platforms.
3. **Cybersecurity:** National Cybersecurity Authority (NCA) frameworks, sovereign encryption, cyber defense.
4. **Smart Cities & Infrastructure:** NEOM (THE LINE, OXAGON), Red Sea Global, ROSHN, 5G/6G, IoT networks.
5. **FinTech:** SAMA regulatory sandbox, Open Banking, digital payment rails, VC funding.
6. **Clean Energy:** Green hydrogen, solar gigaprojects, carbon capture, grid technology.

---

## Implementation Phases

* **P0 — Project Discovery & Architecture** *(Completed)*
* **P1 — Project Foundation & Design System** *(Next Phase)*
* **P2 — Premium Homepage**
* **P3 — Article & Category Experiences**
* **P4 — Database & Backend**
* **P5 — Admin Authentication & CMS**
* **P6 — Publishing Workflow & Newsletter**
* **P7 — SEO, Performance & Security**
* **P8 — Testing & Deployment**

---

## License & Copyright

Copyright © 2026 Saudi Future Tech. All rights reserved.

