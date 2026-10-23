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
| IF-17   | Sitemap and `robots.txt`          | External (crawlers) | `generate-sitemap.mjs`, `public/robots.txt` | Search engines |
| IF-18   | Public form submissions           | HTTP (swemre-website-api) | API `forms/<form>/submissions` | `ContactFormService` |
| IF-19   | Document metadata (`<title>`, description, canonical, Open Graph, Twitter) | External (link previews) | `useDocumentTitle`, `scripts/prerender.mjs`, `index.html` | Browsers, link previewers, crawlers |
| IF-20   | Public API client and site environment | Internal API / build env | `services/publicApi.ts`, `config/env.ts` | Services, build scripts, `vite.config.ts` |

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

List cache: a service constructed with `cacheList = true` (`ArticleService`,
`ProjectService`, `SongService`, `SpecialPageService`) runs its `findAll`
request once per page session. Callers share the in-flight request and each
receives its own copy; an empty result or a rejection is not cached.

Entity-specific extensions:

| Service              | Extra members                                                   |
| -------------------- | --------------------------------------------------------------- |
| `ArticleService`     | `findAll` sorted by `createdAt` descending; `findBySlug(slug)`; `getBody(slug): ComponentType \| undefined` |
| `ProjectService`     | `findAll` sorted by `year` descending; `findBySlug`; `getBody`   |
| `SpecialPageService` | `findBySlug`; `getBody`                                          |
| `ContactFormService` | `submitResumeRequest(input: ContactFormInput): Promise<ContactForm>`; `submitCallbackRequest(input: CallbackFormInput): Promise<CallbackRequest>`. Both reject (`ApiError`) unless the API confirms the submission (IF-18) |
| `ChatService`        | `findAll` syncs stored conversations with the API, then sorted by `updatedAt` descending; `list()` the same without the API; `presence(): Promise<ChatPresence>`; `start(): Promise<Conversation>`; `enqueue(id, text)` appends a `sending` visitor message; `deliver(id): Promise<void>` posts unsent messages in order (calls serialised per conversation), failures leave them `queued`; `markSending(id): Promise<boolean>` (false when nothing is unsent); `pending(): string[]` ids with unsent messages; `connect(publicToken, onEvent)` returns a stop function, events `message`, `presence`, `connected`; `receive(id, message)` |
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

```ts
interface DocumentMeta {
  description?: string
  image?: string
}

function useDocumentTitle(title?: string, meta?: DocumentMeta): void
```

Sets the document title and the IF-19 meta tags on every change of title,
description, image or route path (see §7c).

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
  featured?: number // items the empty query lists: all when omitted, none when 0
}
```

`SearchService.register(source)` returns `this` (chainable).
`search(query, limit = 20)` returns `SearchResult[]` (`{document, score}`),
best first. An empty query returns, unscored and in registration order, the
first `featured` items of each source (all for a source without `featured`),
capped at `limit`. Current settings: Pages all, Articles 5, Projects, Songs
I liked and Legal 0. `useSearchResults(query)` returns results only for the
query that produced them; while a new query is searched, `results` is empty
and `loading` is true.

Registered sources (order = display order): Pages, Articles, Projects,
Songs I liked, Legal.

### 3.4 IF-05 Context values

| Context               | Value type                  | Members                                                                 |
| --------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `ServiceContext`      | `ServiceMap`                | see 3.2                                                                  |
| `ThemeContext`        | `ThemeContextValue`         | `mode: 'light' \| 'dark'` (stored choice, otherwise the live system preference), `toggle()` (stores the new choice) |
| `PlayerContext`       | `PlayerContextValue`        | `current`, `isPaused`, `failed`, `collapsed`, `attachHost(el)`, `toggle(song)`, `togglePlayback()`, `setCollapsed(b)`, `close()` |
| `ChatContext`         | `ChatContextValue`          | `isOpen`, `presence`, `conversations`, `active`, `open()`, `close()`, `toggle()`, `select(id \| null)`, `start()`, `send(text)`, `retry(id)`, `remove(id)`; `open()` and opening through `toggle()` also retry every conversation with unsent messages |
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
| `swemre:theme`                 | `ThemeProvider` (writes), `index.html` (reads) | plain string `light` \| `dark`; absent means "follow the system"                  | Theme toggled only              |
| `swemre:article-interactions`  | `ArticleInteractionStore` | `{[articleId]: {views: number, liked: boolean, favorited: boolean, lastViewedAt?: ISO string}}` | View, like, save                |
| `swemre:sound-muted`           | `SoundProvider`           | plain string `true` \| `false`                                                             | Mute toggled                    |
| `swemre:chat-conversations`    | `ChatService`             | `Conversation[]`: `{id, title, createdAt, updatedAt, messages: ChatMessage[]}`; `ChatMessage` = `{id, author: 'visitor' \| 'owner', text, sentAt: ISO, delivery: 'sending' \| 'queued' \| 'sent'}`; `sending` read back on load becomes `queued` | Start, send, delivery change, delete |

`sessionStorage` (per tab session):

| Key                         | Owner                     | Schema                         | Written when                          |
| --------------------------- | ------------------------- | ------------------------------ | ------------------------------------- |
| `swemre:viewed-articles`    | `ArticleInteractionStore` | JSON `string[]` of article ids | First view of an article in the session |

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
| Send message     | `POST /api/chat/conversations/:id/messages` | `ChatService.deliver()`; delivery `sent` on 2xx |
| Receive replies  | WebSocket or SSE `/api/chat/stream`     | New `ChatContext` event   |
| Flush queue      | On reconnect, send `queued` messages in order | `ChatService`        |

As built (2026-10-23), `ChatService` posts the first message to
`<workspacePath>/conversations` (which creates the conversation and returns
its token) and later messages to
`<workspacePath>/conversations/<token>/message`, both `{text}`. A thrown
error or a 404 (`publicRequest` returns `undefined`) leaves the message and
every later unsent one `queued`. The queue is flushed one message at a time
on the socket's `connected` event, the window `online` event, panel open and
a tap on a queued message.

### 6.3a IF-20 Public API client and site environment

| Variable              | Default                     | Use                                                  |
| --------------------- | --------------------------- | ---------------------------------------------------- |
| `VITE_API_BASE`       | `http://localhost:8080/api` | API origin and path prefix                           |
| `VITE_WORKSPACE_KEY`  | `swemre-website`            | `/public/v1/workspaces/<key>/...`                    |
| `VITE_CHANNEL_KEY`    | unset                       | The website channel install (lower case); set: publications come from v2 |
| `VITE_READ_KEY`       | unset                       | Sent as `X-Read-Key` on v2 requests; a missing or wrong key gives 401 |
| `VITE_SITE_URL`       | `https://swemre.com`        | Canonical origin, `og:url`, RSS and sitemap links; trailing slash dropped |
| `VITE_LOCALE`         | `en`                        | `<html lang>`; `locale` parameter on v2 reads        |
| `VITE_API_TIMEOUT_MS` | `10000`                     | Reads (`GET`) abort after this many milliseconds     |

