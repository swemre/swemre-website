# Project overview

## What it is

The personal website of swemre (Emre Caniklioglu, Software Engineer): a
one-screen home page, an articles section, a projects section, legal pages,
site-wide search, and a bottom-right dock with a Spotify player and a chat
widget. Formal requirements: `engineering/software-requirements-specification.md`.

## Stack

| Concern     | Choice                                                      |
| ----------- | ----------------------------------------------------------- |
| Framework   | React 19 (React Compiler enabled via babel preset)          |
| Language    | TypeScript ~6.0, ESM, `erasableSyntaxOnly` (no parameter properties, enums); `strict` currently off (RSK-03) |
| Build       | Vite 8 (Rolldown)                                           |
| Routing     | react-router-dom 7 (`BrowserRouter`, one layout route)      |
| Content     | MDX 3 via `@mdx-js/rollup` + `@mdx-js/react`, `remark-gfm`   |
| Styling     | Tailwind CSS v4; all tokens in `src/main.css`, `data-theme` light/dark |
| Code blocks | Shiki at build time (`@shikijs/rehype`), GitHub light / dark-dimmed |
| Lint/format | ESLint 9 + `gts` 7, Prettier 3, no semicolons               |
| Data        | Array "databases" behind async services; localStorage for visitor state |
| Third party | Spotify iFrame API (on first play), Spotify image CDN (artwork) |

## Folder layout (`src/`)

Pages hold only pages. Everything reusable lives in its own top-level folder.

```text
page/                 ONLY page components and MDX bodies
  home/HomePage.tsx          /
  article/                   /articles, /articles/:slug
    ArticlesPage.tsx, ArticlePage.tsx
    <slug>.mdx               article bodies (filename = slug)
  projects/                  /projects, /projects/:slug
    ProjectsPage.tsx, ProjectPage.tsx
    <slug>.mdx               project bodies (filename = slug)
  sp/                        "special pages" (legal): /sp/:slug
    SpecialPage.tsx, privacy-policy.mdx
templates/            SiteLayout, HomeTemplate, ListTemplate, DocsLayout,
                      ArticleTemplate, ProjectTemplate, CorporateTemplate
components/           Navbar, Footer, HeaderBand, DocHeader, Modal, Icon,
                      SongRow, SpotifyPanel, Dock, chat/, search/, mdx/, ...
hooks/                useService, useFindAll, useAsyncData, usePlayer,
                      useChat, useHeadings, useActiveHeading, ...
context/              Service, Theme, Player, Chat, SearchDialog, ResumeModal
                      (XContext.ts + XProvider.tsx)
forms/                ResumeRequestForm, FormField, validateResumeRequest
services/             SwemreService implementations, registry, search,
                      interaction store, Spotify loader
database/             Plain arrays that act as the database for now
types/type.d.ts       Every type, one file, sectioned
config/site.ts        Name, phone, email, social links, paths
utils/                cn, buttonClass, formatDate, slugify, layout, navTone, navItems
main.css              The whole design system
```

Outside `src/`: `scripts/` (license headers, RSS generator), `public/`
(`rss.xml` generated, icons), `.claude/`, `.vscode/`.

## Routes

| Path               | Page           | Template            | Header band |
| ------------------ | -------------- | ------------------- | ----------- |
| `/`                | `HomePage`     | `HomeTemplate`      | No          |
| `/articles`        | `ArticlesPage` | `ListTemplate`      | Yes         |
| `/articles/:slug`  | `ArticlePage`  | `ArticleTemplate`   | Yes         |
| `/projects`        | `ProjectsPage` | `ListTemplate`      | Yes         |
| `/projects/:slug`  | `ProjectPage`  | `ProjectTemplate`   | Yes         |
| `/sp/:slug`        | `SpecialPage`  | `CorporateTemplate` | No          |
| `*`                | inline 404     |                     | No          |

All routes render inside `SiteLayout` (fixed `Navbar`, `Footer`, `Dock`).

## Home page

Fits one screen without scrolling at `lg` (≥ 1024 px; `SiteLayout` sets
`lg:h-dvh lg:overflow-hidden` on `/`); below that it flows and scrolls. Hero
(title, sentence, `tel:` button, "Request my resume" button) above three
list columns: articles, projects, songs I liked (five items each). The navbar
has the same resume CTA beside the theme switch; both open one shared modal.

## Placeholders to replace (`TODO(swemre)`)

- `config/site.ts`: phone number, LinkedIn URL.
- `database/projectDatabase.ts`: p2 to p5 are placeholders or examples (their
  MDX pages start with a warning callout).
- `database/songDatabase.ts`: placeholder favourites.

## Where to look next

- Everyday guides: `commands.md`, `article-system.md`, `design-system.md`,
  `checkstyle.md`, `licensing.md`.
- Engineering set (NASA NPR 7150.2 style): `engineering/README.md`.
