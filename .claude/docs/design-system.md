# Design system

Look and feel target: a clean, futuristic engineering lab. One hue only, a
dark matte blue, with neutral greys; Inter type with mono labels; small radii;
thin borders; buttons that lift, grow and slide on hover; and a dark blue
header band with slow drifting glows.

## Where tokens live

`src/main.css` is the only stylesheet. It:

1. imports Tailwind v4;
2. clears Tailwind's defaults (`--color-*`, `--shadow-*`, `--inset-shadow-*`,
   `--drop-shadow-*`, `--radius-*`, `--font-*`, `--text-*`, `--container-*`:
   initial) so only project tokens exist;
3. defines light values in `@theme`;
4. overrides the same variables under `:root[data-theme='dark']`
   (matte navy family);
5. adds a tiny base layer (body, selection, focus ring, Shiki theme switch).

Theme switching only changes CSS variables, so components never need `dark:`
variants for colours. A `dark:` custom variant exists for rare non-colour cases.

## Tokens → utilities

| Group    | Tokens (utility suffix)                                                  |
| -------- | ------------------------------------------------------------------------ |
| Surfaces | `canvas`, `canvas-subtle`, `surface`, `surface-muted`, `overlay`, `inset` |
| Text     | `fg`, `fg-strong`, `fg-muted`, `fg-subtle`, `fg-on-emphasis`             |
| Borders  | `border`, `border-muted`, `border-strong`                                |
| Brand    | `primary` (dark matte blue), `primary-emphasis`, `primary-muted`, `primary-solid(-hover)`; `secondary` and `accent` are lighter tints of the same blue. Do not introduce other hues |
| Status   | `success`, `attention`, `danger` (+ `-muted`), `spotify`                 |
| Cover    | `cover-fg`, `cover-ink`: same in both themes, for navbar content over the header band; `cover-tint-1..3` for gradient text on the band |
| Band     | `band-from`, `band-via`, `band-to` (dark blue gradient), `band-glow`, `band-glow-2`, `band-glow-3` (blue glows); separate light and dark values |
| Effects  | `shadow`, `shadow-strong`, `scrim` (dialog backdrop)                     |
| Shadows  | `shadow-xs` `sm` `md` `lg` `xl` `overlay`, `cta` / `cta-hover` (primary button glow), `cover-cta` (white button on the band) |
| Radius   | `rounded-xs` 2px (tags), `sm` 4px (buttons, controls), `md` 6px, `lg` 8px (cards, boxes), `xl` 12px, `full` (dots only) |
| Fonts    | `font-sans` (Inter Variable, self-hosted via `@fontsource-variable/inter`, system fallback), `font-heading`, `font-mono` |
| Text     | `text-2xs` … `text-7xl`, plus `text-reading` (article body), each with a paired line height |
| Containers | `page` 108rem (content), `wide` 150rem (navbar/footer), `reading` 75ch (doc column incl. header; ≈ 65 to 75 characters per line), `sidebar` `clamp(14rem, 14vw, 19rem)`, `hero` 64rem, `measure` 48rem (ledes), `search` 20rem, `dialog` / `palette` / `dock` (fluid `min(…, 100vw - 2rem)`), `bubble` 80%. Use as `max-w-*`, `w-*`, `basis-*` |
| Spacing  | `nav` (navbar height), `sticky` (sticky offset), `band` (header band, `clamp(9rem, 18vh, 11rem)`), `band-cell` (band grid), `glow-lg` / `glow-md` / `glow-sm` (aurora glow sizes), `embed` (Spotify embed, 152 px), `dialog-top`, `palette` (search max height), `chat` (chat panel height). Use as `h-*`, `pt-*`, `top-*`, `mt-*`, `max-h-*` |
| Motion   | `animate-pop`, `animate-fade`, `animate-eq` (equalizer bars), `animate-rise` (entrance slide, movement only so content never stays hidden), `animate-drift` (aurora glows). `prefers-reduced-motion` turns motion off |

Examples: `bg-surface border border-border rounded-lg shadow-sm`,
`text-fg-muted text-sm`, `bg-primary-muted text-primary`.

## Shared class helpers

- `utils/cn.ts`: join class lists (Prettier sorts classes inside `cn()`).
- `utils/buttonClass.ts`: `buttonClass(variant, size, extra)` with motion
  built in: every button lifts and grows on hover and presses in on click,
  icons slide right, primary buttons get a light sweep (`shineClass`) and
  outlined or ghost buttons a tint that grows in from the left (`fillClass`).
  Variants:
  `primary | secondary | ghost` and `sm | md | lg`. When overriding `display`
  on a button, use a variant (`max-sm:hidden`), not `hidden`, because the
  base classes include `inline-flex`.
- `forms/FormField.tsx`: `inputClass` and the label/error wrapper.

## Recurring patterns

- **Box**: `rounded-lg border border-border bg-surface/90 shadow-lg backdrop-blur-xl`,
  header bar `border-b border-border-muted px-4 py-3` with the icon in a
  `bg-primary-muted` tile, rows `divide-y divide-border-muted`
  (`components/ListBox.tsx`).
- **Cards** (`ProjectCard`, `PagerLink`): `rounded-lg`, lift on hover
  (`-translate-y`, `shadow-xl`, `border-primary/40`); the title link
  stretches over the card with `after:absolute after:inset-0`.
