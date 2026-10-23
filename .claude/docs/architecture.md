# Software Design Description (SDD): architecture

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Document ID | SWE-DOC-003                                                  |
| Status      | Draft for owner review (drafted by Claude; owner to edit)    |
| Baseline    | 2026-10-15                                                   |
| Owner       | swemre                                                       |
| Parent      | SWE-DOC-001 (SMP), traces to SWE-DOC-002 (SRS)               |

> Owner note: this file used to be reserved for you. It now holds a full
> first draft describing the system as built. Edit freely; anything you
> change here becomes the rule Claude follows.

## 1. Scope

This SDD describes the architecture and detailed design of swemre-website:
the decomposition into layers and modules, the data and control flow, the
runtime state, and the rationale for each major decision. Interfaces are
specified in SWE-DOC-004 (ICD); decisions are recorded in SWE-DOC-012 (ADR).

## 2. Design goals and non-goals

### 2.1 Goals

| Goal                   | Design consequence                                                       |
| ---------------------- | ------------------------------------------------------------------------ |
| Familiar docs UX       | Docs layout (sidebar, body, table of contents), GitHub-like tokens       |
| Swappable data         | Every entity behind an async `SwemreService<T>`                           |
| Typed end to end       | One `type.d.ts`, typed service registry, typed search sources            |
| One source of style    | Token-only Tailwind theme, no CSS classes outside `main.css`              |
| Cheap content authoring | Metadata entry + MDX file, discovered with `import.meta.glob`            |
| Persistent dock        | Player and chat mounted by the layout route, never by a page             |
| Strict, automatic quality | gts lint, Prettier, license check, type check in two commands          |

### 2.2 Non-goals (this baseline)

- Server-side rendering or pre-rendering.
- User accounts, authentication, server persistence.
- A CMS; content lives in the repository.
- Internationalisation (English only).
- Offline support (no service worker).

## 3. Architectural overview

### 3.1 Context

```text
                 ┌──────────────────────────────────────────────┐
  Visitor ──────►│ Browser                                       │
                 │  ┌─────────────────────────────────────────┐ │
                 │  │ swemre-website SPA (static bundle)       │ │
                 │  │  React 19 + Router 7 + MDX bodies        │ │
                 │  └───┬───────────────┬─────────────────┬────┘ │
                 │      │ localStorage  │ iFrame API       │ <img>│
                 └──────┼───────────────┼─────────────────┼─────┘
                        ▼               ▼                 ▼
                  swemre:* keys   open.spotify.com   image-cdn-fa.spotifycdn.com
                                  (on first play)    (song artwork)

  Owner ──► Git repository ──► npm run build ──► dist/ ──► static host (planned)
```

### 3.2 Layered decomposition

