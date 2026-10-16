# Services, data and articles

## Services

Every entity has a service implementing the generic contract
`SwemreService<T extends Entity>` (`types/type.d.ts`, section "entities and services"):
`findAll`, `findById`, `create`, `update`, `remove`, all returning Promises so a
real API can replace the arrays without touching components.

- `services/ArrayService.ts`: abstract array-backed implementation.
- `services/LocalStorageService.ts`: array service that persists to
  localStorage after every write (used by `ChatService`).
- Concrete: `ArticleService`, `ProjectService`, `SongService`,
  `ContactFormService` (adds `submitResumeRequest`), `SpecialPageService`,
  `ChatService`. Article, project and special-page services also expose
  `findBySlug` and `getBody` (lazy MDX component, `services/mdxBodies.ts`).
- `services/serviceRegistry.ts` creates one instance of each.
- `ServiceMap` (in `type.d.ts`) maps names to services.

Usage in components:

```tsx
const articles = useFindAll(useService('article')) // {data, loading}
const contactForms = useService('contactForm')
```

`useService` reads `ServiceContext` (defaults to the registry, so
`ServiceProvider` can inject fakes in tests). `useFindAll` / `useAsyncData`
handle loading; loaders passed to `useAsyncData` must be `useCallback`-stable.

To add an entity: type in `types/type.d.ts`, array in `database/`, service
in `services/`, register it in `serviceRegistry.ts` and add it to
`ServiceMap`. Contracts are specified in
`engineering/interface-control-document.md`.

## "Database"

`src/database/*.ts` are plain exported arrays, mutated by the services. They
are in memory: **contact-form submissions are lost on reload** until a backend
exists. Seed data (articles, projects, songs, special pages) is edited
directly in those files.

## Articles

- Metadata: `database/articleDatabase.ts` (`Article` type: `id`, `slug`,
  `title`, `summary`, `author`, `createdAt`, `readingTime`, `tags`).
- Body: `page/article/<slug>.mdx`; the filename must equal the slug.
- No cover images. Every article page starts with the decorative
  `HeaderBand`; title, breadcrumbs, tags and meta are rendered below it by
  `DocHeader`.
- `id` is permanent; visitor interaction state is keyed by it.
- Do not repeat the title as an `h1` in the MDX; `ArticleTemplate` renders it.
- Bodies are code-split per article (`import.meta.glob` + `React.lazy` in
  `ArticleService`, built at module load to satisfy `react-hooks/static-components`).
- Rendering goes through `components/MdxBody.tsx` for the same lint reason.

### Adding an article

1. Add an entry to `articleDatabase.ts` with a fresh unique `id`.
2. Create `page/article/<slug>.mdx`.
3. `npm run checkstyle:fix` (adds the header and regenerates nothing else).
4. `npm run rss` (also runs on `dev`/`build`) refreshes `public/rss.xml`.

## Special pages (`/sp/:slug`)

Metadata in `database/specialPageDatabase.ts`, body in `page/sp/<slug>.mdx`,
rendered by `CorporateTemplate`: banner, sticky table of contents built from
the body's `h2` headings (`useHeadings`), a meta table (version, effective
date, contact) and CSS-numbered sections. Use `##` headings only for sections.

## Visitor interactions (localStorage)

`services/ArticleInteractionStore.ts`, key `swemre:article-interactions`:
`{[articleId]: {views, liked, favorited, lastViewedAt?}}`. Hooks:
`useArticleInteraction(id)`, `useAllArticleInteractions()`. Writes:
`articleInteractionStore.toggleLike / toggleFavorite / registerView`.
Built on `useSyncExternalStore`, syncs across tabs, tolerates unavailable
storage. `ArticlePage` counts a view once per visit (ref guard for StrictMode).

Other localStorage key: `swemre:theme` (`light` | `dark`), applied before first
paint by an inline script in `index.html`.

## Resume request

`ResumeModalProvider` owns the modal. `ResumeRequestForm` (`forms/`) validates
(`validateResumeRequest`), then `ContactFormService.submitResumeRequest`
stores `{kind:'resume-request', fullName, email, reason, createdAt}`.

## RSS

The feed is driven by an append-only log, `src/database/feedDatabase.ts`
(`FeedItem` in `type.d.ts`): one entry per announcement, with `kind`
`article` / `project` / `song` (resolved by `ref`: slug, slug, song id) or
`note` (own `title`, `summary`, optional `link`), an `id` that never changes
and a `publishedAt` ISO UTC date.

`scripts/generate-rss.mjs` (Node 22 type stripping) resolves every entry and
writes RSS 2.0 with an `atom:link rel="self"`, `managingEditor`, a stable
`lastBuildDate` (the newest item's date, so rebuilding does not create a
diff) and one `category` per tag plus the kind. It **exits 1** when:

- a reference does not resolve, an id is duplicated or a date is not ISO UTC;
- an article, project or song has no feed entry.

