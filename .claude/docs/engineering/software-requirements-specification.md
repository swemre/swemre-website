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
the SVD change history). `STD` means a standard from SWE-DOC-000. `UX-Wn`
refers to ticket Wn in `portfolio/WEBSITE-UX-TICKETS.md` (website UX
review, 2026-10-23).

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
| SRS-GEN-03  | An unknown route shall render the shared not-found view (`components/NotFound.tsx`: "404" kicker, "Page not found" heading, a link to `/`) and set the document title to "Page not found · SWEMRE". Article, project and special-page not-found states shall use the same view. While it is shown the head shall hold `<meta name="robots" content="noindex">`, removed when the visitor leaves it. | T    | P2   | OWN-3, UX-W20, PRS-000312 |
| SRS-GEN-04  | On every route change to a new path the window shall scroll to the top. On browser back and forward it shall restore the scroll position the visitor left that history entry at, once the page is tall enough (waiting up to 3 s, stopping on wheel, touch or key input). | T | P2 | OWN-5, PRS-000321 |
| SRS-GEN-05  | Each page with a title shall set `document.title` to `<title> · SWEMRE`; pages without a title (home) shall use `SWEMRE`.                                          | T    | P3   | Design |
| SRS-GEN-06  | Each page shall set the `description` meta tag, `<link rel="canonical">`, the Open Graph tags `og:title`, `og:description`, `og:url` and `og:image`, and `twitter:card`, `twitter:title`, `twitter:description` and `twitter:image`. Canonical and `og:url` shall be `https://swemre.com` + the current path without a trailing slash (`https://swemre.com/` for the home page). Article and project pages shall use their summary and cover (`twitter:card` `summary_large_image`); other pages shall fall back to the site description and the large avatar (`summary`). | T | P2 | UX-W24 |
| SRS-GEN-10  | Link preview tags (runtime and pre-rendered) shall add `og:type` (`article` on articles with `article:published_time` and `article:modified_time`, else `website`), `og:site_name`, and `og:image:width`, `og:image:height`, `og:image:alt` and `twitter:image:alt` when the chosen image has them. The image is the post's `ogImage`, else its cover (articles, projects), else the site settings' `defaultOgImage`, else the 384 px avatar. `twitter:card` shall be `summary_large_image` for every image but the avatar. Tags a page does not set shall be removed when the visitor navigates. | T | P2 | PRS-000314 |
| SRS-GEN-07  | A render error inside a page shall show an error view inside the layout (navbar and footer kept): "Something went wrong", a Reload button and a link to `/`, with the document title "Something went wrong · SWEMRE". Navigating to another route shall clear it. | T | P1 | PRS-000332 |
| SRS-GEN-08  | A render error in the dock (chat or player) shall hide the dock and leave the page usable. Every caught render error shall be written to the browser console. | T | P1 | PRS-000332 |
| SRS-GEN-09  | When a content request fails or times out (SRS-MNT-12), the list pages, the home sections (articles, projects, songs) and the article, project and special pages shall show "Content could not be loaded" with a Retry button that loads again; an empty workspace shall keep its empty states, so the two look different. The search dialog shall skip a source that fails. | T | P1 | PRS-000333 |
| SRS-LAY-07  | Below 640 px the layout shall reserve `--spacing-dock-clear` under the footer and under the home hero stats so the dock never covers content, and the dock shall keep clear of the bottom safe-area inset. | D | P2 | UX-W12 |
| SRS-LAY-08  | Article and project pages shall draw the header band while their content is loading and when it is not found, so the transparent navbar of band routes always sits over a band. | T, D | P1 | UX-W4 |
| SRS-LAY-09  | Sidebar navigation sections without items shall not be rendered; a sidebar whose sections are all empty shall render nothing. | T | P2 | UX-W9 |
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
| SRS-NAV-06  | The open mobile navigation shall close on Escape (returning focus to the menu button), on a pointer press outside the navbar and on every route change. | T | P2 | UX-W16 |

### 3.3 Home (HOME)

