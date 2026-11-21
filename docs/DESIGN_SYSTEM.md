# Saudi Future Tech — Design System & Visual Specification

**Document Version:** 1.0.0  
**Phase:** Phase 0 (Discovery & Architecture)  
**Status:** Approved Design Specification  

---

## 1. Visual Identity & Brand Philosophy

The visual language of **Saudi Future Tech** conveys architectural precision, editorial gravitas, and forward-looking technological optimism. It is styled in the lineage of world-class technology journalism institutions (such as MIT Technology Review, Bloomberg Technology, and The Information).

### Design Rules: What to Emphasize vs. What to Avoid
* **DO:**
  * Prioritize typographic hierarchy, sharp 1px borders (`border-white/10`), generous negative space, and disciplined layout rhythm.
  * Use the vibrant accent color (`#B7F36B`) sparingly as a laser focus indicator for badges, category highlights, critical callouts, and key active states.
  * Establish high contrast and optimal line-lengths (65–75 characters per line) for long-form reading comfort.
  * Use deliberate editorial layouts: asymmetrical lead features, editorial pull-quotes, and distinct category rails.
* **DO NOT:**
  * Avoid generic AI-generated tropes: purple/pink neon gradient blobs, glowing radial backdrops, overused glassmorphism, floating blur cards, or gratuitous parallax animations.
  * Avoid repetitive, uniform card grids that look like e-commerce catalogs rather than a curated news publication.
  * Do not compromise legibility for aesthetic novelty.

---

## 2. Color Palette & Token System

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRIMARY COLOR PALETTE                           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Primary Background│ Secondary BG      │ Future Accent                  │
│ #071521           │ #102B35           │ #B7F36B                        │
│ Deep Space Navy   │ Surface / Slate   │ Electric Acid Lime             │
├───────────────────┴───────────────────┴────────────────────────────────┤
│ Light Background: #F3F5F2 (Off-White / Alabaster)                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Palette Specifications

| Token Name | Hex Code | RGB | HSL | Semantic Role |
| :--- | :--- | :--- | :--- | :--- |
| `color-bg-primary` | `#071521` | `7, 21, 33` | `208°, 65%, 8%` | Root page background, deep dark canvas |
| `color-bg-secondary`| `#102B35` | `16, 43, 53` | `196°, 54%, 14%` | Card surfaces, navigation bars, elevated containers |
| `color-bg-subtle` | `#163A47` | `22, 58, 71` | `196°, 53%, 18%` | Hover states, active tabs, inset code blocks |
| `color-accent` | `#B7F36B` | `183, 243, 107`| `86°, 84%, 69%` | Primary focal accent, active badges, breaking indicator |
| `color-accent-hover`| `#9DE24F` | `157, 226, 79` | `88°, 73%, 60%` | Interactive hover state for accent buttons |
| `color-bg-light` | `#F3F5F2` | `243, 245, 242`| `90°, 8%, 95%` | Editorial light canvas mode & high-contrast print view |
| `color-text-high` | `#FFFFFF` | `255, 255, 255`| `0°, 0%, 100%` | Primary headlines, title text, prominent figures |
| `color-text-body` | `#D1D8DD` | `209, 216, 221`| `205°, 16%, 84%`| Article reading body text, descriptions |
| `color-text-muted`| `#8E9CA6` | `142, 156, 166`| `203°, 12%, 60%`| Metadata, bylines, timestamps, captions |
| `color-border` | `rgba(255, 255, 255, 0.10)` | - | - | Subtle hairline borders, divider lines |
| `color-border-hover`| `rgba(183, 243, 107, 0.35)` | - | - | Interactive card hover borders |

---

## 3. Typography System

The publication employs two primary typefaces, imported via Next.js Google Fonts (`next/font/google`) with zero layout shift (CLS = 0) and local font subsetting:

1. **Headings & Display:** **Manrope** (Geometric sans-serif with modern grotesque authority).
2. **Body & Reading:** **Inter** (Engineered for maximum screen legibility and neutral editorial clarity).
3. **Code & Data Callouts:** **JetBrains Mono** or **Geist Mono** (Monospace tabular alignment).

### Type Scale & Hierarchy

| Semantic Level | Font Family | Size (Desktop / Mobile) | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero H1** | Manrope | `48px (3rem) / 32px` | 800 (ExtraBold) | 1.15 | `-0.03em` |
| **Section Title H2** | Manrope | `32px (2rem) / 24px` | 700 (Bold) | 1.25 | `-0.02em` |
| **Article Card H3** | Manrope | `22px (1.375rem) / 18px`| 600 (SemiBold) | 1.30 | `-0.01em` |
| **Subtitle / Subhead**| Manrope | `18px (1.125rem) / 16px`| 500 (Medium) | 1.40 | `0` |
| **Article Body** | Inter | `18px (1.125rem) / 16px`| 400 (Regular) | 1.75 | `0` |
| **Lead / Standfirst** | Inter | `20px (1.25rem) / 18px` | 400 (Regular) | 1.60 | `0` |
| **Metadata & Byline** | Inter | `13px (0.8125rem)` | 500 (Medium) | 1.40 | `+0.01em` |
| **Category Pill Badge**| Manrope | `11px (0.6875rem)` | 700 (Bold) | 1.00 | `+0.08em (Uppercase)`|