```text
┌──────────────────────────────────────────────────────────────────────┐
│ L5  Pages            src/page/**          route components + MDX       │
├──────────────────────────────────────────────────────────────────────┤
│ L4  Templates        src/templates/**     page skeletons and layout     │
├──────────────────────────────────────────────────────────────────────┤
│ L3  Components/Forms src/components/**, src/forms/**   reusable UI      │
├──────────────────────────────────────────────────────────────────────┤
│ L2  Hooks/Context    src/hooks/**, src/context/**      state + access   │
├──────────────────────────────────────────────────────────────────────┤
│ L1  Services         src/services/**      data access, search, Spotify  │
├──────────────────────────────────────────────────────────────────────┤
│ L0  Data/Config/Types/Utils  src/database, src/config, src/types,       │
│                              src/utils, src/main.css                    │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 Dependency rules

| From \ may import → | page | templates | components/forms | hooks/context | services | database | config/types/utils |
| ------------------- | ---- | --------- | ---------------- | ------------- | -------- | -------- | ------------------ |
| page                | –    | ✔         | ✔                | ✔             | ✖ ¹      | ✖        | ✔                  |
| templates           | ✖    | ✔         | ✔                | ✔             | ✖        | ✖        | ✔                  |
| components/forms    | ✖    | ✖         | ✔                | ✔             | ✖ ²      | ✖        | ✔                  |
| hooks/context       | ✖    | ✖         | ✔ ³              | ✔             | ✔        | ✖        | ✔                  |
| services            | ✖    | ✖         | ✖                | ✖             | ✔        | ✔        | ✔                  |
| database/config     | ✖    | ✖         | ✖                | ✖             | ✖        | ✔        | ✔ (types only)     |

1. Exception: `ArticlePage` imports `articleInteractionStore` to register a
   view; candidate for a `useRegisterView` hook (RSK-07).
2. Exception: `SpotifyPanel` imports URL helpers from
   `services/spotifyIframeApi.ts` (pure functions).
3. Providers render UI they own (`SearchDialogProvider` renders
   `SearchDialog`, `ResumeModalProvider` renders the modal).

Pages never import `database/` (SRS-MNT-06). Types flow from
`types/type.d.ts` to every layer via `import type`.

## 4. Module design

### 4.1 Application shell

| Module                         | Responsibility                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `index.html`                   | Document shell; inline script applies the stored theme before first paint      |
| `main.tsx`                     | Mounts `StrictMode > BrowserRouter > ServiceProvider > ThemeProvider > App`    |
| `App.tsx`                      | `PlayerProvider > ChatProvider > SearchDialogProvider > ResumeModalProvider > Routes`; `*` renders `components/NotFound.tsx` |
| `components/NotFound.tsx`      | The one not-found view (route, article, project, special page): "404" kicker, title, message, back link; optional `band` (draws `HeaderBand`) and `contact` (shows the email); sets the document title |
| `components/Navbar.tsx`        | Fixed navbar; the mobile menu closes on Escape (focus back to the toggle), on `pointerdown` outside the header and when `pathname` changes (state reset during render, no effect) |
| `components/ErrorBoundary.tsx` | Class component that catches render errors below it, logs them with a scope name and shows `fallback`; a new `resetKey` clears the error |
| `components/ErrorPage.tsx`     | Fallback for page errors: "Something went wrong", Reload (full reload) and a link to `/`; sets the document title |
| `templates/SiteLayout.tsx`     | Layout route: `SkipLink`, `Navbar`, `Outlet` (inside an `ErrorBoundary` with `ErrorPage`, reset by `pathname`), `Footer`, `Dock` (inside an `ErrorBoundary` that renders nothing); decides navbar tone and top padding from `overlayRoutes` |
| `components/SkipLink.tsx`      | First focusable element: visually hidden "Skip to content" link shown on focus (`sr-only focus:not-sr-only`), focuses `<main>` on activation; renders the polite live region that announces the new title |
| `hooks/useRouteFocus.ts`       | Route change handling: sets `history.scrollRestoration = 'manual'`, saves `scrollY` per `location.key` on scroll, restores it on `POP` and scrolls to top on a new path; on a new path focuses `main h1` (else `<main>` after 3 s) with `preventScroll`, adding `tabindex=-1` if missing, then returns `document.title` for the live region. Both waits watch DOM mutations (async pages) and give up after 3 s |

Provider order matters: the dock (inside `SiteLayout`) needs player and chat
context; the search dialog can trigger `play-song`, so it sits inside the
player provider.

### 4.2 Routing

| Path               | Page           | Template            | Band route |
| ------------------ | -------------- | ------------------- | ---------- |
| `/`                | `HomePage`     | `HomeTemplate`      | No         |
| `/articles`        | `ArticlesPage` | `ListTemplate`      | Yes        |
| `/articles/:slug`  | `ArticlePage`  | `ArticleTemplate`   | Yes        |
| `/projects`        | `ProjectsPage` | `ListTemplate`      | Yes        |
| `/projects/:slug`  | `ProjectPage`  | `ProjectTemplate`   | Yes        |
| `/sp/:slug`        | `SpecialPage`  | `CorporateTemplate` | No         |
| `*`                | `NotFound`     | `components/NotFound.tsx` | No   |

Band routes render `HeaderBand` at the top, under the fixed transparent
navbar, so `SiteLayout` does not add `pt-nav` for them. `ArticlePage` and
`ProjectPage` therefore draw `HeaderBand` in every state: while loading
(above "Loading…") and when not found (`NotFound band`), so the light navbar
text never sits on the plain canvas (SRS-LAY-08).

### 4.3 Data layer (services)

```text
             SwemreService<T> (interface, Promise-based CRUD)
                         ▲
              ArrayService<T> (abstract, holds rows: T[])
          ┌──────────┬───┴────────┬─────────────┬───────────────┐
   ArticleService ProjectService SongService SpecialPageService ContactFormService
   (+findBySlug,  (+findBySlug,              (+findBySlug,      (+submitResumeRequest,
    getBody)       getBody)                   getBody)            submitCallbackRequest)
   └─ list cached per session (cacheList) ──────────┘
                                    LocalStorageService<T> (persists on write)
                                               ▲
                                          ChatService (+presence, start, list, enqueue,
                                                       deliver, markSending, pending,
                                                       connect, receive)

   SearchService (register(source) → search(query))  — not an entity service