| ID          | Requirement                                                                                                         | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-HOME-01 | The home page shall show the owner's avatar, the title "Software Engineer - Emre" and a one-sentence tagline on the primary-tone gradient and grid background. The browser title shall be "SWEMRE" (pages: "<page> · SWEMRE").                 | T    | P1   | OWN-3  |
| SRS-HOME-02 | The home page shall show a "Request a call back" button (opens the call back form) and a "Request my resume" button. No phone number shall be shown or shipped in `siteConfig`. | T, I | P1 | OWN-3, UX-W26 |
| SRS-HOME-03 | The home page shall show three lists side by side (≥ 768 px): articles, projects and songs I liked, at most five items each, each with a link to its index page where one exists. | T | P1 | OWN-3 |
| SRS-HOME-04 | On viewports ≥ 1024 px the home page shall fit in one screen without vertical page scrolling.                        | D    | P2   | OWN-3  |
| SRS-HOME-05 | The hero stats shall show a count only for lists that are still loading (shown as `--`) or hold at least one item; when no count remains, the stats row shall not be rendered. | T | P2 | UX-W6 |
| SRS-HOME-06 | When only one article exists, the featured article card shall span the full width of the articles section from 1024 px, with the cover beside the text. | T, D | P3 | UX-W7 |

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
| SRS-ART-10  | An unknown article slug shall render the not-found view (SRS-GEN-03) below the header band, titled "Article not found", with a link to `/articles`; the document title shall be "Article not found · SWEMRE". | T | P2 | Design, UX-W20 |
| SRS-ART-11  | Opening an article shall increment its view count at most once per browser session (article ids recorded in `sessionStorage` under `swemre:viewed-articles`), including under React StrictMode and on reload; without `sessionStorage` it shall count once per page load. | T | P1 | OWN-1, UX-W21 |
| SRS-ART-12  | Like and save shall toggle per article and persist in `localStorage` under `swemre:article-interactions`.                          | T    | P1   | OWN-1  |
| SRS-ART-13  | Interaction state shall update in all open tabs when changed in one tab.                                                           | T    | P3   | Design |
| SRS-ART-14  | Code blocks shall be syntax-highlighted at build time in both themes.                                                              | I, D | P2   | OWN-4  |
| SRS-ART-15  | When the article has a cover, the article page shall show it at the end of the header block (below the meta row), full column width, with the media alt text and the file's width and height. | T, D | P2 | UX-W5 |
| SRS-ART-16  | Below 1280 px (`xl`), article and project pages with headings shall show a collapsible "On this page" table of contents above the body, closed by default. | T, D | P2 | UX-W11 |
| SRS-ART-17  | Below 1024 px (`lg`), the articles index shall show the topic filter as a horizontally scrolling chip row ("All" plus one chip per tag, with counts) above the list, and shall hide the sidebar. | T, D | P2 | UX-W10 |

### 3.5 Projects (PRJ)

| ID          | Requirement                                                                                                   | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-PRJ-01  | Each project shall have static metadata (`id`, `slug`, `title`, `summary`, `year`, `tags`, optional `url`, `repoUrl`) and an MDX body `src/page/projects/<slug>.mdx`. | I | P1 | OWN-7 |
| SRS-PRJ-02  | The projects index shall list projects as cards, newest year first.                                            | T    | P1   | OWN-3  |
| SRS-PRJ-03  | The project page shall show breadcrumbs, year, tags, title, summary and "Live site" / "Source" buttons when the URLs exist, below the header band. | T | P1 | OWN-7, OWN-8 |
| SRS-PRJ-04  | The project page shall show a sidebar (projects with the current one marked, then articles), a table of contents and previous/next links. | T | P2 | OWN-5, OWN-7 |
| SRS-PRJ-05  | An unknown project slug shall render the not-found view (SRS-GEN-03) below the header band, titled "Project not found", with a link to `/projects`. | T | P2 | Design, UX-W20 |
| SRS-PRJ-06  | One project page shall explain this website and its structure.                                                 | I    | P2   | OWN-8  |
| SRS-PRJ-07  | When the project has a cover, the project page shall show it at the end of the header block, as in SRS-ART-15. | T, D | P2 | UX-W5 |
| SRS-PRJ-08  | When the project list has loaded and is empty, the projects index shall show an empty state ("No projects yet") with a link to `/articles`. | T | P2 | UX-W8 |
| SRS-PRJ-09  | The projects index sidebar shall list articles only (the projects are already the page content); without articles the sidebar shall be omitted. | T, I | P3 | UX-W9 |

### 3.6 Search (SRCH)

