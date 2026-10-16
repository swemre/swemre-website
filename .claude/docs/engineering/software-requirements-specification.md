# Software Requirements Specification (SRS)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-002                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Introduction

### 1.1 Purpose

This document states what swemre-website shall do. Each requirement has an
ID, a statement, a verification method (**T** test, **A** analysis,
**I** inspection, **D** demonstration), a priority and its source.
Traceability to design and tests is in SWE-DOC-007.

### 1.2 Priorities

- **P1 Must**: the release is blocked without it.
- **P2 Should**: important; may slip one release with owner approval.
- **P3 Could**: desirable.

### 1.3 Sources

`OWN-n` refers to the owner's numbered requests in the project history (see
the SVD change history). `STD` means a standard from SWE-DOC-000.

### 1.4 Definitions

| Term          | Meaning                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| Visitor       | Anyone browsing the site                                                |
| Owner         | swemre, the site author                                                 |
| Band route    | `/articles`, `/articles/:slug`, `/projects`, `/projects/:slug`          |
| Header band   | Decorative gradient strip at the top of band routes                     |
| Dock          | Fixed bottom-right area holding the chat panel, player and chat launcher |
| Service       | An implementation of `SwemreService<T>` (see SWE-DOC-004 §3)            |
| HD viewport   | 1920 × 1080 CSS pixels                                                  |

## 2. Overall description

### 2.1 Product perspective

A standalone static single-page application. External dependencies at run
time: the Spotify iFrame API and Spotify image CDN (only for the music
features). No backend, no cookies, no analytics.

### 2.2 Users

| User    | Needs                                                                     |
| ------- | ------------------------------------------------------------------------- |
| Recruiter or hiring manager | Contact details, resume request, projects                 |
| Developer reader | Articles, code samples, search, RSS                                 |
| Owner   | Easy content authoring (MDX + one metadata entry), strict quality gates    |

### 2.3 Constraints

- C-1 Client-side only; content is static and ships with the bundle.
- C-2 TypeScript must stay `erasableSyntaxOnly` (no enums, no parameter
  properties), because scripts load `.ts` files with Node type stripping.
- C-3 Styling only through Tailwind utilities backed by tokens in `src/main.css`.
- C-4 Every source file carries the license header (Apache 2.0 + Commons Clause).
- C-5 ESLint stays on v9 while gts 7 requires it.

### 2.4 Assumptions

- A-1 Visitors use a current evergreen browser (Chrome, Edge, Firefox, Safari,
  last two major versions).
- A-2 JavaScript is enabled.
- A-3 `localStorage` may be unavailable (private mode, blocked storage); the
  site must still work without persistence.

## 3. Functional requirements

### 3.1 General and layout (GEN, LAY)

| ID          | Requirement                                                                                                                                                     | Ver. | Pri. | Source |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-GEN-01  | The system shall be delivered as static files produced by `npm run build`, with no server-side code.                                                              | I    | P1   | OWN-1  |
| SRS-GEN-02  | Every route shall render inside one shared layout containing the navbar, the page outlet, the footer and the dock.                                                 | I, D | P1   | OWN-3  |
| SRS-GEN-03  | An unknown route shall render a "Page not found" view with a link to `/`.                                                                                          | T    | P2   | OWN-3  |
| SRS-GEN-04  | On every route change the window shall scroll to the top.                                                                                                          | T    | P2   | OWN-5  |
| SRS-GEN-05  | Each page with a title shall set `document.title` to `<title> · swemre`.                                                                                           | T    | P3   | Design |
| SRS-LAY-01  | Page content containers shall span the viewport width minus side gutters, capped at `--container-page` (108rem = 1728 px). | I, D | P1 | OWN-8 |
| SRS-LAY-02  | The navbar and footer containers shall span the viewport width minus gutters, capped at `--container-wide` (150rem = 2400 px). | I, D | P1   | OWN-8  |
| SRS-LAY-03  | The article and project column (header block and body) shall be capped at `--container-reading` (75ch), giving about 65 to 75 characters per line, with at least 3.5rem (lg) and 5rem (xl) between it and the sidebars.                                                                                       | I    | P2   | OWN-8  |
| SRS-LAY-04  | Band routes shall show a header band with a primary-tone gradient and a grid overlay, and no text or images inside the band.                                       | I, D | P1   | OWN-8  |
| SRS-LAY-05  | The header band height shall be defined by the `--spacing-band` token (≈150 px including the navbar overlay, fluid between 8.5rem and 10rem).                      | I    | P1   | OWN-8  |
| SRS-LAY-06  | Components shall not hard-code widths or heights in pixels; sizes shall come from tokens or the spacing scale, except icons, avatars, form controls and third-party embed constraints. | I | P1 | OWN-8 |

