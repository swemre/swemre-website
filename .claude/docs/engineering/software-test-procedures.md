# Software Test Procedures and Test Designs

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-006                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. How to read this document

Each test case has:

- **ID** `TC-<AREA>-<NN>` and the requirement(s) it verifies;
- **Level** L1 to L5 (see SWE-DOC-005 §2.1) and **type**: unit, component,
  E2E, manual;
- **Preconditions**, **steps**, **expected result**;
- **Status**: `Automated` (exists and runs), `Designed` (written here, not yet
  automated), `Manual` (executed by hand).

Common preconditions unless stated: production build served by
`vite preview`, empty `localStorage`, viewport 1920×1080, light theme.

## 2. Static verification (L1)

| ID         | Verifies                 | Procedure                                                       | Expected                         | Status    |
| ---------- | ------------------------ | --------------------------------------------------------------- | -------------------------------- | --------- |
| TC-MNT-01  | SRS-MNT-01, MNT-04, MNT-05 | `npm run checkstyle`                                          | Exit 0; no ESLint (incl. `semi: never`), Prettier or header findings | Automated |
| TC-MNT-02  | SRS-MNT-02               | `npm run build`                                                  | Exit 0; no TS errors             | Automated |
| TC-MNT-03  | SRS-MNT-03               | `npx tsc -p tsconfig.app.json --noEmit --skipLibCheck false`, ignoring `node_modules` findings | No errors in `src/` | Automated (manual trigger) |
| TC-MNT-04  | SRS-MNT-06               | Search `src/{components,page,templates,hooks,context,forms}` for imports of `database/` | No matches | Designed (lint rule `no-restricted-imports`) |
| TC-MNT-05  | SRS-MNT-07, LAY-06       | Search components for `#[0-9a-f]{3,6}`, `style=`, `-[<n>px]`, `w-[`, `h-[` | No matches except documented exceptions | Designed |
| TC-SEC-01  | SRS-SEC-03               | Search for `target="_blank"` without `noopener`                  | No matches                       | Designed  |
| TC-SEC-02  | SRS-SEC-05               | Search for `dangerouslySetInnerHTML`                              | No matches                       | Designed  |

## 3. Unit tests (L2)

### 3.1 Services

**TC-SVC-01** ArrayService CRUD (SRS-MNT-09 support)

| Step | Action                                         | Expected                                   |
| ---- | ---------------------------------------------- | ------------------------------------------ |
| 1    | Create a test subclass with two rows           |                                            |
| 2    | `findAll()`, then mutate the returned array    | Service rows unchanged (copy returned)     |
| 3    | `create({...})`                                | New row has a UUID id, appears in `findAll` |
| 4    | `update(id, {title})`                          | Shallow-merged row returned                |
| 5    | `update('missing', {})`                        | `undefined`                                |
| 6    | `remove(id)` then `remove(id)`                 | `true`, then `false`                       |

Status: Designed.

**TC-SVC-02** LocalStorageService persistence (SRS-CHAT-03, SEC-06, CMP-03)

| Case | Setup                                         | Action                       | Expected                                 |
| ---- | --------------------------------------------- | ---------------------------- | ---------------------------------------- |
| a    | Empty storage                                 | Construct, `create`          | Key written with one row                 |
| b    | Key holds valid array                         | Construct, `findAll`         | Rows restored                            |
| c    | Key holds `"{not json"`                       | Construct                    | No throw; `findAll` → `[]`               |
| d    | Key holds `{"a":1}` (object, not array)       | Construct                    | `[]`                                     |
| e    | `setItem` throws `QuotaExceededError`         | `create`                     | Resolves; row in memory                  |

Status: Designed.

**TC-SVC-03** List cache (SRS-PERF-05)

| Step | Action                                                                 | Expected                                         |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| 1    | Subclass with `cacheList = true` whose `findAll` is a spy resolving `[a, b]` |                                           |
| 2    | Call `findAll()` twice without awaiting, then once more after both resolve | Spy called once; all three resolve to `[a, b]` |
| 3    | Push to the first returned array, call `findAll()`                      | Still `[a, b]` (copy per caller)                 |
| 4    | New instance, spy resolves `[]` first, then `[a]`                        | First call `[]`; second call runs the spy again and returns `[a]` |
| 5    | New instance, spy rejects first, then resolves `[a]`                     | First call rejects; second call returns `[a]`    |
| 6    | Subclass with `cacheList` omitted                                        | Spy called on every call                         |

Status: Designed.

**TC-SVC-04** Form submission confirmation (SRS-RES-03, RES-06), with
`fetch` stubbed:

| Case | API answer                         | `submitResumeRequest` / `submitCallbackRequest` |
| ---- | ---------------------------------- | ----------------------------------------------- |
| a    | 201 `{submittedAt: '…Z'}`          | Resolves; `createdAt` equals `submittedAt`; posted body has trimmed `fields` |
| b    | 404 (form missing)                 | Rejects with `ApiError` status 404              |
| c    | 500 `{message: 'x'}`               | Rejects with `ApiError` status 500, message `x` |
| d    | `fetch` rejects (offline)          | Rejects                                         |

Status: Designed.

**TC-ART-01** ArticleService ordering and lookup (SRS-ART-03, ART-02)