`PublicApi` methods: `listPosts(type, {size, sortBy, direction})` (`[]` on
404, throws `ApiError` on other non-2xx, on network errors and on timeout),
`getPost(type, slug)` (`undefined` on 404), `submitForm(form, fields)`
(IF-18), `presence()`, `sendChatMessage(token, text)`,
`getConversation(token)`, `conversationSocketUrl(token)` and
`recordPageView({path, referrer, sessionId})`.

| Call             | v2 (channel key set)                                            | v1 (fallback)                                   |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `listPosts`      | `GET /public/v2/channels/<c>/publications?content-type=&locale=&size=&term=` → `{items, total, page, size}` (newest first; sorted by title in the client when asked); each item mapped to `PublicPost`: `cover` (with `alt` as `altText`), `excerpt` (as `summary`) and `body` into `fields`, term `kind` as `taxonomy`, `updatedAt` as `lastUpdatedAt` | `GET /public/v1/workspaces/<w>/posts?type=&size=&sort-by=&direction=` |
| `getPost`        | `GET .../publications/<slug>?locale=`, `undefined` on 404 or when the content type differs; adds `locale` and `languageVersions` | `GET .../posts/<type>/<slug>`                   |
| `submitForm`     | v1 until v2 serves forms                                        | `POST .../forms/<form>/submissions`             |
| chat, presence, page views | v1 only until v2 defines them                         | `.../conversations...`, `.../presence`, `.../page-views` |

A 401 (`CHANNEL_READ_DENIED`: unknown channel, missing or wrong read key)
rejects with `ApiError(401)`. Not used yet: `GET .../terms?kind=&locale=`.
Media URLs arrive as paths and are joined to `VITE_API_BASE`, as in v1.

### 6.4 IF-18 Public form submissions

| Item       | Value                                                                         |
| ---------- | ----------------------------------------------------------------------------- |
| Endpoint   | `POST <apiBase><workspacePath>/forms/<form>/submissions`, JSON `{fields: {...}}` (trimmed strings) |
| Forms      | `cv-request` (`fullName`, `email`, `reason`); `callback-request` (`fullName`, `phone`, `topic`) |
| Success    | 2xx with `{submittedAt, ...}`; the service resolves with the stored record     |
| Failure    | 404 or empty answer: `ApiError(404, "Form <form> did not confirm the submission")`; other non-2xx: `ApiError(status, message)`; network error: rejected `fetch`. Every failure rejects, and the form shows its error |

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

## 7b. IF-17 Sitemap and robots.txt

`/sitemap.xml` is generated by `scripts/generate-sitemap.mjs`
(`npm run sitemap`, also in `predev` and `prebuild`; never edit
`public/sitemap.xml` by hand).