### 3.2 Navigation (NAV)

| ID          | Requirement                                                                                                                       | Ver. | Pri. | Source |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-NAV-01  | The navbar shall stay fixed at the top of the viewport on every route.                                                             | D    | P1   | OWN-3  |
| SRS-NAV-02  | The navbar shall show the logo (a single "SWEMRE" mark) linking to `/`, and links to Home, Articles and Projects with the active one highlighted. | T | P1 | OWN-3, OWN-5 |
| SRS-NAV-03  | The navbar shall contain a search trigger, a "Request my resume" button (viewports ≥ 640 px) and a theme switch.                    | T    | P1   | OWN-3  |
| SRS-NAV-04  | On band routes and on the home page the navbar shall be transparent with light text while the page is not scrolled, and solid after scrolling.           | D    | P2   | OWN-5  |
| SRS-NAV-05  | Below 768 px a menu button shall toggle a mobile navigation that includes the resume button.                                        | T    | P2   | Design |

### 3.3 Home (HOME)

| ID          | Requirement                                                                                                         | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-HOME-01 | The home page shall show the owner's avatar, the title "Software Engineer - Emre" and a one-sentence tagline on the primary-tone gradient and grid background. The browser title shall be "SWEMRE" (pages: "<page> · SWEMRE").                 | T    | P1   | OWN-3  |
| SRS-HOME-02 | The home page shall show a phone button using a `tel:` link and a "Request my resume" button.                        | T    | P1   | OWN-3  |
| SRS-HOME-03 | The home page shall show three lists side by side (≥ 768 px): articles, projects and songs I liked, at most five items each, each with a link to its index page where one exists. | T | P1 | OWN-3 |
| SRS-HOME-04 | On viewports ≥ 1024 px the home page shall fit in one screen without vertical page scrolling.                        | D    | P2   | OWN-3  |

### 3.4 Articles (ART)

| ID          | Requirement                                                                                                                         | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-ART-01  | Each article shall have static metadata: `id`, `slug`, `title`, `summary`, `author`, `createdAt` (ISO 8601 UTC), `readingTime` (minutes) and `tags`. | I | P1 | OWN-1 |
| SRS-ART-02  | Each article body shall be an MDX file named `<slug>.mdx` in `src/page/article/`, loaded only when the article is opened.            | I, T | P1   | OWN-1  |
| SRS-ART-03  | The articles index shall list articles newest first.                                                                                | T    | P1   | OWN-3  |
| SRS-ART-04  | The articles index shall filter by tag, reflected in the `?tag=` query parameter, with per-tag counts.                               | T    | P2   | OWN-4  |
| SRS-ART-05  | The articles index shall offer a "Saved only" filter showing only favorited articles.                                              | T    | P3   | OWN-1  |
| SRS-ART-06  | The article page shall show breadcrumbs, tags, title, summary, author, publication date, reading time, like and save actions and the view count, below the header band. | T | P1 | OWN-1, OWN-8 |
| SRS-ART-07  | The article page shall show a table of contents built from the body's `h2` and `h3` headings and highlight the heading in view.      | T, D | P2   | OWN-4  |
| SRS-ART-08  | The article page shall show previous and next article links, ordered by date.                                                      | T    | P3   | OWN-5  |
| SRS-ART-09  | The article page shall show a left sidebar listing articles (current one marked) and projects.                                     | T    | P2   | OWN-5  |
| SRS-ART-10  | An unknown article slug shall render "Article not found" with a link to `/articles`.                                               | T    | P2   | Design |
| SRS-ART-11  | Opening an article shall increment its view count once per page visit, including under React StrictMode.                           | T    | P1   | OWN-1  |
| SRS-ART-12  | Like and save shall toggle per article and persist in `localStorage` under `swemre:article-interactions`.                          | T    | P1   | OWN-1  |
| SRS-ART-13  | Interaction state shall update in all open tabs when changed in one tab.                                                           | T    | P3   | Design |
| SRS-ART-14  | Code blocks shall be syntax-highlighted at build time in both themes.                                                              | I, D | P2   | OWN-4  |