```

- `services/publicApi.ts` (ADR-017) is the only module that knows public
  API paths and headers; services call its typed methods and the RSS, sitemap and
  pre-render scripts import it too. `config/env.ts` reads `SiteEnv` from
  `import.meta.env` in the bundle and from `process.env` in Node; one build
  serves one website. `apiClient.ts` keeps only the field helpers.
- `serviceRegistry.ts` instantiates each service once; `createSearchService`
  registers all sources against those instances.
- `ServiceContext` defaults to the registry; `ServiceProvider` can inject a
  different map (tests).
- `useService(name)` returns `ServiceMap[name]` with its concrete type.
- `useAsyncData(loader)` runs a stable loader and returns `{data, loading}`;
  `useFindAll(service)` wraps `findAll`.

**List caching (SRS-PERF-05).** `ArrayService`'s constructor takes
`cacheList`. When it is `true` (`ArticleService`, `ProjectService`,
`SongService`, `SpecialPageService`), the constructor wraps the subclass's
`findAll` so the API request runs once per page session: the first call
stores the promise, concurrent and later callers share it, and every caller
gets a shallow copy (`[...list]`) it may sort. An empty list or a rejection
clears the cache, because the API services also answer `[]` when the API is
unreachable; the next call then asks again. `findBySlug` and `getBody` are
unchanged. `ChatService` and `ContactFormService` do not cache.

**Contact forms.** `ContactFormService.submitResumeRequest` and
`submitCallbackRequest` share `submitForm(form, fields)`, which posts to
`/forms/<form>/submissions` and throws `ApiError(404)` when `publicRequest`
returns `undefined` (the form does not exist). Only a confirmed submission
resolves, so the forms never show a false success (SRS-RES-03, RES-06).

**Covers.** `apiClient.ts` reads a media field's `altText`, `width` and
`height` (`fieldMediaAlt`, `fieldMediaSize`); `Article` and `Project` carry
them as `coverAlt`, `coverWidth`, `coverHeight`, and `CoverImage` and
`DocHeader` pass them to `<img>` (SRS-A11Y-08).

MDX bodies: `mdxBodies.ts` turns an `import.meta.glob` map into
`{[slug]: React.lazy(...)}` **at module load**, so each body is a separate
chunk and no component is created during render
(`react-hooks/static-components`). `MdxBody` renders the lazy component inside
`Suspense` with an `MDXProvider` component map.

### 4.4 Visitor interaction store

`ArticleInteractionStore` is an external store for
`useSyncExternalStore`: an in-memory cache over `localStorage`
(`swemre:article-interactions`), a listener set, and a `storage` event
listener for cross-tab sync. Writes are immutable updates followed by
`notify`. Failures to read fall back to `{}`; failures to write keep the
in-memory state.

`registerView(id)` counts once per browser session (SRS-ART-11): a
module-level set guards the current page load (this replaces the old ref
guard in `ArticlePage` and also covers StrictMode), and the ids already
counted are kept in `sessionStorage` under `swemre:viewed-articles` (JSON
array), so a reload in the same tab does not count again. Without
`sessionStorage` the set alone applies (once per page load).

### 4.5 Content templates

| Template            | Layout                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `DocsLayout`        | Grid `sidebar │ body (max-w-reading) │ TOC` from `utils/layout.ts` `docsColumns`; owns `bodyRef` and `useHeadings`; `before`/`after` slots; below `xl`, when there are headings, a closed `<details>` "On this page" with `Toc showTitle={false}` between `before` and the body (SRS-ART-16) |
| `ArticleTemplate`   | `HeaderBand` + `DocsLayout` with `DocHeader` (breadcrumbs, tags, title, summary, meta, actions, cover) before the body, and the helpful box + pager after |
| `ProjectTemplate`   | `HeaderBand` + `DocsLayout` with `DocHeader` (year badge, tags, Live/Source buttons, cover) and pager |
| `ListTemplate`      | `HeaderBand`, title row with toolbar, then `sidebar │ content` grid; the sidebar moves after the content below `lg`, or is hidden there with `sidebarFromLg` (articles index, which shows topic chips above the list instead) |
| `CorporateTemplate` | Light banner with version table, numbered contents rail and a framed "file view" body          |
| `HomeTemplate`      | Hero block (`max-w-hero`) and a three-column grid; one-screen at `lg`                          |

`HeaderBand` is purely decorative (`aria-hidden`): primary-tone gradient
(`band-from → band-via → band-to`), a radial glow and a token-sized grid,
height `h-band`.

`DocHeader` takes an optional `cover` (`src`, `alt`, `width`, `height`) and
renders it as the last element of the header, eagerly with
`fetchPriority="high"` because it is usually the largest paint (SRS-ART-15,
PRJ-07). `SidebarNav` drops sections with no items and renders nothing when
none remain (SRS-LAY-09); the projects index passes only an Articles section
and no sidebar when there are no articles (SRS-PRJ-09).

### 4.6 Search

`SearchService.register(source)` stores a loader that maps items of any
`Searchable` type to `SearchDocument`s (pre-lower-cased title, tags, body
text, plus a `SearchAction`). `search(query)` loads all documents, splits the
query into terms, scores each document (title prefix 100, title word prefix
70, title substring 50, tag prefix 40, body 15; any unmatched term → 0) and
returns the top 20. `SearchDialog` groups results by category and executes the
action: `navigate`, `external` or `play-song`.

An empty query returns a default list instead of every document: a source
may declare `featured` (how many of its items the empty query lists; all
when omitted, none when `0`). Pages omit it, Articles use `5` (the newest,
because `findAll` is sorted), Projects, Songs and Legal use `0`
(SRS-SRCH-08). `useSearchResults` keeps the last settled `{query, results}`
and returns results only when `settled.query` equals the current query, so
while a new query loads the list is empty and Enter cannot open a stale
result (SRS-SRCH-07).

### 4.7 Dock: player and chat

```text
SiteLayout ─► Dock (fixed, bottom-right, pointer-events-none container)
               ├─ ChatPanel        (when chat.isOpen)
               ├─ SpotifyPanel     (always mounted; hidden when no song;
               │                    forceCollapsed while chat is open)
               └─ ChatLauncher     ("SW" avatar + presence dot)