| ID           | Requirement                                                                                                         | Ver. | Pri. | Source |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-SRCH-01  | Pressing Ctrl+K or ⌘+K anywhere, or "/" outside a text field, or clicking the navbar trigger shall open the search dialog. | T | P1 | OWN-4 |
| SRS-SRCH-02  | Search shall cover pages, articles, projects, songs and legal pages, grouped by category.                            | T    | P1   | OWN-4  |
| SRS-SRCH-03  | Every query term shall match a result; results shall be ranked title prefix > title word prefix > title substring > tag prefix > summary or keywords. | T | P1 | Design |
| SRS-SRCH-04  | Arrow keys shall move the selection, Enter shall activate it and Escape shall close the dialog.                      | T    | P1   | OWN-4  |
| SRS-SRCH-05  | Any type extending `Searchable` shall become searchable by registering one `SearchSource`, without changing the dialog. | I | P1 | OWN-4 |
| SRS-SRCH-06  | Activating a song result shall play the song in the dock.                                                            | T    | P3   | Design |
| SRS-SRCH-07  | The dialog shall show only results of the current query; while a new query is being searched no earlier results shall be listed or activated by Enter. | T | P1 | UX-W15 |
| SRS-SRCH-08  | An empty query shall list a default set: all pages and the five newest articles, no projects, songs or legal pages. When there is nothing to list the dialog shall say "Nothing to show yet" instead of "No results". | T | P2 | UX-W15 |

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
| SRS-CHAT-02  | The chat panel shall list conversations newest first, allow starting a new one, opening one and deleting one (with confirmation, SRS-CHAT-13). | T | P1 | OWN-7 |
| SRS-CHAT-03  | Conversations shall persist in `localStorage` under `swemre:chat-conversations`.                                 | T    | P1   | OWN-7  |
| SRS-CHAT-04  | A new conversation shall start with a greeting message from the owner.                                           | T    | P2   | OWN-7  |
| SRS-CHAT-05  | The first visitor message shall become the conversation title, truncated to 40 characters with an ellipsis.      | T    | P3   | Design |
| SRS-CHAT-06  | While presence is `offline`, the panel shall say that the owner is offline, that messages are still delivered and that he will reply in the conversation later ("Emre is offline. Your messages are delivered and he will reply here later."). Presence shall not hold messages back. | T | P1 | OWN-7, UX-W13 |
| SRS-CHAT-07  | Enter shall send a message; Shift+Enter shall insert a newline; empty messages shall not be sent.                | T    | P2   | Design |
| SRS-CHAT-08  | While the chat panel is open, the player shall collapse.                                                         | T    | P3   | Design |
| SRS-CHAT-09  | When a backend exists, presence shall reflect the owner's real status and messages shall be delivered (`sent`).  | T    | P2   | OWN-7 (future) |
| SRS-CHAT-10  | A sent visitor message shall appear at once with delivery `sending` (dimmed, "Sending…"), before the API answers, and change to `sent` (check mark) when the API has stored it. | T | P1 | UX-W13 |
| SRS-CHAT-11  | A message the API did not accept (unreachable or refused) shall become `queued`, shown as "Not sent · tap to retry"; activating it (pointer or keyboard) shall retry the conversation's unsent messages. | T | P1 | UX-W13 |
| SRS-CHAT-12  | Unsent messages shall be retried automatically when the conversation's socket (re)connects, when the browser fires `online` and when the chat panel opens. Messages shall be posted one at a time in order, never twice, and a message still `sending` when the page closed shall be `queued` on the next load. | T | P1 | UX-W13 |
| SRS-CHAT-13  | Deleting a conversation shall ask for confirmation in the row ("Delete "<title>"?", Cancel focused, Escape cancels). The delete button shall be visible on hover and keyboard focus, and always on coarse (touch) pointers. | T | P2 | UX-W14 |
| SRS-CHAT-14  | Below 640 px the open chat panel shall be a full-screen sheet that respects the top and bottom safe-area insets, and the page behind it shall not scroll while it is open. | T, D | P2 | UX-W12 |
| SRS-CHAT-15  | When the presence check fails, the chat shall say the server cannot be reached ("not reachable" on the launcher, a banner in the conversation) instead of "offline"; messages stay queued (SRS-CHAT-11). | T | P1 | PRS-000333 |