1. `findAll()` → sorted by `createdAt` descending.
2. `findBySlug(existing)` → article; `findBySlug('nope')` → `undefined`.
3. `getBody(slug)` → component for each database slug; `undefined` for
   unknown. Also assert every article slug has a body (catches a missing
   MDX file) and every MDX file has metadata.

Status: Designed.

**TC-PRJ-01** ProjectService ordering and integrity (SRS-PRJ-01, PRJ-02):
same as TC-ART-01 with `year` descending. Status: Designed.

**TC-ART-02** Article data integrity (SRS-ART-01)

| Check                                              | Expected |
| -------------------------------------------------- | -------- |
| `id` matches `/^[0-9a-f]{8}$/` and is unique        | Pass     |
| `slug` matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`, unique | Pass     |
| `createdAt` parses and ends with `Z`               | Pass     |
| `readingTime` positive integer                     | Pass     |
| `tags` non-empty, lowercase                        | Pass     |

Status: Designed.

### 3.2 Interaction store

**TC-ART-03** Toggle and persist (SRS-ART-12)

1. `readOne(id)` → `{views: 0, liked: false, favorited: false}`.
2. `toggleLike(id)` → `liked: true`; storage JSON contains it.
3. `toggleLike(id)` again → `liked: false`.
4. `toggleFavorite(id)` → `favorited: true`; other fields unchanged.
5. Subscribed listener called once per write.

**TC-ART-04** View registration (SRS-ART-11), fresh module and empty
`sessionStorage` per case:

| Case | Setup / action                                                    | Expected                                    |
| ---- | ----------------------------------------------------------------- | ------------------------------------------- |
| a    | `registerView(id)` twice                                           | `views: 1`; `lastViewedAt` equals the faked time; `swemre:viewed-articles` = `["<id>"]` |
| b    | `sessionStorage` already holds `["<id>"]` (reload), `registerView(id)` | `views` unchanged                       |
| c    | `registerView(a)`, `registerView(b)`                               | Both counted once; the session list holds both ids |
| d    | `sessionStorage.getItem` throws; `registerView(id)` twice          | `views: 1` (once per page load), no throw   |

**TC-ART-05** Cross-tab sync (SRS-ART-13): dispatch a `StorageEvent` with
key `swemre:article-interactions` and new value → subscriber called; next
`readAll()` returns the new value. Event with another key → not called.

**TC-ART-06** Corrupt storage (SRS-SEC-06): key holds `"oops"` → `readAll()`
returns `{}` without throwing.

Status: all Designed.

### 3.3 Search

**TC-SRCH-01** Scoring decision table (SRS-SRCH-03)

| Query      | Document title / tags / summary            | Expected score |
| ---------- | ------------------------------------------ | -------------- |
| `gen`      | "Generic Service Layer"                    | 100 (title prefix) |
| `serv`     | "Generic Service Layer"                    | 70 (word prefix)   |
| `ric`      | "Generic Service Layer"                    | 50 (substring)     |
| `type`     | tags `['typescript']`                      | 40 (tag prefix)    |
| `backend`  | summary "…without a backend…"              | 15 (body)          |
| `gen zzz`  | "Generic Service Layer"                    | 0 (excluded)       |
| `gen serv` | "Generic Service Layer"                    | 170                |

**TC-SRCH-02** Ordering and limit: 25 matching documents, `limit` 20 → 20
results, scores non-increasing.

**TC-SRCH-06** Empty-query default list (SRS-SRCH-08): register Pages (3
items, no `featured`), Articles (8 items, `featured: 5`) and Projects
(2 items, `featured: 0`); `search('')` and `search('   ')` → the 3 pages
then the first 5 articles in `findAll` order, no projects, score 0. With
every source empty → `[]`, and the dialog shows "Nothing to show yet".

**TC-SRCH-03** Registration (SRS-SRCH-05): register a new source of a test
`Searchable` type → its items appear with the given category, subtitle and
action, no other code changed.

**TC-PERF-01** (SRS-PERF-04): 500 synthetic documents, 5-term query, median
of 20 runs < 50 ms in Node.

Status: all Designed.

### 3.4 Forms

**TC-RES-01** Validation boundaries (SRS-RES-02)

| Field      | Input                    | Valid? |
| ---------- | ------------------------ | ------ |
| fullName   | `"A"`                    | No     |
| fullName   | `" Al "`                 | Yes (trimmed length 2) |
| email      | `"a@b"`                  | No     |
| email      | `"a@b.co"`               | Yes    |
| email      | `"a b@c.d"`              | No     |
| reason     | 9 characters             | No     |
| reason     | 10 characters            | Yes    |
| reason     | 12 spaces                | No     |

Status: Designed.

### 3.5 Chat service

**TC-CHAT-01** Start (SRS-CHAT-04): `start()` → conversation titled
"New conversation", one `owner` message, delivery `sent`, persisted.

**TC-CHAT-02** Enqueue (SRS-CHAT-10): `enqueue(id, 'Hello')` → last
message is the visitor's with delivery `sending`; `updatedAt` advanced; no
request made yet. Presence `offline` does not change this.

**TC-CHAT-03** Title rule (SRS-CHAT-05)

| First visitor message      | Title                       |
| -------------------------- | --------------------------- |
| 40 characters              | Same 40 characters          |
| 41 characters              | First 40, trimmed, then `…` |
| Second message             | Title unchanged             |

**TC-CHAT-04** Ordering: two conversations, enqueue to the older one →
`list()` returns it first.

**TC-CHAT-05** Unknown id: `enqueue('missing', 'x')` → `undefined`, storage
unchanged.

**TC-CHAT-08** Delivery (SRS-CHAT-10 to CHAT-12), `fetch` stubbed:

| Case | Setup / action                                                         | Expected                                         |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| a    | New conversation, `enqueue`, `deliver`; API answers `{token, messages}` | One POST to `/conversations`; `publicToken` stored; message replaced by the server copy, `sent` |
| b    | Conversation with a token, API rejects                                 | POST to `/conversations/<token>/message`; message `queued` |
| c    | Two queued messages; `markSending(id)` then `deliver(id)`, API ok       | `markSending` → `true`, both `sending`; two POSTs in order; both `sent` |
| d    | First POST fails with two unsent messages                              | One POST only; both `queued`                     |
| e    | `deliver(id)` twice without awaiting, one unsent message               | Exactly one POST for it                          |
| f    | Storage holds a `sending` message; construct the service               | It is `queued`; `pending()` lists the conversation |
| g    | Nothing unsent; `markSending(id)`                                      | `false`, storage unchanged                       |

Status: all Designed.

### 3.6 RSS

**TC-RSS-01** (SRS-RSS-01, RSS-02, RSS-03): run `npm run rss`; parse
`public/rss.xml` → valid XML, one item per feed entry, newest first,
`atom:link rel="self"` present, special characters escaped. Status: Manual
pass 2026-10-15 (17 items, parsed with Python `xml.dom.minidom`).

**TC-RSS-02** Feed validation (SRS-RSS-04): import `feedDatabase`, remove a
song entry and append an entry with a duplicate id, an unknown project
slug and a date without a time, then run the generator → exit code 1 and
four listed problems; `public/rss.xml` unchanged. Status: Manual pass
2026-10-15 (scratch script).

**TC-RSS-03** Stable output (SRS-RSS-05): run `npm run rss` twice →
byte-identical files. Status: Designed.

**TC-MAP-01** Sitemap generation (SRS-MAP-01, MAP-02), against a local
stub API (`VITE_API_BASE` pointing at it):

| Case | Stub answers                                              | Expected                                           |
| ---- | --------------------------------------------------------- | -------------------------------------------------- |
| a    | 2 articles, 1 project, `page` type 404                     | Exit 0; valid XML; `/`, `/articles`, `/projects`, 2 article and 1 project URLs; `lastmod` = date of `lastUpdatedAt`; no `/sp/` URL |
| b    | A slug containing `&`                                      | `&amp;` in `loc`                                   |
| c    | API not listening, `public/sitemap.xml` exists            | Warning; exit 0; file unchanged                    |
| d    | API not listening, no `public/sitemap.xml`                | Exit 1                                             |
| e    | `article` answers 500                                      | Treated as unreachable (case c or d)               |

Also run `npm run dev` and `npm run build` once each: the sitemap step runs
after RSS. Status: Designed.

**TC-PRE-01** Route pre-render (SRS-PRE-01 to PRE-03, GEN-06), with
`VITE_API_BASE` at a local API:

| Case | Setup                                                     | Expected                                           |
| ---- | --------------------------------------------------------- | -------------------------------------------------- |
| a    | `npm run build` with published articles                    | `dist/articles/<slug>/index.html` exists; one `<title>` "<seoTitle or title> · SWEMRE"; description, canonical and `og:url` `https://swemre.com/articles/<slug>`, `og:image`/`twitter:image` the `ogImage` or cover; `twitter:card` `summary_large_image`; `dist/index.html` "SWEMRE", canonical `https://swemre.com/`, site settings image |
| b    | Run `npm run prerender` again                              | `dist/` byte-identical                            |
| c    | Add `dist/articles/old-post/index.html`; run `npm run prerender` | `old-post` removed                            |
| d    | `npx vite preview`; request `/articles/<slug>`, `/articles`, `/articles/unknown` | The article's tags; the list's tags; the `dist/index.html` shell (SPA fallback) |
| e    | `npm run build` with `VITE_API_BASE` at a closed port      | Warning; exit 0; only `dist/index.html`, with the `index.html` defaults |
| f    | Open a pre-rendered route in the browser after load         | Runtime tags equal the static ones, no duplicate tags |
| g    | A slug outside `[a-z0-9-]` (stub API)                      | Warning; no file for it                            |

