# Software Version Description (SVD)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-013                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Version identification

| Item             | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| Product          | swemre-website                                               |
| Version          | `0.0.0` (`package.json`); untagged pre-release baseline      |
| Repository state | `main` at `8807ffc initialization` plus uncommitted working tree (not yet committed by the owner) |
| Build date       | 2026-10-15                                                   |
| Node             | 22.14.0                                                      |

## 2. Inventory

| Item               | Location                                           |
| ------------------ | -------------------------------------------------- |
| Source             | `src/` (pages, templates, components, hooks, context, services, database, forms, config, types, utils, `main.css`) |
| Scripts            | `scripts/generate-rss.mjs`, `scripts/license-headers.mjs` |
| Static assets      | `public/` (`favicon.svg`, `icons.svg`, generated `rss.xml`) |
| Configuration      | `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.vscode/` |
| Licence            | `LICENSE`, `NOTICE`                                |
| Documentation      | `.claude/` (this set)                              |

### 2.1 Content at this baseline

| Kind          | Items                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Articles (6)  | getting-started-with-mdx, designing-local-first-interactions, token-only-design-system-tailwind-v4, generic-service-layer-react, persistent-spotify-player-react, nasa-style-docs-for-small-projects |
| Projects (5)  | swemre-website (real; explains the site's structure), local-first-notes, realtime-dashboard, mdx-link-checker, token-forge (placeholders/examples) |
| Songs (5)     | Placeholder favourites with verified Spotify ids                                                                |
| Special pages | privacy-policy v1.2                                                                                             |

## 3. Changes in this baseline (M4, 2026-10-15)

- Layout: page container 108rem, navbar/footer 116rem, reading 75ch (≈ 70 characters per line), wider sidebar gaps, fluid
  sidebars (first set to 150/160/80rem, then narrowed at the owner's request).
- Header band on articles, projects and their detail pages: decorative only,
  primary-tone gradient + glow + grid, height token `--spacing-band`
  (≈150 px).
- Titles, breadcrumbs, tags and meta moved below the band (`DocHeader`).
- Article cover images and the `ArticleCover` type removed.
- Hard-coded sizes replaced by tokens: `w-dock`, `w-dialog`, `w-palette`,
  `max-h-palette`, `mt-dialog-top`, `h-embed`, `max-w-measure`,
  `max-w-hero`, `max-w-search`, `max-w-bubble`; Tailwind's default container
  scale cleared.
- Fixed a token collision (`--spacing-grid` → `--spacing-band-cell`) that
  broke `inline-grid` elements.
- Four new articles; two new example projects; swemre-website project page
  rewritten as a structure walkthrough.
- Privacy policy v1.1: chat storage and Spotify requests disclosed.
- Breadcrumbs and tags lost their "cover" tone variant.
- Engineering documentation set (SWE-DOC-000 to 013) created; owner-reserved
  docs drafted.
- All six articles and five project pages expanded to about 2,000 words.
- Sound design: synthesized interface sounds for pointer and keyboard
  input, dialogs, chat and forms; mute switch in the dock
  (`swemre:sound-muted`).
- RSS rebuilt on an append-only feed log (`feedDatabase.ts`): articles,
  projects, songs and notes; `atom:self` link; stable `lastBuildDate`;
  validation that fails the build; regeneration during `npm run dev`.
- Skills: `add-rss-item` (new), `new-article` (moved from commands),
  `new-project`, `new-song`; the `new-*` skills call `add-rss-item`.
- Privacy policy v1.2: sound preference listed.
- Branding: logo is a single "SWEMRE" mark; browser title "SWEMRE"; the
  displayed name is "Emre" (the privacy policy keeps the full legal name).
- Home page on the band backdrop (gradient and grid) with the avatar;
  avatar also in the chat launcher (smaller, rounded-md, presence dot on
  top) and chat panel; chat panel narrowed to 21rem by 28rem.
- Footer links icon-only; navbar and footer widened to 150rem.
- New `cancel` sound for Escape, Cancel/X buttons, backdrop clicks and
  closing the chat; smaller, semi-transparent mute switch.
- Every page now sets the browser title through `useDocumentTitle`.

## 4. Earlier baselines

| Milestone | Summary                                                                                     |
| --------- | ------------------------------------------------------------------------------------------- |
| M0        | Vite + React + MDX scaffold, two articles, localStorage interactions                       |
| M1        | `.claude` docs, gts checkstyle, Apache 2.0 + Commons Clause headers                        |
| M2        | Home, articles, projects, legal pages; services; search; Tailwind token theme; docs look    |
| M3        | Project pages, primary blue bands, Spotify dock, chat widget, single `type.d.ts`, no semicolons, comment clean-up |

## 5. Build and install

```text
npm ci
npm run checkstyle
npm run build        # outputs dist/
npm run preview      # serve dist/ locally
```

Deploy `dist/` to a static host with SPA fallback to `index.html`.

## 6. Verification summary for this baseline

| Check                          | Result                                     |
| ------------------------------ | ------------------------------------------ |
| `npm run checkstyle`           | Pass                                       |
| `npm run build`                | Pass                                       |
| `.d.ts` check (`--skipLibCheck false`) | Pass for `src/` (third-party `@types/mdx` errors ignored) |
| Visual check TC-MAN-01         | Pass at 1920×1080: article (light), articles index (dark), project page, projects index, home |
| Contrast analysis TC-MAN-03    | 1 failure: `fg-subtle` on `canvas`, dark (RSK-09) |
| Automated unit/component/E2E   | Not implemented (M5)                       |

## 7. Known issues and limitations

| Ref     | Issue                                                                 |
| ------- | --------------------------------------------------------------------- |
| RSK-11  | Resume requests are kept in memory only and lost on reload            |
| RSK-10  | Chat is offline-only; messages stay on the visitor's device           |
| RSK-04  | Failed loads leave pages on "Loading…"                                 |
| RSK-09  | One dark-mode contrast pair below 3:1                                  |
| RSK-03  | TypeScript `strict` disabled                                           |
| n/a     | Spotify previews are 30 seconds for logged-out visitors               |
| n/a     | Placeholder phone number and example projects (`TODO(swemre)`)        |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial SVD    | Claude, for swemre review |
