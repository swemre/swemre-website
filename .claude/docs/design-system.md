# Design system

Look and feel target: GitHub and SaaS documentation sites (familiar,
technical, calm). Small radii, thin borders, boxes with header bars, quiet
shadows.

## Where tokens live

`src/main.css` is the only stylesheet. It:

1. imports Tailwind v4;
2. clears Tailwind's defaults (`--color-*`, `--shadow-*`, `--inset-shadow-*`,
   `--drop-shadow-*`, `--radius-*`, `--font-*`, `--text-*`, `--container-*`:
   initial) so only project tokens exist;
3. defines light values in `@theme`;
4. overrides the same variables under `:root[data-theme='dark']`
   (GitHub "dark dimmed" grey-blue family);
5. adds a tiny base layer (body, selection, focus ring, Shiki theme switch).

Theme switching only changes CSS variables, so components never need `dark:`
variants for colours. A `dark:` custom variant exists for rare non-colour cases.

## Tokens → utilities

| Group    | Tokens (utility suffix)                                                  |
| -------- | ------------------------------------------------------------------------ |
| Surfaces | `canvas`, `canvas-subtle`, `surface`, `surface-muted`, `overlay`, `inset` |
| Text     | `fg`, `fg-strong`, `fg-muted`, `fg-subtle`, `fg-on-emphasis`             |
| Borders  | `border`, `border-muted`, `border-strong`                                |
| Brand    | `primary`, `primary-emphasis`, `primary-muted`, `primary-solid(-hover)`, `secondary`, `secondary-muted` |
| Status   | `success`, `attention`, `danger` (+ `-muted`), `spotify`                 |
| Cover    | `cover-fg`, `cover-ink`: same in both themes, for navbar content over the header band |
| Band     | `band-from`, `band-via`, `band-to` (gradient in primary tones), `band-glow`; separate light and dark values |
| Effects  | `shadow`, `shadow-strong`, `scrim` (dialog backdrop)                     |
| Shadows  | `shadow-xs` `sm` `md` `lg` `xl` `overlay`                                |
| Radius   | `rounded-xs` 2px, `sm` 4px (default choice), `md` 6px, `lg` 8px, `full`  |
| Fonts    | `font-sans` (system/GitHub stack), `font-heading`, `font-mono`           |
| Text     | `text-2xs` … `text-6xl`, plus `text-reading` (article body), each with a paired line height |
| Containers | `page` 108rem (content), `wide` 150rem (navbar/footer), `reading` 75ch (doc column incl. header; ≈ 65 to 75 characters per line), `sidebar` `clamp(14rem, 14vw, 19rem)`, `hero` 64rem, `measure` 48rem (ledes), `search` 20rem, `dialog` / `palette` / `dock` (fluid `min(…, 100vw - 2rem)`), `bubble` 80%. Use as `max-w-*`, `w-*`, `basis-*` |
| Spacing  | `nav` (navbar height), `sticky` (sticky offset), `band` (header band, `clamp(8.5rem, 16vh, 10rem)`), `band-cell` (band grid), `embed` (Spotify embed, 152 px), `dialog-top`, `palette` (search max height), `chat` (chat panel height). Use as `h-*`, `pt-*`, `top-*`, `mt-*`, `max-h-*` |
| Motion   | `animate-pop`, `animate-fade`, `animate-eq` (equalizer bars)             |

Examples: `bg-surface border border-border rounded-sm shadow-xs`,
`text-fg-muted text-sm`, `bg-primary-muted text-primary`.

## Shared class helpers

- `utils/cn.ts`: join class lists (Prettier sorts classes inside `cn()`).
- `utils/buttonClass.ts`: `buttonClass(variant, size, extra)` with
  `primary | secondary | ghost` and `sm | md | lg`. When overriding `display`
  on a button, use a variant (`max-sm:hidden`), not `hidden`, because the
  base classes include `inline-flex`.
- `forms/FormField.tsx`: `inputClass` and the label/error wrapper.

## Recurring patterns

- **Box**: `rounded-md border border-border bg-surface shadow-xs`, header bar
  `border-b border-border bg-surface-muted px-4 py-2.5`, rows
  `divide-y divide-border-muted` (`components/ListBox.tsx`).
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

Primary is a deep blue (`primary-solid` #12357f light / #1b3a8a dark).
`components/HeaderBand.tsx` is a purely decorative strip (`aria-hidden`) at
the top of `/articles`, `/articles/:slug`, `/projects` and `/projects/:slug`:
a `bg-linear-to-br` gradient from `band-from` via `band-via` to `band-to`, a
radial `band-glow` highlight and a faint grid (`band-cell` squares), height
`h-band` (≈150 px including the navbar). It contains no text and no images;
titles are rendered below it by `DocHeader` or `ListTemplate`.

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

`Navbar` is `fixed`, transparent at the top and solid (`bg-canvas/85`, blur,
border) after scrolling. `SiteLayout` offsets pages with `pt-nav`, except
band routes (`overlayRoutes`), whose band sits under the navbar. Over the
band the header has `data-tone="cover"`; children restyle through
`group-data-[tone=cover]/nav:` classes (shared strings in
`utils/navTone.ts`), and the CTA inverts to white (`coverCta`). Logo: one
"SWEMRE" mark. The search trigger grows up to `max-w-search`.

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

The home page sits on the same backdrop as the header bands
(`components/BandBackdrop.tsx`: gradient, glow, grid), full height, with the
navbar in cover tone. Hero text uses `cover-fg`; the phone button is white
and the resume button translucent white. The owner's avatar (pixel-art
GitHub profile picture) is served from `public/images/avatar-96.png` and
`avatar-384.png` (`siteConfig.avatar`, `avatarLarge`) and appears in the hero,
the chat launcher (rounded-md, presence dot on the top corner) and the chat
panel.

## Footer

Icon-only links (`size-8` hit area, 16 px icons) with `aria-label` and
`title`; the copyright reads "© 2026 SWEMRE".