Status: a to e Manual pass 2026-10-23 (local API container, one article, no
projects or special pages); f Unverified (the local API container refused
the preview origin through CORS, so the page showed "not found"; canonical
and `og:url` matched and no tag was duplicated); g Designed.

**TC-MAP-02** robots.txt (SRS-MAP-03): inspect `public/robots.txt` → allows
`/` for every agent and names `https://swemre.com/sitemap.xml`. Status:
Pass by inspection 2026-10-23.

### 3.7 Sound

**TC-SND-01** Classification (SRS-SND-01, SND-02): with `soundEngine.play`
spied, dispatch events on a test DOM and expect:

| Event                                              | Expected sound |
| -------------------------------------------------- | -------------- |
| pointerdown on `<button>`                          | `tap`          |
| pointerdown on `<button aria-pressed="false">`     | `toggle-on`    |
| pointerdown on `<button disabled>`                 | none           |
| pointerdown on `<button data-sound="none">`        | none           |
| pointerdown with the right mouse button            | none           |
| keydown `a` in `<input>`                           | `key`          |
| keydown `Backspace` in `<textarea>`                | `back`         |
| keydown `Enter` in `<textarea data-sound-enter="none">` | none      |
| keydown `Shift`, or `k` with Ctrl                  | none           |
| keydown `Enter` on a focused `<a href>`            | `tap`          |
| keydown `ArrowDown` on the page                    | `nav`          |

