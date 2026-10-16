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

**TC-ART-04** View registration (SRS-ART-11): `registerView(id)` twice →
`views: 2`, `lastViewedAt` is an ISO string equal to the faked time.

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
results, scores non-increasing. Empty query → first 20 documents, score 0.

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

**TC-CHAT-02** Send while offline (SRS-CHAT-06): `send(id, 'Hello')` →
visitor message with delivery `queued`; `updatedAt` advanced.

**TC-CHAT-03** Title rule (SRS-CHAT-05)

| First visitor message      | Title                       |
| -------------------------- | --------------------------- |
| 40 characters              | Same 40 characters          |
| 41 characters              | First 40, trimmed, then `…` |
| Second message             | Title unchanged             |

**TC-CHAT-04** Ordering: two conversations, send to the older one →
`findAll()` returns it first.

**TC-CHAT-05** Unknown id: `send('missing', 'x')` → `undefined`, storage
unchanged.

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
| TC-HOME-01  | SRS-HOME-01 to HOME-03    | Render `HomePage` with fake services (7 articles, 2 projects, 3 songs)                          | Title text exact; `tel:` href; 5 article rows max; 2 project rows; 3 song rows | Designed |
| TC-ART-07   | SRS-ART-04, ART-05        | Render `ArticlesPage` at `/articles?tag=react`                                                  | Only react articles; tag button pressed; "Saved only" with one favorited → one row | Designed |
| TC-ART-08   | SRS-ART-06, ART-09        | Render `ArticlePage` at a known slug                                                            | Breadcrumb, tags, `h1`, summary, author, date, reading time, Like, Save, view count, sidebars | Designed |
| TC-ART-09   | SRS-ART-10, GEN-03        | `ArticlePage` at unknown slug; `App` at `/nope`                                                 | "Article not found" + link; "Page not found" + link     | Designed |
| TC-ART-10   | SRS-ART-11                | Render `ArticlePage` in `StrictMode`                                                           | `views` = 1 after mount                                  | Designed |
| TC-ART-11   | SRS-ART-07                | Render `DocsLayout` with an MDX body containing two `h2` and one `h3`                           | TOC lists three entries with matching ids and levels    | Designed |
| TC-PRJ-02   | SRS-PRJ-03                | `ProjectTemplate` with and without `url`/`repoUrl`                                              | Buttons shown only when URLs exist; `rel="noreferrer noopener"` | Designed |
| TC-SRCH-04  | SRS-SRCH-01, SRCH-04      | Render `SearchDialogProvider`; press Ctrl+K; type; ArrowDown; Enter                              | Dialog opens; selection moves; navigate called with the right path; Escape closes | Designed |
| TC-SRCH-05  | SRS-SRCH-01               | Focus an input; press "/"                                                                        | Dialog does **not** open                                | Designed |
| TC-PLY-01   | SRS-PLY-02, PLY-03, PLY-08 | `PlayerProvider` with stubbed iFrame API; toggle song A; toggle A; toggle B                     | Script injected once on first toggle; `createController` once; `togglePlay` on A again; `loadUri` + `play` for B | Designed |
| TC-PLY-02   | SRS-PLY-06                | After TC-PLY-01, call `close()`                                                                 | `destroy` called; `current` null; panel hidden          | Designed |
| TC-PLY-03   | SRS-PLY-07                | Script `onerror` fires                                                                          | `failed` true; panel renders fallback iframe with the embed URL | Designed |
| TC-CHAT-06  | SRS-CHAT-01, CHAT-02, CHAT-08 | Render `Dock` with a song playing; click launcher                                          | Chat panel opens; player collapsed; "New conversation" creates and opens one; delete removes it | Designed |
| TC-CHAT-07  | SRS-CHAT-07               | In a conversation, type "hi", Enter; type "a", Shift+Enter, "b", Enter; press Enter on empty     | Two messages: "hi", "a\nb"; no empty message            | Designed |
| TC-RES-02   | SRS-RES-01, RES-03        | Click navbar CTA; fill valid values; submit                                                    | Modal open; `submitResumeRequest` called once with trimmed values; confirmation shows first name and email | Designed |
| TC-RES-03   | SRS-RES-02                | Submit empty form                                                                               | Three field errors, focusable, no service call          | Designed |
| TC-THM-01   | SRS-THM-01, THM-02        | Stored `dark` → render; toggle                                                                  | `data-theme="dark"`, then `light`; storage updated      | Designed |
| TC-THM-02   | SRS-THM-02                | Empty storage; `matchMedia` dark                                                                | Initial `dark`                                          | Designed |
| TC-LGL-01   | SRS-LGL-01, LGL-02        | Render `SpecialPage` at `/sp/privacy-policy`                                                    | Version, effective and updated dates; numbered contents | Designed |
| TC-FTR-01   | SRS-FTR-01, LGL-03        | Render `Footer`                                                                                 | Social links; RSS link `/rss.xml`; privacy link         | Designed |

## 5. End-to-end tests (L4, Playwright)

### TC-E2E-01 Reader journey (SRS-NAV-01, ART-06, ART-12, GEN-04)

| Step | Action                                             | Expected                                                    |
| ---- | -------------------------------------------------- | ----------------------------------------------------------- |
| 1    | Open `/`                                           | Title visible; no vertical scrollbar at 1920×1080 (HOME-04) |
| 2    | Click first article in the Articles list           | URL `/articles/<slug>`; window scrolled to top; band visible |
| 3    | Click "Save"                                       | Button pressed state                                        |
| 4    | Reload                                             | Still saved; views = 2                                      |
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

Open chat, start a conversation, send "Hello there", reload, reopen → the
conversation is listed with title "Hello there" and the message shows
"Queued".

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
