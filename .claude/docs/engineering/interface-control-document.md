# Interface Control Document (ICD)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-004                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Scope

This document controls every interface of swemre-website: user-facing
routes, internal software interfaces (services, contexts, hooks, content
files), browser storage, third-party services, build-time interfaces and the
design-token interface. The authoritative type definitions are in
`src/types/type.d.ts`; this document explains their contracts. When the two
disagree, the code wins and this document is corrected.

## 2. Interface inventory

| ID      | Interface                         | Type             | Provider              | Consumer               |
| ------- | --------------------------------- | ---------------- | --------------------- | ---------------------- |
| IF-01   | URL routes                        | External (user)  | Router                | Visitor, search engines |
| IF-02   | `SwemreService<T>`                | Internal API     | `services/*`          | Hooks, pages           |
| IF-03   | `ServiceMap` / `useService`       | Internal API     | `serviceRegistry`     | Components             |
| IF-04   | `SearchSource<T>` / `SearchAction`| Internal API     | `searchSources.ts`    | `SearchService`, dialog |
| IF-05   | Context values                    | Internal API     | `context/*Provider`   | Hooks                  |
| IF-06   | Content files (metadata + MDX)    | File format      | Owner                 | Services, RSS script   |
| IF-07   | MDX component map                 | Internal API     | `components/mdx/*`    | MDX bodies             |
| IF-08   | `localStorage` keys               | Browser storage  | Stores, services      | Same, across sessions and tabs |
| IF-09   | Spotify iFrame API                | Third party      | open.spotify.com      | `PlayerProvider`       |
| IF-10   | Spotify image CDN                 | Third party      | image-cdn-fa.spotifycdn.com | `SongRow`, `SpotifyPanel` |
| IF-11   | RSS feed                          | External (feed readers) | `generate-rss.mjs` | Feed readers       |
| IF-12   | Design tokens                     | CSS              | `src/main.css`        | All components         |
| IF-13   | npm scripts                       | Build/CLI        | `package.json`        | Owner, CI              |
| IF-14   | Backend chat API                  | Future           | TBD                   | `ChatService`          |
| IF-15   | Feed log (`feedDatabase`)         | Data file        | Owner, `add-rss-item` skill | `generate-rss.mjs` |
| IF-16   | Sound API and `data-sound` attributes | Internal API / markup | `SoundProvider`, `soundEngine` | Components |

## 3. Internal software interfaces

### 3.1 IF-02 `SwemreService<T>`

```ts
interface Entity {
  id: string
}
type NewEntity<T extends Entity> = Omit<T, 'id'>

interface SwemreService<T extends Entity> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(data: NewEntity<T>): Promise<T>
  update(id: string, patch: Partial<NewEntity<T>>): Promise<T | undefined>
  remove(id: string): Promise<boolean>
}
```

| Operation  | Pre-conditions          | Post-conditions                                                  | Errors                    |
| ---------- | ----------------------- | ---------------------------------------------------------------- | ------------------------- |
| `findAll`  | none                    | Resolves to a **copy** of all rows (callers may sort it)          | none today                |
| `findById` | none                    | Resolves to the row or `undefined`                                | none                      |
| `create`   | `data` valid for `T`    | Row with new `crypto.randomUUID()` id appended and returned       | Local-storage write failure is swallowed |
| `update`   | none                    | Shallow merge of `patch`; resolves to updated row or `undefined` if missing | as above        |
| `remove`   | none                    | `true` if removed, `false` if missing                             | as above                  |

Every operation is asynchronous even when in memory, so an HTTP
implementation can replace it without caller changes.

Entity-specific extensions:

| Service              | Extra members                                                   |
| -------------------- | --------------------------------------------------------------- |
| `ArticleService`     | `findAll` sorted by `createdAt` descending; `findBySlug(slug)`; `getBody(slug): ComponentType \| undefined` |
| `ProjectService`     | `findAll` sorted by `year` descending; `findBySlug`; `getBody`   |
| `SpecialPageService` | `findBySlug`; `getBody`                                          |
| `ContactFormService` | `submitResumeRequest(input: ContactFormInput): Promise<ContactForm>` |
| `ChatService`        | `findAll` sorted by `updatedAt` descending; `presence(): Promise<ChatPresence>`; `start(): Promise<Conversation>`; `send(id, text): Promise<Conversation \| undefined>` |
| `SongService`        | none                                                             |