**TC-SND-02** Mute (SRS-SND-04, SND-05): click the mute switch → icon
changes, `aria-pressed="true"`, storage `swemre:sound-muted` = `true`, and
no oscillator starts on further clicks; reload → still muted.

**TC-SND-03** Event sounds (SRS-SND-03): open and close a modal → `open`,
`close`; submit the empty resume form → `error`; valid submit →
`success`; send a chat message → `send` only (no `enter`).

**TC-SND-04** No audio support (SRS-SND-06): delete `window.AudioContext`
→ interactions work and nothing throws.

**TC-MAN-04** Listening check (SRS-SND-01 to SND-03): in Chrome, Firefox
and Safari, click, type and open dialogs; sounds are short, quiet and not
doubled. Status of TC-SND-*: Designed; TC-MAN-04 not yet run (sound could
not be heard in the headless environment).

## 4. Component tests (L3)

| ID          | Verifies                  | Procedure                                                                                      | Expected                                              | Status   |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| TC-NAV-01   | SRS-NAV-02, NAV-03        | Render `Navbar` in a `MemoryRouter` at `/articles`                                              | Logo link to `/`; three links; Articles has active style; search, resume and theme buttons present | Designed |
| TC-NAV-02   | SRS-NAV-05                | Same, viewport class check: click "Toggle menu"                                                  | Mobile nav appears; `aria-expanded="true"`; clicking a link closes it | Designed |
| TC-NAV-03   | SRS-NAV-06                | Open the mobile menu; press Escape. Open; `pointerdown` on `document.body`. Open; `pointerdown` inside the menu. Open; navigate programmatically to `/projects` | Closed, focus on "Toggle menu"; closed; stays open; closed | Designed |
| TC-HOME-01  | SRS-HOME-01 to HOME-03    | Render `HomePage` with fake services (7 articles, 2 projects, 3 songs)                          | Title text exact; "Request a call back" opens the call back dialog; no `tel:` link; 5 article rows max; 2 project rows; 3 song rows | Designed |
| TC-HOME-02  | SRS-HOME-05               | Render `HomePage` with (a) 1 article, 0 projects, 0 songs; (b) services still loading; (c) all empty | (a) only "Articles 01"; (b) three `--` counts; (c) no stats `<dl>` | Designed |
| TC-HOME-03  | SRS-HOME-06               | Render `ArticleShowcase` with 1 article, then 3, at 1280 px                                     | 1: wrapper `lg:col-span-12`, card `lg:flex-row`; 3: `lg:col-span-7` plus the reading list | Designed |
| TC-ART-07   | SRS-ART-04, ART-05        | Render `ArticlesPage` at `/articles?tag=react`                                                  | Only react articles; tag button pressed; "Saved only" with one favorited → one row | Designed |
| TC-ART-08   | SRS-ART-06, ART-09        | Render `ArticlePage` at a known slug                                                            | Breadcrumb, tags, `h1`, summary, author, date, reading time, Like, Save, view count, sidebars | Designed |
| TC-ART-09   | SRS-ART-10, PRJ-05, GEN-03 | `ArticlePage` and `ProjectPage` at unknown slugs; `App` at `/nope`                             | Same `NotFound` view: "404", "Article not found" / "Project not found" + back link, `document.title` "Article not found · SWEMRE" etc.; "Page not found" + link to `/`, title "Page not found · SWEMRE" | Designed |
| TC-ART-10   | SRS-ART-11                | Render `ArticlePage` in `StrictMode`; unmount and mount again in the same session               | `views` = 1 after the first mount and still 1 after the second | Designed |
| TC-ART-11   | SRS-ART-07                | Render `DocsLayout` with an MDX body containing two `h2` and one `h3`                           | TOC lists three entries with matching ids and levels    | Designed |
| TC-ART-12   | SRS-LAY-08                | `ArticlePage` and `ProjectPage` with a loader that never settles, then one resolving `undefined` | `HeaderBand` (`aria-hidden`) rendered above "Loading…" and above the not-found view | Designed |
| TC-ART-13   | SRS-ART-15, PRJ-07, A11Y-08 | `ArticleTemplate` / `ProjectTemplate` / `CoverImage` with a cover `{url, altText: 'A', width: 1600, height: 900}`, then without `altText`, then without a cover | `<img>` in the header with `alt="A"`, `width=1600`, `height=900`; `alt=""`; no header image | Designed |
| TC-ART-14   | SRS-ART-16                | `DocsLayout` with two headings, viewport below 1280 px; then with no headings                   | Closed `<details>` "On this page" before the body; opening lists both headings; no `<details>` without headings | Designed |
| TC-ART-15   | SRS-ART-17                | `ArticlesPage` with tags at 768 px; click a chip                                                | Chip row above the list ("All" + tags with counts), sidebar hidden; chip `aria-pressed`, `?tag=` updated, list filtered | Designed |
| TC-PRJ-02   | SRS-PRJ-03                | `ProjectTemplate` with and without `url`/`repoUrl`                                              | Buttons shown only when URLs exist; `rel="noreferrer noopener"` | Designed |
| TC-PRJ-03   | SRS-PRJ-08                | `ProjectsPage` with a loading, then an empty project list                                       | "Loading…" only, then "No projects yet" with a link to `/articles`, no grid | Designed |
| TC-PRJ-04   | SRS-PRJ-09, LAY-09        | `ProjectsPage` with projects and articles; then no articles. `SidebarNav` with one empty and one filled section | Sidebar has only "Articles"; no `<aside>`; only the filled section's heading | Designed |
| TC-SRCH-04  | SRS-SRCH-01, SRCH-04      | Render `SearchDialogProvider`; press Ctrl+K; type; ArrowDown; Enter                              | Dialog opens; selection moves; navigate called with the right path; Escape closes | Designed |
| TC-SRCH-05  | SRS-SRCH-01               | Focus an input; press "/"                                                                        | Dialog does **not** open                                | Designed |
| TC-SRCH-07  | SRS-SRCH-07               | Search service whose `search('a')` resolves at once and `search('ab')` waits; type "a", then "b"; press Enter before `ab` settles | After "b": no result rows, Enter does nothing; rows appear when `ab` settles | Designed |
| TC-PLY-01   | SRS-PLY-02, PLY-03, PLY-08 | `PlayerProvider` with stubbed iFrame API; toggle song A; toggle A; toggle B                     | Script injected once on first toggle; `createController` once; `togglePlay` on A again; `loadUri` + `play` for B | Designed |
| TC-PLY-02   | SRS-PLY-06                | After TC-PLY-01, call `close()`                                                                 | `destroy` called; `current` null; panel hidden          | Designed |
| TC-PLY-03   | SRS-PLY-07                | Script `onerror` fires                                                                          | `failed` true; panel renders fallback iframe with the embed URL | Designed |
| TC-CHAT-06  | SRS-CHAT-01, CHAT-02, CHAT-08 | Render `Dock` with a song playing; click launcher                                          | Chat panel opens; player collapsed; "New conversation" creates and opens one; delete (after confirming) removes it | Designed |
| TC-CHAT-09  | SRS-CHAT-06, CHAT-10, CHAT-11 | Presence `offline`; send "hi" with a delivery that waits; then let it fail; then press the bubble (click and Enter) with the API answering | New banner text; bubble at once with "Sending…"; then "Not sent · tap to retry" as a `<button>` named "Retry sending: hi"; after retry check mark | Designed |
| TC-CHAT-10  | SRS-CHAT-12               | One queued message; (a) fire window `online`; (b) close and open the panel; (c) socket stub fires `onopen` | Each triggers one delivery attempt; never two POSTs for the same message | Designed |
| TC-CHAT-11  | SRS-CHAT-13               | Conversation list: press delete, then Cancel; press delete, Escape; press delete, Delete. Repeat with `pointer: coarse` emulated | Confirmation row with Cancel focused; row back; row back; conversation removed. Delete button visible without hover on coarse pointers and on keyboard focus | Designed |
| TC-CHAT-07  | SRS-CHAT-07               | In a conversation, type "hi", Enter; type "a", Shift+Enter, "b", Enter; press Enter on empty     | Two messages: "hi", "a\nb"; no empty message            | Designed |
| TC-RES-02   | SRS-RES-01, RES-03        | Click navbar CTA; fill valid values; submit                                                    | Modal open; `submitResumeRequest` called once with trimmed values; confirmation shows first name and email | Designed |
| TC-RES-03   | SRS-RES-02                | Submit empty form                                                                               | Three field errors, focusable, no service call          | Designed |
| TC-RES-04   | SRS-RES-05                | Resume form with `submitResumeRequest` rejecting; submit valid values; then let it resolve and submit again | Alert "The request could not be sent. Please try again later.", `error` sound, fields and button enabled; second submit shows the confirmation | Designed |
| TC-RES-05   | SRS-RES-06, RES-03        | Call back form with `submitCallbackRequest` rejecting (as for a 404); then resolving              | Error shown, no "Call back requested"; then the confirmation | Designed |
| TC-RES-06   | SRS-RES-07                | Both forms: submit with only the second field invalid; then all empty; then type in an invalid field | Focus on the second field; focus on the first field; that field's error disappears, others stay | Designed |
| TC-RES-07   | SRS-RES-08                | Open both dialogs at 360 px and 1920 px; inspect the header                                     | Title and subtitle end left of the close button (header `pr-14`) | Designed |
| TC-THM-01   | SRS-THM-01, THM-02        | Stored `dark` → render; toggle                                                                  | `data-theme="dark"`, then `light`; storage updated      | Designed |
| TC-THM-02   | SRS-THM-02                | Empty storage; `matchMedia` dark                                                                | Initial `dark`; storage still empty                     | Designed |
| TC-THM-03   | SRS-THM-02                | Empty storage, `matchMedia` light; fire a `change` to dark; then toggle; then fire `change` to light | `data-theme` becomes `dark` with nothing stored; toggle stores `light` and applies it; the later system change is ignored | Designed |
| TC-GEN-01   | SRS-GEN-05, GEN-06        | Component calling `useDocumentTitle('X', {description: 'D', image: 'I'})` at `/articles/x/`; then `useDocumentTitle()` at `/` | Title "X · SWEMRE", description and `og:description` "D", `og:image` and `twitter:image` "I", canonical and `og:url` `https://swemre.com/articles/x` (no trailing slash), `twitter:title` "X · SWEMRE", `twitter:card` `summary_large_image`; then canonical `https://swemre.com/`, then "SWEMRE", site description, avatar image, `summary`; no duplicate meta elements | Designed |
| TC-GEN-04   | SRS-GEN-10                | Build with an API holding an article with a 1600×500 cover and no `ogImage`; read `dist/articles/<slug>/index.html`. In the browser open the article, then go to `/projects` | File and runtime: `og:type` `article`, both `article:*` times, `og:image` the cover with width 1600 and height 500, `summary_large_image`. On `/projects`: `og:type` `website`, the avatar with 384×384 and alt, `summary`, no `article:*` tags left | Designed |
| TC-GEN-05   | SRS-GEN-11                | Build against an API with one article and one project with `repoUrl`; parse the `structured-data` script of `dist/index.html`, `dist/articles/index.html`, the article and the project file. In the browser go from an article to `/` and to `/sp/privacy-policy`. After deploy, run Google's Rich Results Test on home, one article and one project | `WebSite` + `Person` with both `sameAs`; `BreadcrumbList` (2 items); `BreadcrumbList` (3) + `BlogPosting` with both dates; `BreadcrumbList` + `SoftwareSourceCode` with `codeRepository`. Runtime matches and the script is replaced per page and removed on the special page. Rich Results Test: no errors | Designed |
| TC-GEN-02   | SRS-GEN-07, GEN-08        | Render `SiteLayout` in a `MemoryRouter` with a route element that throws; navigate to `/`. Then make a child of `Dock` throw | "Something went wrong", Reload and "Back to home" with navbar and footer present, title "Something went wrong · SWEMRE", `console.error` called; after navigating the home page renders. Dock gone, page content still rendered | Designed |
| TC-LGL-01   | SRS-LGL-01, LGL-02        | Render `SpecialPage` at `/sp/privacy-policy`                                                    | Version, effective and updated dates; numbered contents | Designed |
| TC-LGL-02   | SRS-LGL-04                | Render `SpecialPage` at an unknown slug                                                         | `NotFound` with "This page is not available right now.", a `mailto:` link to the contact email and a link to `/` | Designed |
| TC-FTR-01   | SRS-FTR-01, LGL-03        | Render `Footer`                                                                                 | Social links; RSS link `/rss.xml`; privacy link         | Designed |
| TC-API-01   | SRS-MNT-10                | Load `/articles/<slug>`, open the chat and send a message; list the API requests. Run `npm run rss` and `npm run sitemap` against the same API before and after the change | Same request URLs as before the change; RSS (ignoring `lastBuildDate`) and sitemap identical | Designed |
| TC-API-02   | SRS-MNT-11                | `readSiteEnv` with an empty source, then with every variable set (site URL with a trailing slash, timeout `abc`); build with `VITE_SITE_URL=https://example.test/ VITE_LOCALE=de` | Defaults from `siteDefaults`; values trimmed, slash dropped, default timeout; `dist/index.html` has `lang="de"` and `og:url` `https://example.test/` | Designed |
| TC-API-03   | SRS-MNT-12                | `createPublicApi` with `timeoutMs: 50` against a server that never answers; call `listPosts` | Rejects with a timeout error after about 50 ms | Designed |
| TC-API-04   | SRS-MNT-13                | `createPublicApi` with channel `swemre`, read key `rk`, locale `en` against a mock serving the bodies of docs/public-api-v2.md: list articles with `term: 'notes'` (newest first) and songs (by title), get a slug, the same slug as another content type and a missing slug, submit a form, ask presence; then read key `bad`; then no channel key | v2 `/public/v2/channels/swemre/publications?content-type=article&locale=en&size=100&term=notes` and `/publications/<slug>?locale=en` with `X-Read-Key: rk`; `fields.cover.altText` from `alt`, `fields.summary` from `excerpt`, `fields.body` and `languageVersions` on the detail, terms with `taxonomy`; other type and missing slug `undefined`; form, presence on v1 without the header; 401 rejects with `ApiError(401)`; without a channel key the v1 `/posts?type=` path | Designed |

