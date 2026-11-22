# Saudi Future Tech — Design System (v2)

The site is a serious publication, closer to the FT, Rest of World or a good
city newspaper than a startup landing page. Structure comes from **typography
and hairline rules**, not boxes, shadows or colour.

Reference implementation: `src/app/page.tsx` and `src/components/home/*`.
Read those before building anything.

---

## 1. Tokens (tailwind.config.ts)

| Token | Value | Use |
|---|---|---|
| `bg-paper` | `#F2EEE5` | Page background (limestone) |
| `bg-paper-sheet` | `#FAF8F3` | Inputs, hover rows, the rare raised surface |
| `bg-paper-band` | `#EAE4D8` | Full-width tonal band (e.g. newsletter), image placeholders |
| `text-ink` | `#1A1714` | Headlines, primary text, primary buttons |
| `text-ink-2` | `#3A352F` | Body copy |
| `text-ink-3` | `#6F675D` | Standfirsts, secondary copy |
| `text-ink-4` | `#9A9186` | Faint metadata, index numbers |
| `border-rule` | `#D8D0C1` | Hairlines between items |
| `border-ink` | | Heavy rules that open a section (`border-t-2 border-ink`) |
| `clay` / `clay-dark` / `clay-tint` / `clay-wash` | `#A63D24` | **The only accent.** Kickers, urgent deadlines, hover on headlines, focus ring |
| `moss` / `moss-tint` | `#3F6B52` | One meaning only: open / accepting / verified |

Legacy tokens (`editorial-*`, `brand-*`, `saudi-*`, `sft-*`, `ink-high/body/muted`)
are remapped onto this palette so old code doesn't break. **Don't use them in new
code.** Don't use raw hex values, Tailwind default palettes (`slate-`, `emerald-`,
`gray-`, `blue-`…), gradients, or per-category rainbow colours (`category.color`
is ignored).

## 2. Type

- `font-serif`: Newsreader. All headlines, standfirsts, article body, big numerals. Weight 400–500. Never bold-black.
- `font-sans`: Geist. UI, buttons, body copy in directories.
- `font-mono`: Geist Mono — **code blocks only.** Dates, money, counts and labels use the sans with `tabular` figures. Monospace metadata reads as machine-generated; avoid it.

Display sizes (fluid, tracking built in): `text-display-xl`, `text-display-lg`,
`text-display-md`, `text-display-sm`. Use them for h1/h2 instead of `text-4xl` etc.

Utility classes in `globals.css`:
- `.kicker`: small uppercase sans label in clay, above headlines. One per block, max.
- `.meta`: small sans metadata line (date · read time · source), tabular figures.
- `.headline-link`: headline turns clay on hover (also on `.group:hover`).
- `.link-rule`: underline grows from left on hover. For text links like "See all →".
- `.btn-primary`: ink button, turns clay on hover. **One per view.**
- `.btn-quiet`: outlined ink button.
- `.prose-sft`: serif article body. `.standfirst`, `.drop-cap` for articles.
- `.img-warm`: put on every photo so stock images sit warmly on the paper.
- `.rise`: entry animation. Use sparingly (above-the-fold only), stagger with `style={{animationDelay}}`.

Sentence case everywhere ("Closing soon", not "Closing Soon"). No ALL CAPS
except `.kicker` and `.meta`-style column heads.

## 3. Layout patterns

- Container: `<MainContainer>` (84rem, matches masthead). Narrow reading column: `size="narrow"` or `max-w-measure`.
- **Section opener**: `border-t-2 border-ink pt-4`, then optional `.kicker`, then a serif `h2`, then a one-line `text-ink-3` standfirst. A "See all →" `.link-rule` link sits on the right. Use `<SectionHeading>`.
- **Lists over cards.** Items are separated by `border-b border-rule` (or `divide-y divide-rule`). Use a ruled list or table for directories (grants, startups, investors). See `GrantLedger.tsx` and `StartupRegister.tsx`.
- **Tables are fine** for tabular data: mono column heads (`meta`), `border-b border-ink` under the head, `border-b border-rule` rows, `hover:bg-paper-sheet/60`.
- **Asymmetry.** 12-column grids with 8/4, 7/5, 3/9 splits. Vertical rules between columns (`lg:border-l lg:border-rule lg:pl-10`). Avoid 3 or 4 equal boxed cards in a row.
- Space generously between sections: `space-y-20 md:space-y-28`.
- No boxes with border + shadow + rounded corners. If a surface is needed, use `bg-paper-sheet` with no border, or a hairline only. Radius max `rounded-sm` (2px).
- No pill badges. Status is a word in mono, optionally with a 6px dot (`moss` = open, `clay` = urgent).
- Filters: text tabs with an underline for the active one, or plain `<select>` styled with a bottom border. Not pill clouds.
- Inputs: transparent with `border-b-2 border-ink`, `focus-within:border-clay`.
- Page header for inner pages: kicker, `text-display-lg` serif h1, `text-ink-3` standfirst at `max-w-2xl`, then a `border-b border-rule` or the first section's heavy rule. Left-aligned, never centred hero blocks.
- Breadcrumbs: `.meta` text, `/` separators.