- **Docs layout**: sidebar `var(--container-sidebar)` | content
  `max-w-reading` | "On this page" TOC (`templates/DocsLayout.tsx`, grid in
  `utils/layout.ts`), used by `ArticleTemplate` and `ProjectTemplate`.
- **Doc header**: `components/DocHeader.tsx` (breadcrumbs, badges, `h1`,
  summary, meta row, actions) sits at the top of the body column.
- **Legal layout**: contents rail + framed "file view" box
  (`templates/CorporateTemplate.tsx`).
- **MDX elements** are styled via component maps in
  `components/mdx/docsMdxComponents.tsx` (`docsMdxComponents`,
  `legalMdxComponents`). `<Callout type="note|tip|warning|danger">` is
  available in every MDX file without an import.

## Primary colour and header bands

Primary is a dark matte blue (`primary-solid` #1b3560 light / #1f3d6e dark).
`components/BandBackdrop.tsx` draws the band: a `bg-linear-to-br` gradient
from `band-from` via `band-via` to `band-to`, three blurred blue glows
(`band-glow`, `-2`, `-3`) that drift slowly, a grid (`band-cell` squares)
masked to fade out from the top centre, and a thin light line at the bottom.
`components/HeaderBand.tsx` is the purely decorative strip (`aria-hidden`,
height `h-band`) on `/articles/:slug` and `/projects/:slug`, with the title
below it in `DocHeader`. `ListTemplate` (`/articles`, `/projects`) puts its
title and lede on the band itself, in gradient text.

## Layout widths

Content is capped at `max-w-page` (108rem = 1728 px), which leaves a
slim margin on a 1920 px screen; smaller screens use the full width minus
the gutters. Navbar and footer use `max-w-wide` (150rem = 2400 px). Never write pixel widths or
heights in components; add a token. Fluid tokens (`clamp()`, `min()`) keep
`calc()` out of components.

**Token naming rule.** Tailwind derives utilities from token names:
`--spacing-x` creates `inline-x`, `block-x`, `h-x`, `p-x` and more;
`--container-x` creates `max-w-x`, `w-x`, `basis-x`. Never name a token after
a utility keyword (`grid`, `flex`, `block`, `table`, `hidden`, `contents`):
`--spacing-grid` once produced `.inline-grid {inline-size: …}` and stretched
every `inline-grid` element (ADR-011).

## Navbar

`Navbar` is `fixed`, transparent at the top and frosted (`bg-canvas/70`,
`backdrop-blur-xl`, border) after scrolling. The controls use `rounded-sm`. `SiteLayout` offsets pages with `pt-nav`, except
band routes (`overlayRoutes`), whose band sits under the navbar. Over the
band the header has `data-tone="cover"`; children restyle through
`group-data-[tone=cover]/nav:` classes (shared strings in
`utils/navTone.ts`), and the CTA inverts to white (`coverCta`). Logo: one "SWEMRE" mark. The search trigger grows up to `max-w-search`.

## Sidebars

`components/SidebarNav.tsx` renders titled link sections with an optional
"All" link (`moreTo`). Article pages list Articles + Projects, project pages
list Projects + Articles, the articles index has Topics + Projects, the
projects index has Projects + Articles. Links come from `projectNavItem` and
`articleNavItem` in `utils/navItems.ts` and point at `/projects/<slug>` and
`/articles/<slug>`.

## Code highlighting

Shiki runs at build time (see `vite.config.ts`) with `github-light` and
`github-dark-dimmed`, `defaultColor: false`. `main.css` picks the variable
set from `data-theme`. Code fences need a language (` ```ts `).

## Tooling

- `prettier-plugin-tailwindcss` sorts classes (configured with
  `tailwindStylesheet: ./src/main.css`).
- VS Code: install the Tailwind CSS IntelliSense extension for completion of
  the custom tokens.

## Home page and avatar

The home page scrolls. A full-height hero on the band backdrop holds text
only (no avatar): a mono kicker, the job title with the name in blue gradient
text, the tagline, "Request a call back" (white) and "Request my resume"
(translucent), and live counts of articles, projects and songs. Below it,
numbered sections (`components/HomeSection.tsx`): 01 articles
(`components/home/ArticleShowcase.tsx`: the latest as a large cover feature, the
next three as a reading list with thumbnails), 02 projects
(`components/home/ProjectShowcase.tsx`: alternating case-study rows with the
cover in a browser frame, summary, a body excerpt, year, stack and live host,
and Case study, Live site and Source buttons), 03 songs, and 04 a contact panel
on the band backdrop. `components/CoverImage.tsx` shows a cover or, without
one, the title initials on the band gradient. Every layout stacks on phones,
adapts at tablet width and reaches its full layout at `lg`. The phone number is not shown; "Request a call
back" opens `forms/CallbackRequestForm.tsx` through `useResumeModal().openCallback`.
The owner's avatar is used only by the chat launcher and chat panel
(`public/images/avatar-96.png`, `avatar-384.png`).

## Footer

Icon-only links (`size-8` hit area, 16 px icons) with `aria-label` and
`title`; the copyright reads "© 2026 SWEMRE".