## 5. End-to-end tests (L4, Playwright)

### TC-E2E-01 Reader journey (SRS-NAV-01, ART-06, ART-12, GEN-04)

| Step | Action                                             | Expected                                                    |
| ---- | -------------------------------------------------- | ----------------------------------------------------------- |
| 1    | Open `/`                                           | Title visible; no vertical scrollbar at 1920×1080 (HOME-04) |
| 2    | Click first article in the Articles list           | URL `/articles/<slug>`; window scrolled to top; band visible |
| 3    | Click "Save"                                       | Button pressed state                                        |
| 4    | Reload                                             | Still saved; views = 1 (same session, SRS-ART-11)           |
| 5    | Open `/articles`, click "Saved only"               | Exactly that article listed                                 |

### TC-E2E-02 Search journey (SRS-SRCH-01 to SRCH-04)

1. On `/`, press Control+K → dialog visible, input focused.
2. Type `token` → "A Token-Only Design System…" first under Articles.
3. Press Enter → navigated to the article; dialog closed.

### TC-E2E-03 Layout widths (SRS-LAY-01, LAY-02, CMP-02)

For each width in 360, 1024, 1920, 2560, 3440 on `/articles` and
`/projects/swemre-website`:

| Check                                                     | Expected                                  |
| --------------------------------------------------------- | ----------------------------------------- |
| `document.documentElement.scrollWidth <= innerWidth`      | True (no horizontal scroll)               |
| Content container width at 1920                           | 1728 px (108rem cap), centred             |
| Content container width at 3440                           | 1728 px (108rem cap), centred             |
| Navbar inner width at 3440                                | 1856 px (116rem cap)                      |