### 3.5 Projects (PRJ)

| ID          | Requirement                                                                                                   | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-PRJ-01  | Each project shall have static metadata (`id`, `slug`, `title`, `summary`, `year`, `tags`, optional `url`, `repoUrl`) and an MDX body `src/page/projects/<slug>.mdx`. | I | P1 | OWN-7 |
| SRS-PRJ-02  | The projects index shall list projects as cards, newest year first.                                            | T    | P1   | OWN-3  |
| SRS-PRJ-03  | The project page shall show breadcrumbs, year, tags, title, summary and "Live site" / "Source" buttons when the URLs exist, below the header band. | T | P1 | OWN-7, OWN-8 |
| SRS-PRJ-04  | The project page shall show a sidebar (projects with the current one marked, then articles), a table of contents and previous/next links. | T | P2 | OWN-5, OWN-7 |
| SRS-PRJ-05  | An unknown project slug shall render "Project not found" with a link to `/projects`.                           | T    | P2   | Design |
| SRS-PRJ-06  | One project page shall explain this website and its structure.                                                 | I    | P2   | OWN-8  |

### 3.6 Search (SRCH)

| ID           | Requirement                                                                                                         | Ver. | Pri. | Source |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-SRCH-01  | Pressing Ctrl+K or ⌘+K anywhere, or "/" outside a text field, or clicking the navbar trigger shall open the search dialog. | T | P1 | OWN-4 |
| SRS-SRCH-02  | Search shall cover pages, articles, projects, songs and legal pages, grouped by category.                            | T    | P1   | OWN-4  |
| SRS-SRCH-03  | Every query term shall match a result; results shall be ranked title prefix > title word prefix > title substring > tag prefix > summary or keywords. | T | P1 | Design |
| SRS-SRCH-04  | Arrow keys shall move the selection, Enter shall activate it and Escape shall close the dialog.                      | T    | P1   | OWN-4  |
| SRS-SRCH-05  | Any type extending `Searchable` shall become searchable by registering one `SearchSource`, without changing the dialog. | I | P1 | OWN-4 |
| SRS-SRCH-06  | Activating a song result shall play the song in the dock.                                                            | T    | P3   | Design |

### 3.7 Music player (PLY)

| ID          | Requirement                                                                                                     | Ver. | Pri. | Source |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-PLY-01  | Each song row shall show index, artwork, title, artist and a Spotify mark; hovering shows a play button; the current song shows an equalizer while playing. | D | P2 | OWN-7 |
| SRS-PLY-02  | Activating a song row shall play that song in the dock; activating the current song shall toggle pause.          | T, D | P1   | OWN-7  |
| SRS-PLY-03  | Only one Spotify embed shall exist at a time; changing songs shall reuse it.                                     | T    | P1   | Design |
| SRS-PLY-04  | Playback shall continue across route changes.                                                                    | D    | P1   | OWN-7  |
| SRS-PLY-05  | Collapsing the player shall hide the embed without stopping playback.                                            | D    | P2   | OWN-7  |
| SRS-PLY-06  | Closing the player shall stop playback and remove the embed.                                                     | T    | P2   | OWN-7  |
| SRS-PLY-07  | If the Spotify iFrame API fails to load, the player shall fall back to a plain Spotify embed iframe.             | T    | P2   | Design |
| SRS-PLY-08  | The Spotify iFrame API script shall load only after the visitor first plays a song.                              | T    | P2   | Privacy |