---

## 4. Grid, Layout & Spacing Architecture

* **Container Max Width:**
  * Standard Layout: `1280px` (`max-w-7xl`)
  * Hero Wide: `1440px` (`max-w-[90rem]`)
  * Article Reading Canvas: `768px` (`max-w-3xl`) — locked to ensure ergonomic reading cadence.
* **Layout Grid:** 12-column responsive CSS grid with standard `gap-6` (24px) or `gap-8` (32px).
* **Base Unit:** 4px spacing scale (Tailwind default: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`, `96px`).

---

## 5. Core UI Component Specifications

### 5.1. Global Header & Navigation
* Fixed/Sticky bar with backdrop blur: `bg-[#071521]/90 backdrop-blur-md border-b border-white/10`.
* Left: Saudi Future Tech wordmark + dynamic publication timestamp (Riyadh Time).
* Center: Primary category links (`AI & Deep Tech`, `GovTech`, `Cybersecurity`, `Smart Cities`, `FinTech`, `Clean Energy`).
* Right: Search icon modal trigger, Newsletter CTA button (`bg-[#B7F36B] text-[#071521] font-semibold hover:bg-[#9DE24F] px-4 py-2 rounded-md`).

### 5.2. Hero Article Feature (Lead Story)
* Asymmetrical 2-column or 70/30 layout:
  * Left: High-impact 16:9 photography with subtle vignette, photo credit overlay.
  * Right: Category badge pill, reading time indicator, H1 display headline, 3-line editorial standfirst, author avatar with byline and publication date.
* Sharp, thin divider line in `#B7F36B` connecting the headline to the category taxonomy.

### 5.3. Editorial Article Card (Standard Grid)
* Card surface: `#102B35` with `border border-white/10`.
* Hover state: Border smoothly shifts to `border-[#B7F36B]/40`, title transitions to `#B7F36B` (200ms ease).
* Aspect ratio 16:10 thumbnail image with responsive Next.js Image component (`fill`, `object-cover`).
* Category pill: Upper left with accent background or outline.
* Metadata row: Author name, date (e.g., "Nov 14, 2026"), and reading time (e.g., "5 min read").

### 5.4. Trending & Breaking Ticker
* A horizontal stream or dedicated sidebar rail:
  * Numbered indices `01`, `02`, `03`, `04`, `05` rendered in large, muted Manrope (`text-[#8E9CA6]/40`).
  * Headline links with reading time.
  * Live status indicator: pulsating dot in `#B7F36B` for breaking developments.

### 5.5. Editorial Reading Canvas (Article Detail Page)
* **Header Block:**
  * Category badge pill.
  * Headline H1 in Manrope (bold, high-contrast `#FFFFFF`).
  * Standfirst excerpt in Inter 20px `#D1D8DD`.
  * Author Byline Bar: Author avatar (48px rounded-full), author name with link to profile, publication date, last updated date, reading time, and social share buttons (X/Twitter, LinkedIn, Copy Link).
* **Feature Image:** Full-width high-resolution photo with descriptive caption and photographer credit.
* **Body Content Typography:**
  * 18px Inter with 1.75 line-height.
  * Paragraph spacing: `mb-6`.
  * Drop cap on initial paragraph (optional editorial flair: Manrope, 3-line height, `#B7F36B`).
  * Pull Quotes: Centered or left-bordered with 3px solid `#B7F36B`, Manrope 24px italic, `#FFFFFF`.
  * Code blocks: `#071521` background, 1px border, syntax highlighted with monospace typography.
  * Image embeds: Responsive with styled caption below in `text-xs text-[#8E9CA6]`.

### 5.6. Author Bio Card (End of Article & Author Page)
* Surface `#102B35` with `border border-white/10`.
* Author portrait (80px), name, professional editorial title, bio paragraph, and verified social icons (X, LinkedIn, Personal Site).

### 5.7. Newsletter Signup Module
* Integrated within homepage flow and article footers.
* High-impact layout: `#102B35` surface with `#B7F36B` accent border.
* Value proposition: "The Saudi Tech Ecosystem, Delivered Every Thursday."
* Input field: Deep background `#071521`, crisp 1px border, white text, instant submit button with loading state.

### 5.8. Global Footer
* Multi-column architecture:
  * Column 1: Brand description, editorial mission, Vision 2030 tech focus statement, copyright.
  * Column 2: Editorial categories.
  * Column 3: Corporate & Legal (About Us, Editorial Ethics, Contact, Privacy Policy, Terms).
  * Column 4: Newsletter signup micro-form and social channels.