### TC-E2E-04 Header band (SRS-LAY-04, LAY-05, NAV-04)

On every band route: band element `aria-hidden="true"`, contains no text;
height between 136 and 160 px at 1080 px viewport height; navbar
`data-tone="cover"` at scroll 0 and `default` after scrolling 200 px.

### TC-E2E-05 Player persistence (SRS-PLY-04, PLY-05) — demonstration

1. On `/`, play the first song (requires network to Spotify).
2. Navigate to `/articles` and `/projects`.
3. Expected: the dock player stays visible, the embed iframe is the same
   element (same `contentWindow`), and `isPaused` is false.
4. Collapse → iframe still in DOM with zero height.

Marked flaky-tolerant: skipped when Spotify is unreachable.

### TC-E2E-06 Spotify blocked fallback (SRS-PLY-07)

Route-abort `open.spotify.com/embed/iframe-api/**`; play a song → fallback
iframe with `/embed/track/<id>` appears.

### TC-E2E-07 Chat persistence (SRS-CHAT-02, CHAT-03, CHAT-06)

With the chat API routes aborted: open chat, start a conversation, send
"Hello there", reload, reopen → the conversation is listed with title
"Hello there" and the message shows "Not sent · tap to retry". Unblock the
routes and go online (`context.setOffline(false)`) → the message is posted
once and shows the check mark.