```

**Player state machine** (`PlayerProvider`):

```text
          toggle(song)            ready → play()
 [Idle] ─────────────► [Loading API] ─────────────► [Playing] ◄──┐
   ▲                        │ load error                │ toggle   │ toggle
   │                        ▼                           ▼          │
   │                   [Failed: iframe fallback]    [Paused] ──────┘
   │ close()                                         │ toggle(other song): loadUri + play
   └─────────────────────────────────────────────────┘
```

One `SpotifyEmbedController` is created on the first play and reused through
`loadUri`. `playback_update` events drive `isPaused`. The host element is a
local ref in `SpotifyPanel`, registered with `attachHost` in an effect, so the
context value is not treated as a ref by the React Compiler. Collapse uses
`h-0 overflow-hidden` so the iframe keeps playing.

**Phones (below 640 px).** `Dock` renders an `aria-hidden` spacer
(`h-dock-clear`) after the footer and offsets the fixed dock by
`mb-safe-bottom`; the sound and chat buttons stack vertically. The open
`ChatPanel` becomes a fixed full-screen sheet (`h-dvh`, `pt-safe-top`,
`pb-safe-bottom`), and `usePhoneScrollLock` sets `overflow: hidden` on the
root element while the panel is open and the phone media query matches
(SRS-LAY-07, CHAT-14).

**Chat** (`ChatProvider` + `ChatService`): conversations are
`LocalStorageService<Conversation>` rows. `start()` creates a conversation
with the owner greeting. Sending is split so the message shows before the API
answers (SRS-CHAT-10 to CHAT-12):

```text
 send(text) ─► enqueue(): append visitor message [sending], title from the first
               visitor message, re-mark [queued] ones as [sending] ─► refresh
           ─► deliver(id) ─► flush(): post each unsent message in order
                               ├─ API stored it ──► replace local copy by server list [sent]
                               └─ error / 404 ────► every unsent message [queued], stop

 [sending] ──ok──► [sent]          [sending] ──fail──► [queued]
 [queued] ──retry(id): markSending + deliver──► [sending]
 page load: stored [sending] ──► [queued]