## 4. Icons

Avoid decorative icons (shields, rockets, sparkles, building icons beside every
label). Use text and arrows (`→`, `↗` for external links). If an icon is truly
needed (search, close, external), use a small inline SVG with `strokeWidth 1.25`,
or lucide at `w-4 h-4 strokeWidth={1.5}`.

## 5. Copy

Plain, specific, active. Banned: "sovereign" (except proper nouns), "elevate",
"seamless", "unleash", "next-gen", "game-changer", "cutting-edge", "operating
intelligence", "zero speculation", "verified intelligence", "ecosystem" as filler,
exclamation marks. Errors: "We couldn't load this. Try again." Empty states:
say what's empty and offer the next step. Never invent statistics.

## 6. States

Every interactive element has hover (colour shift), `active:translate-y-px` for
buttons, and the global clay focus ring. Empty states are a short serif line plus
a link. Loading: keep layout, no spinners where avoidable.

## 7. Shared components (do not fork)

`SiteHeader`, `SiteFooter`, `MainContainer`, `SectionHeading`, `CategoryBadge`
(renders a clay kicker link), `ArticleCard` (borderless teaser, props `size`,
`showImage`), `NewsletterBanner` (inner pages), `NewsletterForm`, `src/lib/labels.ts`
(`stageLabel`, `opportunityTypeLabel`, `investorTypeLabel`, `businessModelLabel`,
`deadlineInfo`, `daysUntil`).

---

## 8. Admin (CMS)

The admin is a working tool: denser than the public site, same system.
Shell (`AdminClientShell`, `AdminSidebar`, `AdminHeader`) is done — don't fork it.

- **Page header**: `<PageHeading badge? title description?>{actions}</PageHeading>` from `src/components/ui/PageHeading.tsx`.
- **Figures**: `<StatCard>` (serif number over a top ink rule, no box). Lay out in a grid with `gap-x-8 gap-y-6`.
- **Status**: `<StatusBadge>` for article status; for other statuses use the same pattern — mono word + 6px dot (`moss` = live/open/active, `clay` = needs attention/closing/in review, `ink-4` = draft/inactive). No pills, no coloured backgrounds.
- **Forms**: `.field-label` (sentence case, never uppercase), `.field` on every input/textarea/select (light sheet, hairline, ink focus — never dark inputs), `.field-hint`, `.field-error`. Group sections in `.panel` with `p-5` and a `.panel-title`. Checkboxes: `accent-[#A63D24]`.
- **Tables**: `<table className="data-table">` — mono heads, ruled rows. Row actions are text (`.row-action`, `.row-action-danger`: "Edit", "Preview", "Delete"), not icon-button rows. An icon is OK only inside a text button if it genuinely helps.
- **Buttons**: `<Button>` from `src/components/ui/Button.tsx` (primary = ink, one per view; secondary/outline/ghost). Destructive actions: ghost/outline with clay text and a confirm step, never solid red.
- **Messages**: success = `border-l-2 border-moss pl-3` text; error = `border-l-2 border-clay pl-3` text. No coloured boxes, no emoji, no exclamation marks.
- **Modals / drawers**: `bg-paper-sheet border border-rule shadow-lift`, overlay `bg-ink/40`.
- **Copy**: plain labels ("Headline", "Slug", "Standfirst", "Section", "Cover image URL"), not "EDITORIAL PILLAR & BYLINE". No "sovereign", "encrypted session", "backstage console" theatre.
- Remove legacy tokens (`editorial-*`, `brand-*`, `saudi-*`, `ink-high/body/muted`), Tailwind default palettes (`amber-`, `rose-`, `emerald-`, `sky-`, `slate-`, `stone-`, `red-`, `green-`…), raw hex and `uppercase tracking-widest` labels in files you touch.