### TC-E2E-12 Phone layout (SRS-LAY-07, CHAT-14)

At 375×812 (mobile emulation): scroll `/` and `/articles` to the bottom →
footer text and hero stats are not covered by the dock. Open chat → the
panel fills the viewport, padded by the safe-area insets; `document
.documentElement.style.overflow` is `hidden` and wheel/touch scrolling does
not move the page; close → `overflow` restored. Resize to 768 px with chat
open → floating panel, page scrolls again.

### TC-E2E-08 No storage (SRS-CMP-03)

Launch with `localStorage` access throwing (init script overriding
`Storage.prototype`) → every route renders; like, theme and chat work for
the session; no uncaught errors in the console.

### TC-E2E-09 Accessibility scan (SRS-A11Y-07)

Run axe on `/`, `/articles`, an article, `/projects`, a project,
`/sp/privacy-policy`, with the search dialog open, the resume modal open and
the chat panel open, in both themes → zero serious or critical violations.

### TC-E2E-10 Keyboard only (SRS-A11Y-01, A11Y-02, A11Y-05)

Using only Tab, Shift+Tab, Enter, Space, Escape: reach every navbar control,
open and submit the resume modal, open search and navigate, play a song, open
chat and send a message. Every focused element shows the focus ring. Focus
returns to the trigger when a dialog closes.

### TC-E2E-13 Skip link and route focus (SRS-A11Y-09, A11Y-10, GEN-04)

1. Load `/`, `/articles`, `/projects` and an article; press Tab once → "Skip to content" is focused and visible (fixed, top left, above the navbar).
2. Press Enter → focus is on `<main>`; the next Tab reaches the first control inside `<main>`; the URL does not change.
3. From `/`, Tab to the navbar "Articles" link and press Enter → URL `/articles`, `scrollY` 0, focus on the `h1` "Articles" without a focus ring, live region text "Articles · SWEMRE".
4. Open an article with the API slow or down → focus moves to the `h1` when it renders, or to `<main>` after 3 s.
5. At 375×812 scroll `/` to 600 px, follow a link, go back → `/` at `scrollY` 600.
6. On `/articles`, change the topic filter (query only) → focus and scroll do not move.

Status: steps 1 to 3 and 5 Manual (Verified in browser 2026-10-23, Vite dev server, API down, PRS-000321); step 4 checked only for the fallback to `<main>` (special page with API down); article and project headings arriving late and step 6 Unverified.

### TC-E2E-11 Performance budget (SRS-PERF-02, PERF-03)

Lighthouse CI (mobile preset) on `/` and one article → LCP < 2.5 s,
CLS < 0.1, performance score ≥ 90.

All L4 cases: Designed.

## 6. Manual procedures (L5)

### TC-MAN-01 Visual check per release

| Step | Action                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------- |
| 1    | `npm run build`, then `npm run preview`                                                        |
| 2    | Capture headless Chrome screenshots: `chrome --headless=new --window-size=1920,1080 --screenshot=<file> <url>`; add `--blink-settings=preferredColorScheme=1` for light or `--force-dark-mode` for dark |
| 3    | Routes: `/`, `/articles`, one article, `/projects`, one project, `/sp/privacy-policy`          |
| 4    | Check: band gradient uses primary tones, grid visible, no text in band; content fills the width; avatars and icon buttons are round/square (no stretched `inline-grid`) |
| 5    | Record result, browser, theme and viewport in the SVD                                          |