It runs before `dev` and `build`, and the `swemre-rss` Vite plugin reruns it
while `npm run dev` is running whenever a file in `src/database/` or
`src/config/` changes. Add entries with the `add-rss-item` skill (the
`new-article`, `new-project` and `new-song` skills call it). Because Node
loads the `.ts` files directly, `database/` and `config/site.ts` must stay
free of non-erasable TS and use `import type` for type imports.

## Sound design

Every interaction has a short synthesized sound (Web Audio API, no audio
files): `services/soundEngine.ts` holds the recipes (oscillator type, pitch
sweep, duration, gain) and a master volume, and drops repeats of the same
sound within 28 ms. `SoundProvider` (outermost provider in `App.tsx`)
installs two capture-phase document listeners:

| Event                                   | Sound                                        |
| --------------------------------------- | -------------------------------------------- |
| Pointer down on a button, link, summary, option, tab, checkbox | `tap`; `toggle-on` / `toggle-off` when the element has `aria-pressed` |
| Typing in a text field                  | `key`; Backspace/Delete `back`; Enter `enter`; arrows/Tab `nav` |
| Keys outside text fields                | Enter/Space on a control as for pointer; arrows/Tab `nav`; printable `key`; modifier combos and Escape silent |
| Dialog open (`Modal`)                   | `open`                                       |
| Cancel: Escape, Cancel and X buttons, backdrop click, closing chat | `cancel`              |
| Chat send, form error, form success     | `send`, `error`, `success` (called explicitly) |

Per-element control: `data-sound="<name>"` picks a sound,
`data-sound="none"` silences an element that plays its own sound (search
trigger, resume buttons, chat send, mute toggle), and `data-sound-enter="none"`
silences Enter in a text field that handles it itself (chat input).
Components call `useSound().play(name)` for event sounds.

The mute switch (`SoundToggle`, small and semi-transparent) sits left of the
chat launcher in the dock;
the choice persists in `localStorage` under `swemre:sound-muted`. Browsers
keep the `AudioContext` suspended until the first gesture, so nothing can
play before the visitor interacts.

## Search (Ctrl/⌘ K)

- Contract: `Searchable` in `type.d.ts` (`Entity` + `title`, `summary?`, `tags?`).
  `Article`, `Project`, `Song`, `SpecialPage` and `NavigationItem` extend it.
- `services/SearchService.ts`: `register<T extends Searchable>(source)`
  plus `search(query)` (in-memory scoring: title prefix > title word >
  title substring > tag > summary/keywords; every term must match).
- `SearchSource<T>`: `category`, `icon`, `load()`, `action(item)`,
  optional `subtitle(item)` and `keywords(item)`.
- `SearchAction`: `navigate` | `external` | `play-song`.
- All registrations live in `services/searchSources.ts`; the service is
  `useService('search')`.
- UI: `SearchDialogProvider` (shortcuts Ctrl/⌘+K and "/"), `SearchDialog`
  (grouped results, arrow keys, Enter, Esc), `SearchButton` in the navbar.

To make a new type searchable: extend `Searchable`, then add one
`.register({...})` call in `searchSources.ts`.

## Music player

- `Song.spotifyId` is the track id from `open.spotify.com/track/<id>`.
- `PlayerProvider` loads Spotify's iFrame API once, on the first play
  (`services/spotifyIframeApi.ts`), and mounts a single embed in
  `SpotifyPanel` inside the dock, so playback survives navigation. `usePlayer().toggle(song)`
  plays or pauses; rows reflect `current` / `isPaused`.
- If the API script is blocked, the dock falls back to a plain embed iframe.
- Visitors not logged in to Spotify get 30-second previews (Spotify's rule).

## Projects

Same pattern as articles: metadata in `database/projectDatabase.ts` (with
`slug`), body in `page/projects/<slug>.mdx`, rendered by `ProjectTemplate`
(`HeaderBand` + `DocHeader` + `DocsLayout`). `ArticleTemplate` and
`ProjectTemplate` share `templates/DocsLayout.tsx` (sidebar | body | TOC).

## Dock (bottom-right)

`components/Dock.tsx` is rendered by `SiteLayout`, which stays mounted across
route changes, so the player and chat follow the visitor. Stack, top to
bottom: chat panel, Spotify panel, chat launcher.

- **Spotify panel** (`SpotifyPanel`): artwork, title, play/pause, collapse,
  close; hosts the single embed. It collapses automatically while chat is open.
  Collapsing hides the embed without unmounting it so audio continues. Song
  rows (`SongRow`) look like Spotify's track list: index, play on hover,
  equalizer while playing.
- **Chat** (`ChatProvider`, `components/chat/*`, `services/ChatService.ts`):
  conversations persist in localStorage (`swemre:chat-conversations`) via
  `LocalStorageService`. New conversations start with a greeting from Emre;
  visitor messages are `queued` while `presence()` is `offline`.
  To go live: implement `ChatService.presence()` and delivery against the
  backend (marked `TODO(backend)`); the UI already renders online/offline and
  queued/sent states.