### 3.2 IF-03 Service lookup

```ts
interface ServiceMap {
  article: ArticleService
  chat: ChatService
  contactForm: ContactFormService
  project: ProjectService
  search: SearchService
  song: SongService
  specialPage: SpecialPageService
}

function useService<K extends keyof ServiceMap>(name: K): ServiceMap[K]
function useFindAll<T extends Entity>(service: SwemreService<T>): AsyncResult<T[]>
function useAsyncData<T>(loader: () => Promise<T>): AsyncResult<T>

interface AsyncResult<T> {
  data: T | undefined
  loading: boolean
}
```

Contract: the loader passed to `useAsyncData` must be referentially stable
(`useCallback`); a new function identity starts a new load.

### 3.3 IF-04 Search

```ts
interface Searchable extends Entity {
  title: string
  summary?: string
  tags?: string[]
}

type SearchAction =
  | {kind: 'navigate'; to: string}
  | {kind: 'external'; href: string}
  | {kind: 'play-song'; song: Song}

interface SearchSource<T extends Searchable> {
  category: string
  icon: IconName
  load(): Promise<T[]>
  action(item: T): SearchAction
  subtitle?(item: T): string
  keywords?(item: T): string[]
}
```

`SearchService.register(source)` returns `this` (chainable).
`search(query, limit = 20)` returns `SearchResult[]` (`{document, score}`),
best first. Empty query returns the first `limit` documents unscored.

Registered sources (order = display order): Pages, Articles, Projects,
Songs I liked, Legal.

### 3.4 IF-05 Context values

| Context               | Value type                  | Members                                                                 |
| --------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `ServiceContext`      | `ServiceMap`                | see 3.2                                                                  |
| `ThemeContext`        | `ThemeContextValue`         | `mode: 'light' \| 'dark'`, `toggle()`                                   |
| `PlayerContext`       | `PlayerContextValue`        | `current`, `isPaused`, `failed`, `collapsed`, `attachHost(el)`, `toggle(song)`, `togglePlayback()`, `setCollapsed(b)`, `close()` |
| `ChatContext`         | `ChatContextValue`          | `isOpen`, `presence`, `conversations`, `active`, `open()`, `close()`, `toggle()`, `select(id \| null)`, `start()`, `send(text)`, `remove(id)` |
| `SearchDialogContext` | `SearchDialogContextValue`  | `open()`, `close()`                                                      |
| `ResumeModalContext`  | `ResumeModalContextValue`   | `open()`, `close()`                                                      |

### 3.5 IF-07 MDX component map

Available in every MDX body without an import:

| Element / component | Rendering                                                    |
| ------------------- | ------------------------------------------------------------ |
| `h2`, `h3`          | `AnchorHeading` with auto id (slugified text) and hover "#" link; feed the TOC |
| `p`, `a`, `strong`, `ul`, `ol`, `blockquote`, `hr`, `table`, `th`, `td`, `img`, inline `code` | Token-styled elements |
| fenced code         | Shiki-highlighted `pre` inside `CodeBlock` with a copy button |
| `<Callout type="note \| tip \| warning \| danger">` | Coloured callout box                        |

Legal pages use `legalMdxComponents` (numbered `h2` sections).

## 4. IF-06 Content file formats

### 4.1 Article

Metadata entry in `src/database/articleDatabase.ts`:

| Field         | Type       | Rule                                                          |
| ------------- | ---------- | ------------------------------------------------------------- |
| `id`          | string     | 8 lowercase hex characters, unique, **never changed** (storage key) |
| `slug`        | string     | kebab-case, unique, equals the MDX file name                  |
| `title`       | string     | Title case                                                    |
| `summary`     | string     | One sentence                                                  |
| `author`      | string     | `swemre`                                                      |
| `createdAt`   | string     | ISO 8601 UTC, e.g. `2026-10-12T09:30:00Z`                      |
| `readingTime` | number     | Minutes, integer                                              |
| `tags`        | string[]   | lowercase, 1 to 4 items                                        |

Body: `src/page/article/<slug>.mdx`, beginning with the MDX license header,
`##` and `###` headings only (the template renders the `h1`).

### 4.2 Project

Same pattern in `projectDatabase.ts`: `id`, `slug`, `title`, `summary`,
`year` (number), `tags`, optional `url` (live site) and `repoUrl`. Body:
`src/page/projects/<slug>.mdx`.

### 4.3 Special page

`specialPageDatabase.ts`: `id`, `slug`, `title`, `summary`, `version`
(`MAJOR.MINOR` string), `effectiveDate` and `updatedAt` (ISO dates,
`YYYY-MM-DD`). Body: `src/page/sp/<slug>.mdx`.

### 4.4 Song

`songDatabase.ts`: `id`, `title`, `artist`, `spotifyId` (last segment of
`open.spotify.com/track/<id>`), optional `artworkUrl` (Spotify CDN, 300 px).

## 5. IF-08 Browser storage

All keys are prefixed `swemre:`. Values are JSON unless stated.

| Key                            | Owner                     | Schema                                                                                      | Written when                    |
| ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| `swemre:theme`                 | `ThemeProvider`, `index.html` | plain string `light` \| `dark`                                                           | Theme toggled or first load     |
| `swemre:article-interactions`  | `ArticleInteractionStore` | `{[articleId]: {views: number, liked: boolean, favorited: boolean, lastViewedAt?: ISO string}}` | View, like, save                |
| `swemre:sound-muted`           | `SoundProvider`           | plain string `true` \| `false`                                                             | Mute toggled                    |
| `swemre:chat-conversations`    | `ChatService`             | `Conversation[]`: `{id, title, createdAt, updatedAt, messages: ChatMessage[]}`; `ChatMessage` = `{id, author: 'visitor' \| 'owner', text, sentAt: ISO, delivery: 'queued' \| 'sent'}` | Start, send, delete |

Rules:

- Readers tolerate missing keys, invalid JSON and wrong shapes (fallback to
  empty state).
- Writers tolerate quota and security errors (state kept in memory).
- `swemre:article-interactions` changes are broadcast to other tabs through
  the `storage` event.
- Schema changes must be backward compatible or include a migration that
  runs on read; record them in the SVD.

## 6. Third-party interfaces

### 6.1 IF-09 Spotify iFrame API

| Item            | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| Script          | `https://open.spotify.com/embed/iframe-api/v1`, loaded once on first play   |
| Ready callback  | `window.onSpotifyIframeApiReady(api)`                                       |
| Create          | `api.createController(element, {uri, width: '100%', height: 152}, cb)`     |
| URIs            | `spotify:track:<spotifyId>`                                                 |
| Controller use  | `loadUri(uri)`, `play()`, `togglePlay()`, `destroy()`, `addListener('ready' \| 'playback_update', fn)` |
| Event data      | `playback_update`: `{data: {isPaused, isBuffering, duration, position}}`    |
| Fallback        | `https://open.spotify.com/embed/track/<id>?utm_source=generator` iframe     |
| Constraints     | Compact embed is 152 px tall (token `--spacing-embed`); anonymous visitors get 30 s previews; Spotify may set cookies once loaded |

### 6.2 IF-10 Spotify image CDN

Static `<img>` requests to `image-cdn-fa.spotifycdn.com` for artwork. No
script, but the CDN receives the visitor's IP (disclosed in the privacy
policy, v1.1).

### 6.3 IF-14 Backend chat API (future, not implemented)

Proposed contract so the UI does not change:

| Operation        | Proposed endpoint                       | Maps to                   |
| ---------------- | --------------------------------------- | ------------------------- |
| Owner presence   | `GET /api/chat/presence` → `{status}`   | `ChatService.presence()`  |
| Send message     | `POST /api/chat/conversations/:id/messages` | `ChatService.send()`; delivery `sent` on 2xx |
| Receive replies  | WebSocket or SSE `/api/chat/stream`     | New `ChatContext` event   |
| Flush queue      | On reconnect, send `queued` messages in order | `ChatService`        |

## 7. IF-11 RSS feed and IF-15 feed log

### 7.1 Feed log

`src/database/feedDatabase.ts` exports `feedDatabase: FeedItem[]`, an
append-only, chronological log:

| Field         | Rule                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `id`          | Unique, permanent: `feed-<article id>`, `feed-p<n>`, `feed-s<n>`, `feed-note-<date>[-n]` |
| `kind`        | `article` \| `project` \| `song` \| `note`                              |
| `ref`         | article/project slug or song id (not for notes)                      |
| `title`, `summary`, `link?` | notes only; `link` is absolute or a site path       |
| `publishedAt` | ISO 8601 UTC with `Z`; for articles equal to `createdAt`             |

Completeness rule: every article, project and song has exactly one entry;
the generator exits 1 otherwise.

### 7.2 Feed output

`/rss.xml`, RSS 2.0, UTF-8, namespace `xmlns:atom`. Channel: title
(`<name> (<handle>)`), link (`siteConfig.url`), `atom:link rel="self"`,
description, language `en`, `managingEditor` and `webMaster`
(`email (name)`), `lastBuildDate` (newest item's date), `ttl` 60.

| Kind    | Title                         | Link / GUID                                           | Categories          |
| ------- | ----------------------------- | ----------------------------------------------------- | ------------------- |
| article | article title                 | `<url>/articles/<slug>`, permalink                    | `article` + tags    |
| project | `Project: <title>`            | `<url>/projects/<slug>`, permalink                    | `project` + tags    |
| song    | `Song I liked: <title> by <artist>` | Spotify track URL; GUID `<url>/#song-<id>`, not permalink | `music`   |
| note    | note title                    | note link (default `<url>/`); GUID `<url>/#<id>`      | `note`              |

`pubDate` is RFC 822 from `publishedAt`. All text is XML-escaped
(`& < > " '`).

## 7a. IF-16 Sound

| Element                     | Contract                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| `SoundName`                 | `tap`, `key`, `nav`, `enter`, `back`, `toggle-on`, `toggle-off`, `open`, `close`, `cancel`, `send`, `success`, `error` |
| `useSound()`                | `{muted, toggleMuted(), play(name)}`; `play` is a no-op when muted       |
| `data-sound="<SoundName>"`  | On or above an interactive element: play this sound instead of the default |
| `data-sound="none"`         | Silence the element's pointer/keyboard sound (it plays its own)          |
| `data-sound-enter="none"`   | On a text field: silence Enter (the field's handler plays a sound)       |
| `aria-pressed`              | Selects `toggle-on` (currently false) or `toggle-off` (currently true)   |

## 8. IF-12 Design tokens

The token names in `src/main.css` are an interface: components depend on
them by name. Renaming or deleting a token is a breaking change and must be
done with a project-wide search. Groups: colours (surfaces, text, borders,
brand, status, cover, band, effects), shadows, radii, fonts, text sizes,
containers, spacing, motion. Reference: `../design-system.md`.

## 9. IF-13 npm scripts

| Script            | Contract                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `dev`             | RSS, then Vite dev server on port 5173                              |
| `build`           | RSS, `tsc -b`, `vite build` → `dist/`; non-zero exit on any error   |
| `preview`         | Serve `dist/`                                                       |
| `rss`             | Validate the feed log and regenerate `public/rss.xml`; exit 1 on problems |
| `lint`            | ESLint only                                                         |
| `checkstyle`      | ESLint, Prettier check, license check; read-only; non-zero on any issue |
| `checkstyle:fix`  | Same with fixes applied                                             |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