### 3.8 Chat (CHAT)

| ID           | Requirement                                                                                                     | Ver. | Pri. | Source |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-CHAT-01  | The dock shall show a rounded-square launcher with the owner's avatar and a presence indicator on its top corner that opens and closes the chat panel.        | T    | P1   | OWN-7  |
| SRS-CHAT-02  | The chat panel shall list conversations newest first, allow starting a new one, opening one and deleting one.    | T    | P1   | OWN-7  |
| SRS-CHAT-03  | Conversations shall persist in `localStorage` under `swemre:chat-conversations`.                                 | T    | P1   | OWN-7  |
| SRS-CHAT-04  | A new conversation shall start with a greeting message from the owner.                                           | T    | P2   | OWN-7  |
| SRS-CHAT-05  | The first visitor message shall become the conversation title, truncated to 40 characters with an ellipsis.      | T    | P3   | Design |
| SRS-CHAT-06  | While presence is `offline`, visitor messages shall be stored with delivery `queued` and the panel shall say the owner is offline. | T | P1 | OWN-7 |
| SRS-CHAT-07  | Enter shall send a message; Shift+Enter shall insert a newline; empty messages shall not be sent.                | T    | P2   | Design |
| SRS-CHAT-08  | While the chat panel is open, the player shall collapse.                                                         | T    | P3   | Design |
| SRS-CHAT-09  | When a backend exists, presence shall reflect the owner's real status and messages shall be delivered (`sent`).  | T    | P2   | OWN-7 (future) |

### 3.9 Resume request (RES)

| ID          | Requirement                                                                                             | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-RES-01  | Both "Request my resume" buttons shall open one shared modal with fields full name, email and reason.    | T    | P1   | OWN-3  |
| SRS-RES-02  | Validation shall require full name ≥ 2 characters, a syntactically valid email and reason ≥ 10 characters (trimmed), showing a message per invalid field. | T | P1 | OWN-3 |
| SRS-RES-03  | A valid submission shall be stored through `ContactFormService.submitResumeRequest` and show a confirmation naming the visitor's first name and email. | T | P1 | OWN-3 |
| SRS-RES-04  | The modal shall close with Escape, the close button or a click on the backdrop.                          | T    | P2   | Design |

### 3.10 Theme (THM)

| ID          | Requirement                                                                                                 | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-THM-01  | The site shall support a light and a dark theme, toggled from the navbar.                                     | T    | P1   | OWN-3  |
| SRS-THM-02  | The initial theme shall be the stored choice (`swemre:theme`), otherwise the system preference.               | T    | P1   | Design |
| SRS-THM-03  | The theme shall be applied before first paint, so the page never flashes the wrong theme.                    | I, D | P2   | Design |

### 3.11 Legal pages (LGL)

| ID          | Requirement                                                                                     | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-LGL-01  | Special pages shall be served at `/sp/:slug` from `src/page/sp/<slug>.mdx`.                      | T    | P1   | OWN-3  |
| SRS-LGL-02  | Special pages shall show version, effective date, last-updated date, numbered sections and a contents list. | T | P2 | OWN-3 |
| SRS-LGL-03  | The footer shall link to the privacy policy.                                                     | T    | P1   | OWN-3  |

### 3.12 Feeds and footer (RSS, FTR)