Note: headless Chrome enforces a minimum window width of about 500 px; use
device emulation in DevTools for 360 px.

### TC-MAN-02 Spotify playback (SRS-PLY-01, PLY-02, PLY-04, PLY-05)

Play, pause, switch songs, collapse, navigate, close, in Chrome and Safari,
logged in and logged out of Spotify. Expected: audio continues across
navigation; logged-out playback is a 30-second preview.

### TC-MAN-03 Contrast analysis (SRS-A11Y-03, method A)

For each pair (fg/canvas, fg-muted/canvas, fg-subtle/canvas, primary/surface,
fg-on-emphasis/primary-solid, cover-fg/band-via) compute the WCAG ratio in
both themes and record it in Appendix A. Pairs for body text need ≥ 4.5:1;
large text and UI components ≥ 3:1.

### TC-MAN-05 UX fixes browser check (2026-10-23)

Browser check by the lead for the website UX tickets. Verified in browser
2026-10-23:

| Ticket | Requirement      | Observed                                                          |
| ------ | ---------------- | ----------------------------------------------------------------- |
| W1     | SRS-RES-06       | Call back request against a missing form shows the error, not "Call back requested" |
| W18    | SRS-RES-08       | Call back dialog subtitle stays clear of the close button         |
| W19    | SRS-RES-07       | Invalid submit moves focus to the first invalid field             |
| W5     | SRS-ART-15       | Article page shows its cover in the header                        |
| W4     | SRS-LAY-08       | Article not-found page draws the band behind the navbar           |
| W6     | SRS-HOME-05      | Hero stats show only counts above zero                            |
| W7     | SRS-HOME-06      | A single article spans the full width                             |
| W8     | SRS-PRJ-08       | Projects page shows the empty state                               |
| W9     | SRS-LAY-09       | Empty sidebar section is not shown                                |
| W11    | SRS-ART-16       | Collapsible "On this page" below `xl`                             |
| W20    | SRS-GEN-03       | Not-found page sets the "Page not found" title                    |
| W24    | SRS-GEN-06       | Description and Open Graph tags are set per page                  |

Every other UX fix (W2, W3, W10, W12 to W17, W21 to W23, W25, W26) is not
yet verified in a browser; their test cases above are Designed.

## Appendix A: contrast record

Measured 2026-10-15 from the token values in `src/main.css` (WCAG 2.x
relative-luminance formula).

| Pair                            | Light   | Dark    | Required              | Result |
| ------------------------------- | ------- | ------- | --------------------- | ------ |
| fg on canvas                    | 12.14:1 | 7.60:1  | 4.5                   | Pass   |
| fg-muted on canvas              | 5.64:1  | 5.10:1  | 4.5                   | Pass   |
| fg-subtle on canvas             | 3.19:1  | 2.90:1  | 3.0 (non-body text)   | **Fail (dark)**, see RSK-09 |
| primary on surface              | 6.47:1  | 5.51:1  | 4.5                   | Pass   |
| fg-on-emphasis on primary-solid | 11.40:1 | 10.40:1 | 4.5                   | Pass   |
| cover-fg on band-via            | 11.40:1 | 12.45:1 | 3.0 (navbar over band)| Pass   |
| cover-fg on band-to (lightest)  | 6.16:1  | 7.19:1  | 3.0                   | Pass   |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
| 2026-10-23 | UX fixes: added TC-SVC-03, TC-SVC-04, TC-SRCH-06, TC-SRCH-07, TC-CHAT-08 to TC-CHAT-11, TC-MAP-01, TC-MAP-02, TC-NAV-03, TC-HOME-02, TC-HOME-03, TC-ART-12 to TC-ART-15, TC-PRJ-03, TC-PRJ-04, TC-RES-04 to TC-RES-07, TC-THM-03, TC-GEN-01, TC-LGL-02, TC-E2E-12, TC-MAN-05; updated TC-ART-04, TC-ART-09, TC-ART-10, TC-SRCH-02, TC-CHAT-02, TC-CHAT-04 to TC-CHAT-06, TC-HOME-01, TC-THM-02, TC-E2E-01, TC-E2E-07 | Claude, for swemre review |
| 2026-10-23 | PRS-000332: added TC-GEN-02 | Claude, for swemre review |
| 2026-10-23 | PRS-000321: added TC-E2E-13 (skip link, route focus, scroll restore) | Claude, for swemre review |
| 2026-10-23 | PRS-000311: added TC-PRE-01; updated TC-GEN-01 (canonical, Twitter tags, trailing slash) | Claude, for swemre review |
| 2026-10-23 | ADR-017: added TC-API-01 to TC-API-03 | Claude, for swemre review |
| 2026-10-23 | PRS-000443: added TC-API-04 | Claude, for swemre review |
| 2026-10-23 | TC-API-04: documented v2 bodies, term filter, forms on v1 | Claude, for swemre review |
| 2026-10-23 | PRS-000314: added TC-GEN-04 | Claude, for swemre review |
| 2026-10-23 | PRS-000313: added TC-GEN-05 | Claude, for swemre review |