### 3.9 Resume request (RES)

| ID          | Requirement                                                                                             | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-RES-01  | Both "Request my resume" buttons shall open one shared modal with fields full name, email and reason.    | T    | P1   | OWN-3  |
| SRS-RES-02  | Validation shall require full name ≥ 2 characters, a syntactically valid email and reason ≥ 10 characters (trimmed), showing a message per invalid field. | T | P1 | OWN-3 |
| SRS-RES-03  | A valid submission shall be sent through `ContactFormService.submitResumeRequest` and show a confirmation naming the visitor's first name and email only after the API confirms it; a missing confirmation (404 or empty answer) shall count as a failure. | T | P1 | OWN-3, UX-W1 |
| SRS-RES-04  | The modal shall close with Escape, the close button or a click on the backdrop.                          | T    | P2   | Design |
| SRS-RES-05  | When a resume request fails, the form shall play the error sound, show "The request could not be sent. Please try again later." as an alert and return to an editable state so the visitor can submit again. | T | P1 | UX-W2 |
| SRS-RES-06  | The call back form ("Request a call back": full name, phone, topic) shall follow the same rules: it is sent through `ContactFormService.submitCallbackRequest`, shows its confirmation only after the API confirms the submission, and shows an error otherwise. | T | P1 | UX-W1 |
| SRS-RES-07  | In both forms, editing a field shall clear that field's error, and a submission with invalid fields shall move focus to the first invalid field in form order. | T | P2 | UX-W19 |
| SRS-RES-08  | The dialog header of both forms shall leave room for the close button, so the title and subtitle never run under it. | I, D | P3 | UX-W18 |
| SRS-RES-09  | When a form submission fails without an answer from the server (network error), the form shall say "The server cannot be reached. Check your connection and try again; what you entered is kept." instead of the generic failure. | T | P1 | PRS-000333 |

### 3.10 Theme (THM)

| ID          | Requirement                                                                                                 | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-THM-01  | The site shall support a light and a dark theme, toggled from the navbar.                                     | T    | P1   | OWN-3  |
| SRS-THM-02  | The theme shall be the visitor's explicit choice stored under `swemre:theme`, which is written only when the visitor toggles the theme. Without a stored choice the theme shall follow the system preference (`prefers-color-scheme`), including changes while the page is open. | T | P1 | Design, UX-W17 |
| SRS-THM-03  | The theme shall be applied before first paint, so the page never flashes the wrong theme.                    | I, D | P2   | Design |

### 3.11 Legal pages (LGL)

| ID          | Requirement                                                                                     | Ver. | Pri. | Source |
| ----------- | ----------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-LGL-01  | Special pages shall be served at `/sp/:slug` from `src/page/sp/<slug>.mdx`.                      | T    | P1   | OWN-3  |
| SRS-LGL-02  | Special pages shall show version, effective date, last-updated date, numbered sections and a contents list. | T | P2 | OWN-3 |
| SRS-LGL-03  | The footer shall link to the privacy policy.                                                     | T    | P1   | OWN-3  |
| SRS-LGL-04  | An unknown or unavailable special page shall render the not-found view (SRS-GEN-03) with "This page is not available right now." and the contact email address. | T | P2 | UX-W3 |

### 3.12 Feeds, sitemap, pre-render and footer (RSS, MAP, PRE, FTR)