| ID          | Requirement                                                                                       | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-RSS-01  | `public/rss.xml` shall be regenerated from `feedDatabase` before every `dev` and `build`, and during `dev` whenever a file in `src/database/` or `src/config/` changes. | I, T | P2 | OWN-3, OWN-11 |
| SRS-RSS-02  | The feed shall list items newest first with title, link, GUID, publication date, description and categories, plus an `atom:link rel="self"`. | T | P2 | OWN-3, OWN-11 |
| SRS-RSS-03  | The feed shall include articles, projects, songs and free-form notes, each recorded once in the append-only `feedDatabase`. | T | P1 | OWN-11 |
| SRS-RSS-04  | Feed generation shall fail when an article, project or song has no feed entry, a reference does not resolve, an id repeats or a date is not ISO 8601 UTC. | T | P1 | OWN-11 |
| SRS-RSS-05  | `lastBuildDate` shall equal the newest item's date, so regenerating unchanged data produces an identical file. | T | P3 | OWN-11 |
| SRS-RSS-06  | Project skills (`new-article`, `new-project`, `new-song`) shall add the feed entry through the `add-rss-item` skill. | I | P2 | OWN-11 |
| SRS-FTR-01  | The footer shall show icon-only social links on the left and icon-only RSS and privacy links plus the copyright on the right; every icon link shall have an accessible name and a tooltip.  | T    | P1   | OWN-3  |

### 3.13 Sound (SND)

| ID          | Requirement                                                                                     | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-SND-01  | Pressing a button, link or other control with a pointer or the keyboard shall play a short sound; controls with `aria-pressed` shall play distinct on and off sounds. | T, D | P2 | OWN-11 |
| SRS-SND-02  | Typing in a text field shall play a key sound, with distinct sounds for Enter and Backspace/Delete; modifier keys and shortcut combinations shall be silent. | T, D | P2 | OWN-11 |
| SRS-SND-03  | Opening a dialog, cancelling (Escape, Cancel and close buttons, backdrop click), sending a chat message, a form validation error and a successful submission shall each have their own sound. | T, D | P3 | OWN-11 |
| SRS-SND-04  | The dock shall show a small, semi-transparent mute switch next to the chat launcher; when muted, no sound shall play. | T | P1 | OWN-11 |
| SRS-SND-05  | The mute choice shall persist in `localStorage` under `swemre:sound-muted`. | T | P2 | OWN-11 |
| SRS-SND-06  | Sounds shall be synthesized in the browser (no audio downloads), quiet by default, and fail silently when audio is unavailable. | I | P2 | Design |
| SRS-SND-07  | No sound shall play before the visitor's first interaction.                                   | I | P1 | Browser policy |

## 4. Non-functional requirements

### 4.1 Accessibility (A11Y)

| ID           | Requirement                                                                                     | Ver. | Pri. |
| ------------ | ----------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-A11Y-01  | All interactive elements shall be reachable and operable by keyboard.                            | T    | P1   |
| SRS-A11Y-02  | Focus shall be visible on every focusable element (`:focus-visible` ring).                       | I, T | P1   |
| SRS-A11Y-03  | Text and essential UI shall meet WCAG 2.2 AA contrast in both themes.                            | A, T | P1   |
| SRS-A11Y-04  | Icon-only buttons shall have an accessible name.                                                 | I, T | P1   |
| SRS-A11Y-05  | Dialogs shall use the native `<dialog>` element in modal mode, trapping focus and closing on Escape. | I, T | P1 |
| SRS-A11Y-06  | Decorative elements (header band, equalizer) shall be hidden from assistive technology.           | I    | P2   |
| SRS-A11Y-07  | Automated axe checks shall report no serious or critical violations on any route.                 | T    | P2   |

### 4.2 Performance (PERF)