```

`retry(id)` runs on a tap on a queued bubble, for every conversation in
`pending()` when the panel opens and on the window `online` event, and for
one conversation when its socket reports `connected` (`onopen`, also after a
reconnect). `deliver` chains calls per conversation through a promise map,
so a retry while a post is in flight never posts the same message twice.
`merge` keeps the greeting and every unsent local message after the server's
list. `refresh()` reads the stored list (`list()`); only `findAll()` syncs
every conversation with the API. Presence only changes the banner; it does
not hold messages back.

`ConversationRow` asks for confirmation before `remove` (Cancel focused,
Escape cancels); the delete button is shown on hover, on focus within the
row and always on `pointer-coarse` devices (SRS-CHAT-13).

### 4.7a Sound

```text
SoundProvider (outermost in App)
  ├─ capture listeners on document: pointerdown, keydown ─► classify ─► soundEngine.play
  ├─ state: muted (localStorage swemre:sound-muted) ─► soundEngine.setMuted
  └─ context: {muted, toggleMuted, play} ─► Modal (open/close), ChatPanel (send),
                                             ResumeRequestForm (error/success), SoundToggle
soundEngine (services/soundEngine.ts, no React)
  lazy AudioContext ─► master gain 0.18 ─► destination
  recipe per SoundName: oscillator type, start/end Hz, duration, delay, gain
  28 ms de-duplication per sound; try/catch → silent on failure
