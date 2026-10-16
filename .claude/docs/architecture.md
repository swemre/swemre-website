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
| `App.tsx`                      | `PlayerProvider > ChatProvider > SearchDialogProvider > ResumeModalProvider > Routes`; inline 404 |
| `templates/SiteLayout.tsx`     | Layout route: `Navbar`, `Outlet`, `Footer`, `Dock`; scroll-to-top on route change; decides navbar tone and top padding from `overlayRoutes` |

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
| `*`                | `NotFound`     | inline              | No         |

Band routes render `HeaderBand` at the top, under the fixed transparent
navbar, so `SiteLayout` does not add `pt-nav` for them.

### 4.3 Data layer (services)

```text
             SwemreService<T> (interface, Promise-based CRUD)
                         ▲
              ArrayService<T> (abstract, holds rows: T[])
          ┌──────────┬───┴────────┬─────────────┬───────────────┐
   ArticleService ProjectService SongService SpecialPageService ContactFormService
   (+findBySlug,  (+findBySlug,              (+findBySlug,      (+submitResumeRequest)
    getBody)       getBody)                   getBody)
                                    LocalStorageService<T> (persists on write)
                                               ▲
                                          ChatService (+presence, start, send)

   SearchService (register(source) → search(query))  — not an entity service
```

- `serviceRegistry.ts` instantiates each service once; `createSearchService`
  registers all sources against those instances.
- `ServiceContext` defaults to the registry; `ServiceProvider` can inject a
  different map (tests).
- `useService(name)` returns `ServiceMap[name]` with its concrete type.
- `useAsyncData(loader)` runs a stable loader and returns `{data, loading}`;
  `useFindAll(service)` wraps `findAll`.

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

### 4.5 Content templates

| Template            | Layout                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `DocsLayout`        | Grid `sidebar │ body (max-w-reading) │ TOC` from `utils/layout.ts` `docsColumns`; owns `bodyRef` and `useHeadings`; `before`/`after` slots |
| `ArticleTemplate`   | `HeaderBand` + `DocsLayout` with `DocHeader` (breadcrumbs, tags, title, summary, meta, actions) before the body, and the helpful box + pager after |
| `ProjectTemplate`   | `HeaderBand` + `DocsLayout` with `DocHeader` (year badge, tags, Live/Source buttons) and pager  |
| `ListTemplate`      | `HeaderBand`, title row with toolbar, then `sidebar │ content` grid                              |
| `CorporateTemplate` | Light banner with version table, numbered contents rail and a framed "file view" body          |
| `HomeTemplate`      | Hero block (`max-w-hero`) and a three-column grid; one-screen at `lg`                          |

`HeaderBand` is purely decorative (`aria-hidden`): primary-tone gradient
(`band-from → band-via → band-to`), a radial glow and a token-sized grid,
height `h-band`.

### 4.6 Search

`SearchService.register(source)` stores a loader that maps items of any
`Searchable` type to `SearchDocument`s (pre-lower-cased title, tags, body
text, plus a `SearchAction`). `search(query)` loads all documents, splits the
query into terms, scores each document (title prefix 100, title word prefix
70, title substring 50, tag prefix 40, body 15; any unmatched term → 0) and
returns the top 20. `SearchDialog` groups results by category and executes the
action: `navigate`, `external` or `play-song`.

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

**Chat** (`ChatProvider` + `ChatService`): conversations are
`LocalStorageService<Conversation>` rows. `start()` creates a conversation
with the owner greeting; `send()` appends a visitor message with delivery
`queued` while `presence()` is `offline`, and titles the conversation from the
first visitor message. The provider refreshes its list after each mutation.

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

`index.html` applies `data-theme` before React loads. `ThemeProvider` reads
the same key, exposes `{mode, toggle}`, writes `data-theme` and persists.
All colours are CSS variables, so no component uses `dark:` for colour.

### 4.9 Styling system

`src/main.css` clears Tailwind's namespaces (`color`, `shadow`,
`inset-shadow`, `drop-shadow`, `radius`, `font`, `text`, `container`) and
defines semantic tokens. Layout sizes are tokens (`--container-*`,
`--spacing-*`), including fluid ones (`clamp()`, `min()`), so components use
names like `max-w-page`, `w-dock`, `h-band`, never pixel values.

Token naming caution: a `--spacing-<name>` token generates utilities such as
`inline-<name>` and `block-<name>`. A token named `grid`, `flex`, `table` or
`block` would override display utilities (this happened with
`--spacing-grid`; see ADR-011).

### 4.10 Build pipeline

```text
predev/prebuild: scripts/generate-rss.mjs  (Node 22 type stripping reads database/*.ts;
                 resolves feedDatabase against article/project/song databases; exit 1 on problems)
dev: swemre-rss Vite plugin reruns the script when src/database or src/config changes
build: tsc -b  →  vite build
  plugins: @tailwindcss/vite → @mdx-js/rollup (remark-gfm, @shikijs/rehype dual theme)
           → @vitejs/plugin-react → babel(React Compiler preset)
```

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
| Theme         | `localStorage`                | `swemre:theme`                    | Browser, persistent |
| Sound muted   | `localStorage`                | `swemre:sound-muted`              | Browser, persistent |
| FeedItem      | `database/feedDatabase.ts`    | `id` (permanent)                  | Build               |

Schemas: SWE-DOC-004 §5.

## 6. Error handling design

| Failure                                   | Behaviour                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Unknown route or slug                     | "Not found" view with a link back                                 |
| `localStorage` read throws or holds junk  | Fallback to empty state                                           |
| `localStorage` write throws (quota, blocked) | Keep in-memory state, continue                                 |
| Spotify iFrame API fails to load          | `failed` state, plain embed iframe fallback; script promise reset for retry |
| Loader promise rejects in `useAsyncData`  | **Not handled**: stays `loading` (RSK-04, planned fix)             |
| Resume submission rejects                 | **Not handled**: form stays "submitting" (RSK-04)                  |

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
| `SiteLayout`, `Navbar`, `Footer`   | GEN-02, GEN-04, NAV-*, FTR-01, LAY-02                |
| `HeaderBand`, templates, tokens    | LAY-01, LAY-03 to LAY-06, ART-06, PRJ-03             |
| Services + registry + hooks        | ART-01 to ART-03, PRJ-01, PRJ-02, MNT-06, MNT-09     |
| `ArticleInteractionStore`          | ART-11 to ART-13, SEC-06, CMP-03                     |
| `SearchService`, `SearchDialog`    | SRCH-*                                               |
| `PlayerProvider`, `SpotifyPanel`, `SongRow` | PLY-*                                       |
| `ChatService`, `ChatProvider`, chat components | CHAT-*                                   |
| `ResumeModalProvider`, `ResumeRequestForm` | RES-*                                         |
| `ThemeProvider`, inline script     | THM-*                                                |
| `CorporateTemplate`                | LGL-*                                                |
| `scripts/generate-rss.mjs`, `feedDatabase`, `swemre-rss` plugin, skills | RSS-*            |
| `SoundProvider`, `soundEngine`, `SoundToggle` | SND-*                                     |

Full trace: SWE-DOC-007.

## Change log

| Date       | Change                                             | Author                    |
| ---------- | -------------------------------------------------- | ------------------------- |
| 2026-10-15 | Owner placeholder replaced with full SDD draft     | Claude, for swemre review |
| 2026-10-15 | Added §4.7a sound design and the feed log pipeline | Claude, for swemre review |