| ID           | Requirement                                                                                 | Ver. | Pri. |
| ------------ | ------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-PERF-01  | Article, project and special-page bodies shall be code-split into separate chunks.           | I    | P1   |
| SRS-PERF-02  | Largest Contentful Paint should be under 2.5 s on a mid-range phone over a 4G profile (Lighthouse). | T | P2 |
| SRS-PERF-03  | Cumulative Layout Shift should stay under 0.1 on every route.                                | T    | P2   |
| SRS-PERF-04  | Search over all registered sources shall return results in under 50 ms for 500 documents.   | A, T | P3   |

### 4.3 Security and privacy (SEC)

| ID          | Requirement                                                                                     | Ver. | Pri. |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-SEC-01  | The site shall set no cookies and include no analytics or tracking scripts.                      | I    | P1   |
| SRS-SEC-02  | Visitor data (interactions, chat, theme, sound preference) shall stay in the visitor's browser until a backend is introduced and documented in the privacy policy. | I | P1 |
| SRS-SEC-03  | External links opened in a new tab shall use `rel="noreferrer noopener"`.                        | I    | P1   |
| SRS-SEC-04  | The bundle shall contain no secrets, tokens or private keys.                                     | I    | P1   |
| SRS-SEC-05  | User-entered text (chat, forms) shall be rendered as text, never as HTML.                        | I, T | P1   |
| SRS-SEC-06  | Corrupt or unexpected `localStorage` content shall not crash the site; it shall fall back to empty state. | T | P1 |

### 4.4 Maintainability and style (MNT)

| ID          | Requirement                                                                                     | Ver. | Pri. |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-MNT-01  | `npm run checkstyle` shall pass with zero errors and warnings.                                   | T    | P1   |
| SRS-MNT-02  | `npm run build` shall pass with zero type errors.                                                | T    | P1   |
| SRS-MNT-03  | All types shall live in `src/types/type.d.ts`, grouped by section dividers.                      | I    | P1   |
| SRS-MNT-04  | TypeScript and JavaScript sources shall contain no statement-terminating semicolons.             | T    | P1   |
| SRS-MNT-05  | Every source file shall carry the license header.                                                | T    | P1   |
| SRS-MNT-06  | Components shall get data only through services (`useService`), never by importing `database/`.  | I    | P1   |
| SRS-MNT-07  | Colours, shadows, radii, fonts, text sizes and layout sizes shall be defined only as tokens in `src/main.css`. | I | P1 |
| SRS-MNT-08  | Comments shall be limited to license headers, format notes, `TODO(...)` markers and non-obvious behaviour. | I | P2 |
| SRS-MNT-09  | Adding an article or project shall require only one metadata entry and one MDX file.             | D    | P1   |

### 4.5 Compatibility and responsiveness (CMP)

| ID          | Requirement                                                                                     | Ver. | Pri. |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-CMP-01  | The site shall work in the last two major versions of Chrome, Edge, Firefox and Safari.          | T    | P1   |
| SRS-CMP-02  | No route shall scroll horizontally at viewport widths from 360 px to 3840 px.                    | T    | P1   |
| SRS-CMP-03  | The site shall remain usable when `localStorage` is unavailable (no persistence, no errors).      | T    | P1   |

## 5. Future requirements (not in this baseline)

| ID          | Requirement                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| SRS-FUT-01  | Resume requests shall be delivered to the owner by email or stored server-side.              |
| SRS-FUT-02  | Chat shall deliver messages to the owner in real time and show real presence (SRS-CHAT-09).  |
| SRS-FUT-03  | Interaction counts (views, likes) may be aggregated server-side across visitors.            |
| SRS-FUT-04  | Pages should be pre-rendered for search engines and link previews (Open Graph tags).        |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft from the implemented baseline and owner requests OWN-1 to OWN-8 | Claude, for swemre review |
| 2026-10-15 | OWN-9 to OWN-11: narrower containers, 75ch reading measure, sound design (SND), feed log and skills (RSS-03 to RSS-06) | Claude, for swemre review |