| ID          | Requirement                                                                                       | Ver. | Pri. | Source |
| ----------- | ------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| SRS-RSS-01  | `public/rss.xml` shall be regenerated from `feedDatabase` before every `dev` and `build`, and during `dev` whenever a file in `src/database/` or `src/config/` changes. | I, T | P2 | OWN-3, OWN-11 |
| SRS-RSS-02  | The feed shall list items newest first with title, link, GUID, publication date, description and categories, plus an `atom:link rel="self"`. | T | P2 | OWN-3, OWN-11 |
| SRS-RSS-03  | The feed shall include articles, projects, songs and free-form notes, each recorded once in the append-only `feedDatabase`. | T | P1 | OWN-11 |
| SRS-RSS-04  | Feed generation shall fail when an article, project or song has no feed entry, a reference does not resolve, an id repeats or a date is not ISO 8601 UTC. | T | P1 | OWN-11 |
| SRS-RSS-05  | `lastBuildDate` shall equal the newest item's date, so regenerating unchanged data produces an identical file. | T | P3 | OWN-11 |
| SRS-RSS-06  | Project skills (`new-article`, `new-project`, `new-song`) shall add the feed entry through the `add-rss-item` skill. | I | P2 | OWN-11 |
| SRS-MAP-01  | `npm run sitemap` shall run before every `dev` and `build` and write `public/sitemap.xml` (sitemaps.org 0.9) listing `/`, `/articles`, `/projects` and every published article, project and special page of the workspace, each published post with `<lastmod>` (date part of `lastUpdatedAt`). A content type the API answers with 404 shall contribute no URLs. | T | P2 | UX-W25 |
| SRS-MAP-02  | When the API cannot be reached, the sitemap script shall keep the existing `public/sitemap.xml` and exit 0, or exit 1 when no sitemap exists yet. | T | P2 | UX-W25 |
| SRS-MAP-03  | `public/robots.txt` shall allow all crawlers and name `https://swemre.com/sitemap.xml`. | I | P2 | UX-W25 |
| SRS-PRE-01  | `npm run build` shall finish with `npm run prerender`, which writes one HTML file per known route (`/` as `dist/index.html`; `/articles`, `/projects` and every published article, project and special page as `dist/<route>/index.html`) whose head holds the SRS-GEN-06 tags of that route with the same values the page sets at runtime, the site settings' default Open Graph image included. Routes and fields shall come from the public API. | T | P2 | PRS-000311 |
| SRS-PRE-02  | `npm run prerender` shall be runnable on its own against an existing `dist/`, produce the same files when run twice on unchanged content, and remove the pages of posts no longer published. Slugs that are not plain slugs (`[a-z0-9-]`) shall be skipped with a warning. | T | P2 | PRS-000311 |
| SRS-PRE-03  | When the API cannot be reached, `npm run prerender` shall warn, change nothing and exit 0, so the build still succeeds. Routes without a pre-rendered file shall keep the SPA fallback. | T | P2 | PRS-000311 |
| SRS-PRE-04  | The production server shall answer a path that is neither a file, a known route nor a pre-rendered page with HTTP 404 and the SPA shell, which renders the not-found view (SRS-GEN-03); `/favicon.ico` shall be a real icon (`public/favicon.ico`), not the HTML page. | T | P2 | PRS-000312 |
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
| SRS-A11Y-02  | Focus shall be visible on every focusable element (`:focus-visible` ring; on the blue bands and the transparent navbar over them the ring takes the band text colour).                       | I, T | P1   |
| SRS-A11Y-03  | Text and essential UI shall meet WCAG 2.2 AA contrast in both themes.                            | A, T | P1   |
| SRS-A11Y-04  | Icon-only buttons shall have an accessible name.                                                 | I, T | P1   |
| SRS-A11Y-05  | Dialogs shall use the native `<dialog>` element in modal mode, trapping focus and closing on Escape. | I, T | P1 |
| SRS-A11Y-06  | Decorative elements (header band, equalizer) shall be hidden from assistive technology.           | I    | P2   |
| SRS-A11Y-07  | Automated axe checks shall report no serious or critical violations on any route.                 | T    | P2   |
| SRS-A11Y-08  | Cover images shall use the media field's `altText` as `alt` (empty `alt` when it has none, as a decorative image) and carry the file's `width` and `height` when the API returns them (UX-W23). | T, I | P2 |
| SRS-A11Y-09  | The first Tab on every page shall reveal a visible "Skip to content" link; activating it shall move focus to the page's `<main>` (PRS-000321). | T | P1 |
| SRS-A11Y-10  | After a client-side change of path (not on first load and not on a query change), focus shall move to the page's `main h1`, or to `<main>` when no heading appears within 3 s, without scrolling, unless the visitor has already moved focus; the new document title shall be announced through a polite live region (PRS-000321). | T | P1 |

### 4.2 Performance (PERF)

