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
  `ContactFormService` (adds `submitResumeRequest` and
  `submitCallbackRequest`), `SpecialPageService`, `ChatService`. Article,
  project and special-page services also expose `findBySlug` and `getBody`
  (lazy MDX component, `services/mdxBodies.ts`).
- List caching: `ArticleService`, `ProjectService`, `SongService` and
  `SpecialPageService` call `super([], true)`, so `ArrayService` runs their
  `findAll` once per page session. Callers share the request and each gets
  its own copy; an empty list or an error is not cached (the API services
  answer `[]` when the API is down), so the next call asks again. A new
  list service that reads the API should pass `true` as well.
- Contact forms: both submit methods throw unless the API confirms the
  submission; a 404 (form missing in the workspace) is a failure, not a
  success. The forms catch it and show their error.
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
- Every article page starts with the decorative `HeaderBand`; title,
  breadcrumbs, tags and meta are rendered below it by `DocHeader`, which
  ends with the cover when the article has one (`coverUrl`, with `coverAlt`,
  `coverWidth`, `coverHeight` from the media field's `altText`, `width`,
  `height`). Without `altText` the cover keeps `alt=""`. Project pages do
  the same. While loading and when not found, article and project pages
  still draw the band; not found renders `components/NotFound.tsx`.
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
storage. `registerView` counts a view once per browser session: the ids
already counted are kept in `sessionStorage` under `swemre:viewed-articles`,
plus an in-memory set for the page load (covers StrictMode and browsers
without `sessionStorage`). Reloading an article does not count again; a new
tab or session does.

Other localStorage key: `swemre:theme` (`light` | `dark`), applied before
first paint by an inline script in `index.html`. It is written only when the
visitor uses the theme switch; without it the site follows the OS theme,
including changes while the page is open (`ThemeProvider` listens to
`prefers-color-scheme`).

## Resume request

`ResumeModalProvider` owns the modal. `ResumeRequestForm` (`forms/`) validates
(`validateResumeRequest`), then `ContactFormService.submitResumeRequest`
sends it to the API form `cv-request` and returns
`{kind:'resume-request', fullName, email, reason, createdAt}`.
`CallbackRequestForm` does the same with `validateCallbackRequest` and the
`callback-request` form. Both forms clear a field's error as soon as it is
edited, focus the first invalid field on submit (inputs carry `name` for
this), show an error alert when the request fails and stay editable for
another try. Their headers use `pr-14` so the text clears the dialog's close
button.

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

## Sitemap and page metadata

`scripts/generate-sitemap.mjs` (`npm run sitemap`, run after `rss` before
`dev` and `build`) writes `public/sitemap.xml`: `/`, `/articles`,
`/projects` and every published article, project and special page from the
API, with `lastmod`. If the API is unreachable it keeps the existing file
(exit 0, or 1 when there is none). `public/robots.txt` points to it.

`useDocumentTitle(title?, {description?, image?})` sets the tab title plus
the `description`, Open Graph and `twitter:card` tags per page. Article and
project pages pass their summary and cover; without them the site
description and the large avatar are used.

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
  optional `subtitle(item)`, `keywords(item)` and `featured` (how many items
  the empty query lists: all when omitted, none when `0`). The empty query
  shows all pages and the five newest articles.
- `useSearchResults` returns results only for the current query, so the
  previous query's results never stay on screen (or open on Enter) while a
  new one loads.
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
  `LocalStorageService`. New conversations start with a greeting from Emre.
  Delivery states of a visitor message:
  - `sending`: shown at once (dimmed, "Sending…") by `enqueue`, before the
    API answers; `deliver` then posts the conversation's unsent messages
    one at a time, in order.
  - `sent`: the API stored it (check mark).
  - `queued`: the API was unreachable or refused it; shown as "Not sent ·
    tap to retry", and the bubble is a button that retries.

  Queued messages are also retried automatically when the conversation's
  socket (re)connects, on the browser's `online` event and when the panel
  opens. A message still `sending` when the page closed is `queued` on the
  next load. Presence only changes the banner ("Emre is offline. Your
  messages are delivered and he will reply here later."); it never holds
  messages back. Deleting a conversation asks for confirmation in the row;
  the delete button shows on hover, on keyboard focus and always on touch
  screens.
- **Phones** (below `sm`): the open chat is a full-screen sheet padded by the
  safe-area insets and the page behind it does not scroll; a `dock-clear`
  spacer under the footer keeps the dock off the page content.