| Item        | Contract                                                                        |
| ----------- | ------------------------------------------------------------------------------- |
| Format      | XML, UTF-8, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`       |
| URLs        | `<siteConfig.url>/`, `/articles`, `/projects` (no `lastmod`), then `/articles/<slug>`, `/projects/<slug>`, `/sp/<slug>` for each published post |
| `lastmod`   | `YYYY-MM-DD`, the date part of the post's `lastUpdatedAt`                         |
| Input       | `GET <VITE_API_BASE>/public/v1/workspaces/<VITE_WORKSPACE_KEY>/posts?type=<article\|project\|page>&size=100&sort-by=publishedAt&direction=DESC` (defaults `http://localhost:8080/api`, `swemre-website`); 404 for a type means no URLs |
| Escaping    | `&`, `<`, `>` in `loc`                                                            |
| Offline     | API unreachable or non-2xx: warning, existing file kept, exit 0; exit 1 when no `public/sitemap.xml` exists |
| Limit       | At most 100 posts per type (one page)                                             |

`public/robots.txt`: `User-agent: *`, `Allow: /`,
`Sitemap: https://swemre.com/sitemap.xml`.

## 7c. IF-19 Document metadata

| Tag                          | Value                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| `<title>`                    | `<title> · SWEMRE`, or `SWEMRE` without a title                     |
| `meta[name=description]`     | page description, else "Portfolio, articles and projects of Emre, software engineer." |
| `og:title`                   | same as `<title>`                                                   |
| `og:description`             | same as description                                                 |
| `link[rel=canonical]`        | `siteConfig.url` + current path without trailing slash (`https://swemre.com/` for `/`) |
| `og:url`                     | same as canonical                                                   |
| `og:image`                   | page image (`ogImage`, else article/project cover), else the site settings' `defaultOgImage`, else `siteConfig.url` + `avatarLarge` |
| `og:type`                    | `article` on article pages, else `website`                          |
| `og:site_name`               | `siteConfig.brand`                                                  |
| `og:image:width`, `og:image:height`, `og:image:alt` | the chosen image's `width`, `height` and `altText` when the media field has them; the avatar fallback is 384×384 with alt "Emre" |
| `article:published_time`, `article:modified_time` | article pages only: `publishedAt` and `lastUpdatedAt` (ISO) |
| `twitter:card`               | `summary` for the avatar fallback, else `summary_large_image`       |
| `twitter:image:alt`          | same as `og:image:alt`                                              |
| `twitter:title`, `twitter:description`, `twitter:image` | same as `og:title`, `og:description`, `og:image` |

Missing tags are created in `document.head`; existing ones are updated in
place; optional tags the page does not set are removed. The same tags, with the same values, are in the static HTML of every
pre-rendered route: `dist/index.html` for `/` and `dist/<route>/index.html`
for `/articles`, `/projects`, `/articles/<slug>`, `/projects/<slug>` and
`/sp/<slug>` (SRS-PRE-01). A host serving the build answers `/<route>` with
`<route>/index.html` when it exists, else with `index.html` (SPA fallback).

## 8. IF-12 Design tokens

The token names in `src/main.css` are an interface: components depend on
them by name. Renaming or deleting a token is a breaking change and must be
done with a project-wide search. Groups: colours (surfaces, text, borders,
brand, status, cover, band, effects), shadows, radii, fonts, text sizes,
containers, spacing, motion. Reference: `../design-system.md`.

## 9. IF-13 npm scripts

| Script            | Contract                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `dev`             | RSS, sitemap, then Vite dev server on port 5173                     |
| `build`           | RSS, sitemap, `tsc -b`, `vite build` → `dist/`, then `prerender`; non-zero exit on any error |
| `preview`         | Serve `dist/`; `/<route>` gets `dist/<route>/index.html` when it exists |
| `rss`             | Validate the feed log and regenerate `public/rss.xml`; exit 1 on problems |
| `sitemap`         | Regenerate `public/sitemap.xml` from the API (IF-17); exit 0 offline when a sitemap exists, else 1 |
| `prerender`       | Rewrite the route pages in `dist/` from `dist/index.html` and the API (IF-19); exit 0 offline with nothing changed; exit 1 when `dist/index.html` is missing. Reads `VITE_API_BASE`, `VITE_WORKSPACE_KEY` |
| `lint`            | ESLint only                                                         |
| `checkstyle`      | ESLint, Prettier check, license check; read-only; non-zero on any issue |
| `checkstyle:fix`  | Same with fixes applied                                             |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
| 2026-10-23 | UX fixes: list cache, `submitCallbackRequest` and confirmation rule (IF-18), chat delivery members and `retry`, `SearchSource.featured`, `DocumentMeta` (IF-19), theme written only on toggle, `swemre:viewed-articles`, sitemap and robots (IF-17), `sitemap` script | Claude, for swemre review |
| 2026-10-23 | PRS-000311: IF-19 canonical, Twitter tags and pre-rendered route pages; `prerender` script, `build` and `preview` contracts | Claude, for swemre review |
| 2026-10-23 | IF-20 public API client and site environment (ADR-017) | Claude, for swemre review |
| 2026-10-23 | IF-20: v2 channel paths, read key and v1 fallback | Claude, for swemre review |
| 2026-10-23 | IF-20: v2 publication bodies, `term` filter, forms on v1 | Claude, for swemre review |
| 2026-10-23 | IF-19: `og:type`, `og:site_name`, `og:image:width/height/alt`, `article:published_time/modified_time`, `twitter:image:alt` (SRS-GEN-10) | Claude, for swemre review |