| ID           | Requirement                                                                                 | Ver. | Pri. |
| ------------ | ------------------------------------------------------------------------------------------- | ---- | ---- |
| SRS-PERF-01  | Article, project and special-page bodies shall be code-split into separate chunks.           | I    | P1   |
| SRS-PERF-02  | Largest Contentful Paint should be under 2.5 s on a mid-range phone over a 4G profile (Lighthouse). | T | P2 |
| SRS-PERF-03  | Cumulative Layout Shift should stay under 0.1 on every route.                                | T    | P2   |
| SRS-PERF-04  | Search over all registered sources shall return results in under 50 ms for 500 documents.   | A, T | P3   |
| SRS-PERF-05  | The article, project, song and special-page services shall load their list (`findAll`) from the API at most once per page session: concurrent callers share one request, each caller gets its own copy, and an empty or failed result is not kept, so the next call asks again (UX-W22). | T | P2 |

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
| SRS-MNT-10  | Only `services/publicApi.ts` shall build public API paths and request headers; services and build scripts shall use its typed methods. | I | P1 |
| SRS-MNT-11  | The API base, workspace key, channel key, read key, site URL, locale and read timeout shall come from the build's `VITE_*` environment through `config/env.ts`, with the defaults in `config/siteDefaults.ts`; `index.html`, the bundle and the RSS and sitemap scripts shall use the same values. | T | P1 |
| SRS-MNT-12  | A public API read shall fail after the configured timeout (default 10 s) instead of waiting indefinitely. | T | P1 |
| SRS-MNT-13  | With a channel key, articles, projects, songs, pages and site settings shall be read from public API v2 for that channel in the configured locale, with the read key as `X-Read-Key` (only on v2 requests); without one, and for form submissions, chat and page views, the workspace API v1 shall be used. A wrong or missing read key (401) shall fail like any other error. | T | P1 |

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
| SRS-FUT-04  | Page bodies should be pre-rendered for search engines that do not run JavaScript. The head tags are pre-rendered per route since PRS-000311 (SRS-PRE-01); the body is still rendered client-side. |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft from the implemented baseline and owner requests OWN-1 to OWN-8 | Claude, for swemre review |
| 2026-10-15 | OWN-9 to OWN-11: narrower containers, 75ch reading measure, sound design (SND), feed log and skills (RSS-03 to RSS-06) | Claude, for swemre review |
| 2026-10-23 | Website UX fixes (UX-W1 to UX-W26). Changed: GEN-03, GEN-05, HOME-02, ART-10, ART-11, PRJ-05, CHAT-02, CHAT-06, RES-03, THM-02, FUT-04. Added: GEN-06, LAY-07 to LAY-09, NAV-06, HOME-05, HOME-06, ART-15 to ART-17, PRJ-07 to PRJ-09, SRCH-07, SRCH-08, CHAT-10 to CHAT-14, RES-05 to RES-08, LGL-04, MAP-01 to MAP-03, A11Y-08, PERF-05 | Claude, for swemre review |
| 2026-10-23 | PRS-000332: added GEN-07, GEN-08 (error boundaries) | Claude, for swemre review |
| 2026-10-23 | PRS-000321: changed GEN-04 (back/forward restores scroll); added A11Y-09 (skip link) and A11Y-10 (focus and title announcement on route change) | Claude, for swemre review |
| 2026-10-23 | PRS-000311: added PRE-01 to PRE-03; changed GEN-06 (canonical, Twitter title, description and image, no trailing slash), FUT-04 | Claude, for swemre review |
| 2026-10-23 | PRS-000312: GEN-03 noindex on not-found views; added PRE-04 (404 status, favicon.ico) | Claude, for swemre review |
| 2026-10-23 | ADR-017: added MNT-10 to MNT-12 (public API client, site environment, read timeout) | Claude, for swemre review |
| 2026-10-23 | PRS-000443: added MNT-13 (public API v2 by channel key, v1 fallback) | Claude, for swemre review |
| 2026-10-23 | MNT-13: form submissions stay on v1 until v2 serves them | Claude, for swemre review |
| 2026-10-23 | PRS-000314: added GEN-10 (og:type, article times, image size and alt, card rule) | Claude, for swemre review |
| 2026-10-23 | PRS-000333: added GEN-09, CHAT-15, RES-09 (unreachable API) | Claude, for swemre review |
| 2026-10-23 | PRS-000333: CHAT-15 | Claude, for swemre review |
| 2026-10-23 | PRS-000333: RES-09 | Claude, for swemre review |
| 2026-10-24 | PRS-000322: A11Y-02 ring colour on the bands | Claude, for swemre review |