```

Delegation keeps components free of sound code: any button, link or
control gets a sound automatically. Elements that play a more specific
sound opt out with `data-sound="none"`. The `AudioContext` is created and
resumed on the first gesture, which satisfies browser autoplay policies.

### 4.8 Theme

`index.html` applies `data-theme` before React loads: the stored choice, or
the system preference. `ThemeProvider` keeps two inputs: `chosen` (the stored
`swemre:theme`, or `null`) and `system`, read with `useSyncExternalStore`
from `matchMedia('(prefers-color-scheme: dark)')` and its `change` event.
`mode = chosen ?? system`; an effect writes `data-theme`. Only `toggle()`
writes the key, so a first visit stores nothing and the theme keeps
following the OS until the visitor picks one (SRS-THM-02). All colours are
CSS variables, so no component uses `dark:` for colour.

### 4.8a Document metadata

`useDocumentTitle(title?, meta?)` sets `document.title` (`<title> · SWEMRE`
or `SWEMRE`) and creates or updates `<meta name="description">`,
`<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:image`,
`twitter:card`, `twitter:title`, `twitter:description` and `twitter:image` in
`document.head`. The values come from `utils/documentTags.ts`
(`documentTags(site, pathname, title, meta, defaultImage)`), which has no
runtime imports so `scripts/prerender.mjs` uses it too; canonical and
`og:url` are `siteConfig.url` + `pathname` without a trailing slash. `meta` is
`DocumentMeta` (`description?`, `image?`); without them the site description
and `siteConfig.avatarLarge` are used, and `twitter:card` is `summary`
instead of `summary_large_image`. Article and project pages pass their
summary and cover, special pages their summary, and the detail pages pass no
title while loading and "… not found" after (SRS-GEN-05, GEN-06). The same
tags are pre-rendered per route after the build (§4.10a, ADR-016);
`index.html` holds the defaults for routes without a pre-rendered file.

### 4.9 Styling system

`src/main.css` clears Tailwind's namespaces (`color`, `shadow`,
`inset-shadow`, `drop-shadow`, `radius`, `font`, `text`, `container`) and
defines semantic tokens. Layout sizes are tokens (`--container-*`,
`--spacing-*`), including fluid ones (`clamp()`, `min()`), so components use
names like `max-w-page`, `w-dock`, `h-band`, never pixel values.

`main.css` base layer also removes the outline on `main` and `main h1` when they carry `tabindex=-1` and are focused programmatically (they are not in the Tab order, so SRS-A11Y-02 still holds).

Token naming caution: a `--spacing-<name>` token generates utilities such as
`inline-<name>` and `block-<name>`. A token named `grid`, `flex`, `table` or
`block` would override display utilities (this happened with
`--spacing-grid`; see ADR-011).

### 4.10 Build pipeline

```text
predev/prebuild: scripts/generate-rss.mjs  (Node 22 type stripping reads database/*.ts;
                 resolves feedDatabase against article/project/song databases; exit 1 on problems)
                 then scripts/generate-sitemap.mjs (npm run sitemap; reads siteConfig.url,
                 fetches published article/project/page posts from the public API
                 (VITE_API_BASE, VITE_WORKSPACE_KEY), writes public/sitemap.xml;
                 API unreachable: keeps the old file, exit 0, or exit 1 if none exists)
dev: swemre-rss Vite plugin reruns the script when src/database or src/config changes
build: tsc -b  →  vite build
  plugins: @tailwindcss/vite → @mdx-js/rollup (remark-gfm, @shikijs/rehype dual theme)
           → @vitejs/plugin-react → babel(React Compiler preset)
postbuild: scripts/prerender.mjs (npm run prerender; §4.10a)
preview: swemre-prerendered-routes plugin serves dist/<route>/index.html for /<route>
```

### 4.10a Route pre-render (ADR-016)

`scripts/prerender.mjs` reads `dist/index.html` as the shell, cuts out its
`<title>`, description, canonical, `og:title|description|url|image` and
`twitter:*` tags, and writes for every route the shell with the tags of
`documentTags` in place of the `<title>`. Routes: `/` (written back to
`dist/index.html`), `/articles`, `/projects` and every published article,
project (`/articles|projects/<slug>`, title `seoTitle` else title,
description `seoDescription` else `summary`, image `ogImage` else `cover`)
and special page (`/sp/<slug>`, description `summary` else `seoDescription`,
image `ogImage` only), mirroring the page components. The default image is
the site settings' `defaultOgImage`, else the large avatar. Media URLs
follow `fieldMediaUrl` (relative paths prefixed with `VITE_API_BASE`).
Before writing, the `index.html` of every folder under `dist/articles`,
`dist/projects` and `dist/sp` is removed, so unpublished posts lose their
page; because the shell's managed tags are replaced, not appended, running
the script again gives the same files (SRS-PRE-02). Lists are read with
`size=100`, like the RSS and sitemap scripts.

Serving: Garage serves the bucket behind Traefik (swemre-website-api
`deploy/`). Today the Traefik `spa-index` middleware rewrites every path
without an extension to `/index.html`, so the pre-rendered files are not
reached in production until the deploy config serves `/<route>` from
`<route>/index.html` and falls back to `index.html` only when that object is
missing (for example a `replacePathRegex` to `/$1/index.html` plus Garage's
existing `--error-document index.html`, which answers unknown routes with
the SPA shell and status 404). Unverified on the server.

## 5. Data design

| Entity        | Store                         | Key / file                        | Lifetime            |
| ------------- | ----------------------------- | --------------------------------- | ------------------- |
| Article       | `database/articleDatabase.ts` | `id` (8-hex, permanent), `slug`   | Build               |
| Project       | `database/projectDatabase.ts` | `id`, `slug`                      | Build               |
| Song          | `database/songDatabase.ts`    | `id`, `spotifyId`                 | Build               |
| SpecialPage   | `database/specialPageDatabase.ts` | `slug`                        | Build               |
| NavigationItem| `database/navigationDatabase.ts` | `id`                           | Build               |
| ContactForm   | `database/contactFormDatabase.ts` (in memory) | UUID              | Page session        |
| Interactions  | `localStorage`                | `swemre:article-interactions`     | Browser, persistent |
| Conversation  | `localStorage`                | `swemre:chat-conversations`       | Browser, persistent |
| Theme         | `localStorage`                | `swemre:theme` (only after a toggle) | Browser, persistent |
| Viewed articles | `sessionStorage`            | `swemre:viewed-articles`          | Browser tab session |
| Article, project, song, special-page lists | Service memory (`ArrayService` list cache) | per service | Page session; not kept when empty |
| Sitemap       | `public/sitemap.xml` (generated) | URL list                       | Build               |
| Route pages   | `dist/<route>/index.html` (generated) | route path                | Build or `npm run prerender` |
| Sound muted   | `localStorage`                | `swemre:sound-muted`              | Browser, persistent |
| FeedItem      | `database/feedDatabase.ts`    | `id` (permanent)                  | Build               |

Schemas: SWE-DOC-004 §5.

## 6. Error handling design

| Failure                                   | Behaviour                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Unknown route or slug                     | "Not found" view with a link back                                 |
| Render error in a page                    | `ErrorPage` inside the layout, error logged; cleared on the next route (SRS-GEN-07) |
| Render error in the chat or player        | Dock hidden, page keeps working, error logged (SRS-GEN-08)         |
| `localStorage` read throws or holds junk  | Fallback to empty state                                           |
| `localStorage` write throws (quota, blocked) | Keep in-memory state, continue                                 |
| Spotify iFrame API fails to load          | `failed` state, plain embed iframe fallback; script promise reset for retry |
| Loader promise rejects in `useAsyncData`  | **Not handled**: stays `loading` (RSK-04, planned fix)             |
| Resume or call back submission rejects, or the form does not exist (404) | Error sound and alert; the form stays editable for another try (SRS-RES-05, RES-06) |
| Chat message not accepted by the API      | Message `queued` ("Not sent · tap to retry"); retried on tap, socket connect, `online` and panel open |
| List request fails or returns empty       | Not cached; the next `findAll` asks the API again                 |
| Sitemap script cannot reach the API       | Existing `public/sitemap.xml` kept (exit 0); exit 1 when there is none |
| Pre-render cannot reach the API           | Warning, `dist/` unchanged, exit 0; every route serves the `index.html` defaults |
| Pre-render finds a slug that is not plain | That route is skipped with a warning; it keeps the SPA fallback |

## 7. Performance design

- MDX bodies are lazy chunks; the home page loads none of them.
- Shiki runs at build time; no highlighter ships to the browser.
- The Spotify script loads only on first play.
- The React Compiler memoises components automatically; manual `useMemo`
  and `useCallback` are used only where a stable identity is part of a
  contract (`useAsyncData` loaders).

## 8. Security and privacy design

- No cookies, analytics or third-party scripts until the visitor presses play.
- React escapes all user text (chat, form values); no
  `dangerouslySetInnerHTML` anywhere.
- External links in new tabs use `noreferrer noopener`.
- Data stays on the device; the privacy policy describes the keys.

## 9. Deployment design (planned)

| Item          | Plan                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| Hosting       | Static host with SPA fallback to `index.html` (for example Cloudflare Pages, Netlify or GitHub Pages with a 404 redirect) |
| Domain        | `swemre.com` (`siteConfig.url`)                                          |
| CI            | On every push: `npm ci`, `npm run checkstyle`, `npm run build`, tests (M5) |
| Environments  | Preview per branch, production from `main` tags                         |
| Caching       | Hashed assets immutable; `index.html` and `rss.xml` short-lived          |

## 10. Requirements allocation

| Design element                     | Requirements                                         |
| ---------------------------------- | ---------------------------------------------------- |
| `SiteLayout`, `Navbar`, `Footer`   | GEN-02, NAV-*, FTR-01, LAY-02                        |
| `SkipLink`, `useRouteFocus`        | GEN-04, A11Y-09, A11Y-10                             |
| `HeaderBand`, templates, tokens    | LAY-01, LAY-03 to LAY-06, LAY-08, ART-06, ART-15 to ART-17, PRJ-03, PRJ-07 |
| `NotFound`                         | GEN-03, ART-10, PRJ-05, LGL-04                       |
| `useDocumentTitle`, `documentTags` | GEN-05, GEN-06, PRE-01                               |
| `SidebarNav`, `ProjectsPage`, `HomePage`, `ArticleShowcase` | LAY-09, PRJ-08, PRJ-09, HOME-02, HOME-05, HOME-06 |
| Services + registry + hooks        | ART-01 to ART-03, PRJ-01, PRJ-02, MNT-06, MNT-09, PERF-05, A11Y-08 |
| `ArticleInteractionStore`          | ART-11 to ART-13, SEC-06, CMP-03                     |
| `SearchService`, `useSearchResults`, `SearchDialog` | SRCH-*                              |
| `PlayerProvider`, `SpotifyPanel`, `SongRow` | PLY-*                                       |
| `ChatService`, `ChatProvider`, chat components, `Dock` | CHAT-*, LAY-07                   |
| `ResumeModalProvider`, `ResumeRequestForm`, `CallbackRequestForm`, `ContactFormService` | RES-* |
| `ThemeProvider`, inline script     | THM-*                                                |
| `CorporateTemplate`, `SpecialPage` | LGL-*                                                |
| `scripts/generate-rss.mjs`, `feedDatabase`, `swemre-rss` plugin, skills | RSS-*            |
| `scripts/generate-sitemap.mjs`, `public/robots.txt` | MAP-*                               |
| `scripts/prerender.mjs`, `swemre-prerendered-routes` plugin | PRE-*                     |
| `SoundProvider`, `soundEngine`, `SoundToggle` | SND-*                                     |

Full trace: SWE-DOC-007.

## Change log

| Date       | Change                                             | Author                    |
| ---------- | -------------------------------------------------- | ------------------------- |
| 2026-10-15 | Owner placeholder replaced with full SDD draft     | Claude, for swemre review |
| 2026-10-15 | Added §4.7a sound design and the feed log pipeline | Claude, for swemre review |
| 2026-10-23 | UX fixes: shared `NotFound`, band while loading, list caching, contact-form failure handling, covers, session view count, search default list, chat delivery states and phone sheet, theme follows the OS, §4.8a document metadata, sitemap step | Claude, for swemre review |
| 2026-10-23 | PRS-000332: error boundaries around the page outlet and the dock (§4.1, §6) | Claude, for swemre review |
| 2026-10-23 | PRS-000321: `SkipLink` and `useRouteFocus` (skip link, focus and title announcement on route change, scroll restore on back/forward); `main.css` hides the focus ring on programmatic `tabindex=-1` targets (`main`, `main h1`) | Claude, for swemre review |
| 2026-10-23 | PRS-000311: canonical and Twitter tags through `documentTags`, §4.10a route pre-render, preview plugin | Claude, for swemre review |
| 2026-10-23 | §4.3: one public API client and one site environment (ADR-017) | Claude, for swemre review |
