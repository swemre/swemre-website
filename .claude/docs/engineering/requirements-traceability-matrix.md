# Requirements Traceability Matrix (RTM)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-007                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

Bidirectional trace: owner request → requirement → design → code → test →
status. Status values: **Pass** (verified this baseline, with the evidence
named), **Designed** (test written in SWE-DOC-006, not yet automated),
**Manual** (demonstrated by hand), **Unverified** (implemented and test
designed in SWE-DOC-006, not yet checked), **Fail**, **Open** (no
verification yet). "Manual (Verified in browser 2026-10-23, Wn)" marks UX
fixes the lead checked by hand in a browser (TC-MAN-05); `Wn` is the ticket
in `portfolio/WEBSITE-UX-TICKETS.md`.

Evidence keys: `CS` = `npm run checkstyle` passed, `BLD` = `npm run build`
passed, `SS` = headless Chrome screenshots at 1920×1080 (light and dark)
reviewed on 2026-10-15, `INSP` = inspection of the code on 2026-10-15.

## Functional

| Requirement  | Design (SDD)  | Code                                                         | Test case(s)              | Status (evidence) |
| ------------ | ------------- | ------------------------------------------------------------ | ------------------------- | ----------------- |
| SRS-GEN-01   | §3.1, §9      | `vite.config.ts`, `package.json`                             | TC-MNT-02                 | Pass (BLD)        |
| SRS-GEN-02   | §4.1          | `templates/SiteLayout.tsx`                                   | TC-E2E-01                 | Pass (INSP, SS)   |
| SRS-GEN-03   | §4.1, §4.2    | `components/NotFound.tsx`, `App.tsx`                         | TC-ART-09, TC-MAN-05      | Manual (Verified in browser 2026-10-23: not-found title, W20) |
| SRS-GEN-04   | §4.1          | `hooks/useRouteFocus.ts`                                     | TC-E2E-01, TC-E2E-13      | Manual (Verified in browser 2026-10-23: top on new path, back restores, PRS-000321); async pages Unverified |
| SRS-GEN-05   | §4.8a         | `hooks/useDocumentTitle.ts`, page calls                      | TC-GEN-01, TC-ART-08      | Unverified (format now `· SWEMRE`) |
| SRS-GEN-06   | §4.8a         | `useDocumentTitle`, `utils/documentTags.ts`, `index.html` defaults | TC-GEN-01, TC-MAN-05, TC-PRE-01 | Unverified (canonical and Twitter tags added by PRS-000311; canonical, `og:url` and no duplicates seen in the browser 2026-10-23) |
| SRS-GEN-10   | §4.8a         | `utils/documentTags.ts`, `useDocumentTitle`, `apiClient.shareImage`, `config/site.ts` `defaultShareImage`, `prerender.mjs` | TC-GEN-04 | Manual (Verified 2026-10-23: pre-rendered article file and runtime tags in the browser, removal on navigation) |
| SRS-GEN-07   | §4.1, §6      | `components/ErrorBoundary.tsx`, `components/ErrorPage.tsx`, `SiteLayout` | TC-GEN-02 | Manual (Verified in browser 2026-10-23, forced render error) |
| SRS-GEN-08   | §4.1, §6      | `components/ErrorBoundary.tsx`, `SiteLayout`                 | TC-GEN-02                 | Manual (Verified in browser 2026-10-23, forced render error in the chat launcher) |
| SRS-LAY-01   | §4.9          | `main.css` `--container-page`, all `max-w-page` users        | TC-E2E-03                 | Pass (SS at 1920); 3440 cap Designed |
| SRS-LAY-02   | §4.9          | `Navbar`, `Footer` `max-w-wide`                              | TC-E2E-03                 | Pass (SS at 1920) |
| SRS-LAY-03   | §4.5          | `DocsLayout` `max-w-reading`                                 | TC-E2E-03                 | Pass (INSP)       |
| SRS-LAY-04   | §4.5          | `components/HeaderBand.tsx`, `--color-band-*`                | TC-E2E-04, TC-MAN-01      | Pass (SS, INSP)   |
| SRS-LAY-05   | §4.5, §4.9    | `--spacing-band`, `h-band`                                   | TC-E2E-04                 | Pass (SS: ≈160 px at 1080 px height) |
| SRS-LAY-06   | §4.9          | all components                                               | TC-MNT-05                 | Pass (INSP, grep for arbitrary px values) |
| SRS-LAY-07   | §4.7          | `Dock` spacer, `HomeTemplate`, `--spacing-dock-clear`, `--spacing-safe-bottom` | TC-E2E-12                 | Unverified (W12) |
| SRS-LAY-08   | §4.2          | `ArticlePage`, `ProjectPage`, `NotFound band`                | TC-ART-12, TC-MAN-05      | Manual (Verified in browser 2026-10-23: band on not-found, W4); loading state Unverified |
| SRS-LAY-09   | §4.5          | `SidebarNav`                                                 | TC-PRJ-04, TC-MAN-05      | Manual (Verified in browser 2026-10-23, W9) |
| SRS-NAV-01   | §4.1          | `components/Navbar.tsx`                                      | TC-E2E-01                 | Pass (SS)         |
| SRS-NAV-02   | §4.1          | `Navbar`                                                     | TC-NAV-01                 | Designed          |
| SRS-NAV-03   | §4.1          | `Navbar`, `SearchButton`, `ThemeSwitch`                      | TC-NAV-01                 | Pass (SS)         |
| SRS-NAV-04   | §4.1          | `Navbar` `data-tone`, `utils/navTone.ts`, `useScrolled`      | TC-E2E-04                 | Pass (SS at scroll 0); scrolled state Designed |
| SRS-NAV-05   | §4.1          | `Navbar` mobile menu                                         | TC-NAV-02                 | Designed          |
| SRS-NAV-06   | §4.1          | `Navbar` menu listeners, route reset                         | TC-NAV-03                 | Unverified (W16) |
| SRS-HOME-01  | §4.5          | `page/home/HomePage.tsx`, `config/site.ts`                   | TC-HOME-01                | Pass (SS)         |
| SRS-HOME-02  | §4.5          | `HomePage`, `config/site.ts`                                 | TC-HOME-01                | Pass (INSP 2026-10-23: no phone fields in `siteConfig`, no `tel:` link in `src/`, W26); call back button Unverified |
| SRS-HOME-03  | §4.5          | `HomePage`, `ListBox`, `SongRow`                             | TC-HOME-01                | Pass (SS)         |
| SRS-HOME-04  | §4.5          | `HomeTemplate`, `SiteLayout` `lg:h-dvh`                      | TC-E2E-01                 | Pass (SS at 1920×1080) |
| SRS-HOME-05  | §10           | `HomePage` stats filter                                      | TC-HOME-02, TC-MAN-05     | Manual (Verified in browser 2026-10-23, W6) |
| SRS-HOME-06  | §10           | `components/home/ArticleShowcase.tsx` `wide`                 | TC-HOME-03, TC-MAN-05     | Manual (Verified in browser 2026-10-23, W7) |
| SRS-ART-01   | §5            | `database/articleDatabase.ts`, `type.d.ts`                   | TC-ART-02                 | Pass (INSP)       |
| SRS-ART-02   | §4.3          | `ArticleService`, `mdxBodies.ts`                             | TC-ART-01                 | Pass (BLD: separate chunks) |
| SRS-ART-03   | §4.3          | `ArticleService.findAll`                                     | TC-ART-01                 | Pass (SS)         |
| SRS-ART-04   | §4.5          | `ArticlesPage`                                               | TC-ART-07                 | Designed          |
| SRS-ART-05   | §4.5          | `ArticlesPage`                                               | TC-ART-07                 | Designed          |
| SRS-ART-06   | §4.5          | `ArticleTemplate`, `DocHeader`, `ArticleActions`             | TC-ART-08                 | Pass (SS)         |
| SRS-ART-07   | §4.5          | `DocsLayout`, `useHeadings`, `useActiveHeading`, `Toc`       | TC-ART-11                 | Pass (SS: TOC rendered); scroll-spy Designed |
| SRS-ART-08   | §4.5          | `ArticlePage`, `PagerLink`                                   | TC-ART-08                 | Designed          |
| SRS-ART-09   | §4.5          | `ArticlePage`, `SidebarNav`                                  | TC-ART-08                 | Pass (SS)         |
| SRS-ART-10   | §4.2, §6      | `ArticlePage`, `NotFound`                                    | TC-ART-09                 | Unverified (W20; band part under SRS-LAY-08) |
| SRS-ART-11   | §4.4          | `ArticleInteractionStore.registerView` (session guard), `ArticlePage` | TC-ART-04, TC-ART-10      | Unverified (W21) |
| SRS-ART-12   | §4.4          | `ArticleInteractionStore`, `useArticleInteraction`           | TC-ART-03, TC-E2E-01      | Designed          |
| SRS-ART-13   | §4.4          | `ArticleInteractionStore.subscribe`                          | TC-ART-05                 | Designed          |
| SRS-ART-14   | §4.10         | `vite.config.ts` Shiki                                       | TC-MAN-01                 | Pass (SS earlier baseline) |
| SRS-ART-15   | §4.5          | `DocHeader` `cover`, `ArticleTemplate`                       | TC-ART-13, TC-MAN-05      | Manual (Verified in browser 2026-10-23, W5) |
| SRS-ART-16   | §4.5          | `DocsLayout` `<details>`, `Toc showTitle`                    | TC-ART-14, TC-MAN-05      | Manual (Verified in browser 2026-10-23, W11) |
| SRS-ART-17   | §4.5          | `ArticlesPage` chips, `ListTemplate sidebarFromLg`           | TC-ART-15                 | Unverified (W10) |
| SRS-PRJ-01   | §5            | `projectDatabase.ts`, `page/projects/*.mdx`                  | TC-PRJ-01                 | Pass (INSP)       |
| SRS-PRJ-02   | §4.3          | `ProjectService.findAll`, `ProjectsPage`                     | TC-PRJ-01                 | Pass (SS)         |
| SRS-PRJ-03   | §4.5          | `ProjectTemplate`, `DocHeader`                               | TC-PRJ-02                 | Pass (SS)         |
| SRS-PRJ-04   | §4.5          | `ProjectPage`                                                | TC-PRJ-02                 | Pass (SS)         |
| SRS-PRJ-05   | §4.2, §6      | `ProjectPage`, `NotFound`                                    | TC-ART-09                 | Unverified (W20) |
| SRS-PRJ-06   | n/a           | `page/projects/swemre-website.mdx`                           | inspection                | Pass (INSP)       |
| SRS-PRJ-07   | §4.5          | `DocHeader` `cover`, `ProjectTemplate`                       | TC-ART-13                 | Unverified (W5 checked on the article page only) |
| SRS-PRJ-08   | §10           | `ProjectsPage` empty state                                   | TC-PRJ-03, TC-MAN-05      | Manual (Verified in browser 2026-10-23, W8) |
| SRS-PRJ-09   | §4.5          | `ProjectsPage` sidebar                                       | TC-PRJ-04                 | Unverified (W9) |
| SRS-SRCH-01  | §4.6          | `SearchDialogProvider`, `SearchButton`                       | TC-SRCH-04, TC-SRCH-05    | Designed          |
| SRS-SRCH-02  | §4.6          | `searchSources.ts`                                           | TC-E2E-02                 | Designed          |
| SRS-SRCH-03  | §4.6          | `SearchService.score`                                        | TC-SRCH-01, TC-SRCH-02    | Designed          |
| SRS-SRCH-04  | §4.6          | `SearchDialog`                                               | TC-SRCH-04                | Designed          |
| SRS-SRCH-05  | §4.6          | `SearchService.register`                                     | TC-SRCH-03                | Pass (INSP)       |
| SRS-SRCH-06  | §4.6          | `SearchDialog` `play-song`                                   | TC-SRCH-04 variant        | Designed          |
| SRS-SRCH-07  | §4.6          | `hooks/useSearchResults.ts`                                  | TC-SRCH-07                | Unverified (W15) |
| SRS-SRCH-08  | §4.6          | `SearchService` `featured`, `searchSources.ts`, `SearchDialog` | TC-SRCH-06                | Unverified (W15) |
| SRS-PLY-01   | §4.7          | `SongRow`                                                    | TC-MAN-02                 | Pass (SS, static states) |
| SRS-PLY-02   | §4.7          | `PlayerProvider.toggle`                                      | TC-PLY-01, TC-MAN-02      | Designed          |
| SRS-PLY-03   | §4.7          | `PlayerProvider` controller ref                              | TC-PLY-01                 | Designed          |
| SRS-PLY-04   | §4.7          | `Dock` in `SiteLayout`                                       | TC-E2E-05, TC-MAN-02      | Open              |
| SRS-PLY-05   | §4.7          | `SpotifyPanel` collapse                                      | TC-E2E-05                 | Open              |
| SRS-PLY-06   | §4.7          | `PlayerProvider.close`                                       | TC-PLY-02                 | Designed          |
| SRS-PLY-07   | §4.7, §6      | `SpotifyPanel` fallback                                      | TC-PLY-03, TC-E2E-06      | Designed          |
| SRS-PLY-08   | §4.7, §8      | `spotifyIframeApi.ts`                                        | TC-PLY-01                 | Pass (INSP)       |
| SRS-CHAT-01  | §4.7          | `ChatLauncher`, `OwnerAvatar`                                | TC-CHAT-06                | Pass (SS)         |
| SRS-CHAT-02  | §4.7          | `ChatPanel` (`ConversationRow` confirmation), `ChatProvider` | TC-CHAT-06, TC-CHAT-11    | Designed |
| SRS-CHAT-03  | §4.7          | `ChatService`, `LocalStorageService`                         | TC-SVC-02, TC-E2E-07      | Designed          |
| SRS-CHAT-04  | §4.7          | `ChatService.start`                                          | TC-CHAT-01                | Designed          |
| SRS-CHAT-05  | §4.7          | `ChatService.send`                                           | TC-CHAT-03                | Designed          |
| SRS-CHAT-06  | §4.7          | `ChatPanel` offline banner                                   | TC-CHAT-09                | Unverified (W13) |
| SRS-CHAT-07  | §4.7          | `ChatPanel` `onKeyDown`, `submit`                            | TC-CHAT-07                | Designed          |
| SRS-CHAT-08  | §4.7          | `Dock` `forceCollapsed`                                      | TC-CHAT-06                | Designed          |
| SRS-CHAT-09  | §9 (future)   | `ChatService` `TODO(backend)`                                | future                    | Open (future)     |
| SRS-CHAT-10  | §4.7          | `ChatService.enqueue`, `deliver`, `ChatPanel` bubble         | TC-CHAT-02, TC-CHAT-08, TC-CHAT-09 | Unverified (W13) |
| SRS-CHAT-11  | §4.7          | `ChatService.flush`, `ChatProvider.retry`, `ChatPanel`       | TC-CHAT-08, TC-CHAT-09    | Unverified (W13) |
| SRS-CHAT-12  | §4.7          | `ChatProvider` (`online`, `connected`, `open`), `ChatService` constructor, `deliver` chain | TC-CHAT-08, TC-CHAT-10, TC-E2E-07 | Unverified (W13) |
| SRS-CHAT-13  | §4.7          | `ConversationRow`                                            | TC-CHAT-11                | Unverified (W14) |
| SRS-CHAT-14  | §4.7          | `ChatPanel` `max-sm:` sheet, `Dock` `usePhoneScrollLock`     | TC-E2E-12                 | Unverified (W12) |
| SRS-RES-01   | §4.1          | `ResumeModalProvider`, `ResumeRequestModal`                  | TC-RES-02                 | Designed          |
| SRS-RES-02   | §4.1          | `forms/validateResumeRequest.ts`                             | TC-RES-01, TC-RES-03      | Designed          |
| SRS-RES-03   | §4.3          | `ResumeRequestForm`, `ContactFormService.submitForm`         | TC-RES-02, TC-SVC-04      | Unverified (W1, resume path) |
| SRS-RES-04   | §4.1          | `Modal` (`<dialog>`)                                         | TC-E2E-10                 | Designed          |
| SRS-RES-05   | §4.3, §6      | `ResumeRequestForm` `failed` state                           | TC-RES-04                 | Unverified (W2) |
| SRS-RES-06   | §4.3, §6      | `CallbackRequestForm`, `ContactFormService.submitForm`       | TC-RES-05, TC-SVC-04, TC-MAN-05 | Manual (Verified in browser 2026-10-23: call back error shown, W1) |
| SRS-RES-07   | §10           | `ResumeRequestForm`, `CallbackRequestForm` `onChange`, `onSubmit` | TC-RES-06, TC-MAN-05      | Manual (Verified in browser 2026-10-23: focus to first invalid field, W19); error clearing on edit Unverified |
| SRS-RES-08   | §10           | form headers `pr-14`                                         | TC-RES-07, TC-MAN-05      | Manual (Verified in browser 2026-10-23: header room, W18) |
| SRS-THM-01   | §4.8          | `ThemeProvider`, `ThemeSwitch`                               | TC-THM-01                 | Pass (SS both themes) |
| SRS-THM-02   | §4.8          | `ThemeProvider` (`chosen ?? system`), `index.html`           | TC-THM-01 to TC-THM-03    | Unverified (W17) |
| SRS-THM-03   | §4.8          | `index.html` inline script                                   | inspection                | Pass (INSP)       |
| SRS-LGL-01   | §4.2          | `SpecialPage`, `SpecialPageService`                          | TC-LGL-01                 | Pass (SS earlier baseline) |
| SRS-LGL-02   | §4.5          | `CorporateTemplate`                                          | TC-LGL-01                 | Pass (SS earlier baseline) |
| SRS-LGL-03   | §4.1          | `Footer`                                                     | TC-FTR-01                 | Pass (INSP)       |
| SRS-LGL-04   | §4.2, §6      | `SpecialPage`, `NotFound contact`                            | TC-LGL-02                 | Unverified (W3) |
| SRS-RSS-01   | §4.10         | `package.json` `predev`, `prebuild`, `swemre-rss` plugin     | TC-RSS-01                 | Pass (BLD runs it); dev plugin Designed |
| SRS-RSS-02   | §4.10         | `scripts/generate-rss.mjs`                                   | TC-RSS-01                 | Pass (manual parse) |
| SRS-RSS-03   | §4.10, §5     | `database/feedDatabase.ts`                                   | TC-RSS-01                 | Pass (17 items)   |
| SRS-RSS-04   | §4.10         | `generate-rss.mjs` validation                                | TC-RSS-02                 | Pass (manual fault injection) |
| SRS-RSS-05   | §4.10         | `generate-rss.mjs` `lastBuildDate`                           | TC-RSS-03                 | Pass (INSP)       |
| SRS-RSS-06   | n/a           | `.claude/skills/*`                                           | inspection                | Pass (INSP)       |
| SRS-MAP-01   | §4.10         | `scripts/generate-sitemap.mjs`, `package.json` `sitemap`, `predev`, `prebuild` | TC-MAP-01                 | Unverified (W25) |
| SRS-MAP-02   | §4.10, §6     | `generate-sitemap.mjs` offline branch                        | TC-MAP-01                 | Unverified (W25) |
| SRS-MAP-03   | §4.10         | `public/robots.txt`                                          | TC-MAP-02                 | Pass (INSP 2026-10-23, W25) |
| SRS-PRE-01   | §4.10a        | `scripts/prerender.mjs`, `utils/documentTags.ts`, `package.json` `postbuild` | TC-PRE-01 a, d, f | Manual (a, d 2026-10-23); runtime equality f Unverified |
| SRS-PRE-02   | §4.10a        | `prerender.mjs` `removeDetailPages`, `shellParts`, slug check | TC-PRE-01 b, c, g         | Manual (b, c 2026-10-23); g Designed |
| SRS-PRE-03   | §4.10a, §6    | `prerender.mjs` offline branch, `swemre-prerendered-routes`  | TC-PRE-01 d, e            | Manual (2026-10-23); production serving Unverified (deploy change) |
| SRS-SND-01   | §4.7a         | `SoundProvider` pointer/key classification                   | TC-SND-01, TC-MAN-04      | Designed          |
| SRS-SND-02   | §4.7a         | `SoundProvider` `soundForKey`                                | TC-SND-01, TC-MAN-04      | Designed          |
| SRS-SND-03   | §4.7a         | `Modal`, `ChatPanel`, `ResumeRequestForm`                    | TC-SND-03                 | Designed          |
| SRS-SND-04   | §4.7a         | `SoundToggle`, `Dock`, `soundEngine.setMuted`                | TC-SND-02                 | Designed          |
| SRS-SND-05   | §4.7a, §5     | `SoundProvider` storage                                      | TC-SND-02                 | Designed          |
| SRS-SND-06   | §4.7a         | `services/soundEngine.ts`                                    | TC-SND-04, inspection     | Pass (INSP)       |
| SRS-SND-07   | §4.7a         | lazy `AudioContext` on first gesture                         | inspection                | Pass (INSP)       |
| SRS-FTR-01   | §4.1          | `Footer`                                                     | TC-FTR-01                 | Pass (INSP)       |

## Non-functional

| Requirement  | Design (SDD) | Code / config                              | Test case(s)            | Status (evidence) |
| ------------ | ------------ | ------------------------------------------ | ----------------------- | ----------------- |
| SRS-A11Y-01  | §8           | all interactive components                 | TC-E2E-10               | Designed          |
| SRS-A11Y-02  | §4.9         | `main.css` `:focus-visible`                | TC-E2E-10               | Pass (INSP)       |
| SRS-A11Y-03  | §4.9         | colour tokens                              | TC-MAN-03               | **Fail** (fg-subtle on canvas, dark: 2.90:1), RSK-09 |
| SRS-A11Y-04  | §8           | `aria-label` on icon buttons               | TC-E2E-09               | Pass (INSP)       |
| SRS-A11Y-05  | §8           | `components/Modal.tsx`                     | TC-E2E-10               | Pass (INSP)       |
| SRS-A11Y-06  | §4.5         | `HeaderBand` `aria-hidden`                 | TC-E2E-04               | Pass (INSP)       |
| SRS-A11Y-07  | §8           | all routes                                 | TC-E2E-09               | Designed          |
| SRS-A11Y-08  | §4.3         | `fieldMediaAlt`, `fieldMediaSize`, `CoverImage`, `DocHeader` | TC-ART-13               | Unverified (W23) |
| SRS-A11Y-09  | §4.1         | `components/SkipLink.tsx`                  | TC-E2E-13               | Manual (Verified in browser 2026-10-23, PRS-000321) |
| SRS-A11Y-10  | §4.1         | `hooks/useRouteFocus.ts`, `SkipLink` live region | TC-E2E-13         | Manual (Verified in browser 2026-10-23 on static pages, PRS-000321); late article/project headings and screen-reader output Unverified |
| SRS-PERF-01  | §7           | `mdxBodies.ts`                             | build output analysis   | Pass (BLD)        |
| SRS-PERF-02  | §7           | whole app                                  | TC-E2E-11               | Designed          |
| SRS-PERF-03  | §7           | whole app                                  | TC-E2E-11               | Designed          |
| SRS-PERF-04  | §4.6         | `SearchService`                            | TC-PERF-01              | Designed          |
| SRS-PERF-05  | §4.3         | `ArrayService` `cacheList`, list services  | TC-SVC-03               | Unverified (W22) |
| SRS-SEC-01   | §8           | `index.html`, no analytics deps            | inspection              | Pass (INSP)       |
| SRS-SEC-02   | §8           | storage keys, privacy policy v1.1          | inspection              | Pass (INSP)       |
| SRS-SEC-03   | §8           | external links                             | TC-SEC-01               | Pass (INSP)       |
| SRS-SEC-04   | §8           | repository                                 | inspection              | Pass (INSP)       |
| SRS-SEC-05   | §8           | React text rendering                       | TC-SEC-02               | Pass (INSP)       |
| SRS-SEC-06   | §6           | stores, `LocalStorageService`              | TC-ART-06, TC-SVC-02    | Designed          |
| SRS-MNT-01   | SMP §6       | `eslint.config.js`, `.prettierrc.json`     | TC-MNT-01               | Pass (CS)         |
| SRS-MNT-02   | SMP §6       | `tsconfig*.json`                           | TC-MNT-02               | Pass (BLD)        |
| SRS-MNT-03   | §3.3         | `src/types/type.d.ts`                      | TC-MNT-03               | Pass              |
| SRS-MNT-04   | coding std   | ESLint `semi: never`                       | TC-MNT-01               | Pass (CS)         |
| SRS-MNT-05   | licensing    | `scripts/license-headers.mjs`              | TC-MNT-01               | Pass (CS)         |
| SRS-MNT-06   | §3.3         | pages, components                          | TC-MNT-04               | Pass (INSP)       |
| SRS-MNT-07   | §4.9         | `main.css`                                 | TC-MNT-05               | Pass (INSP)       |
| SRS-MNT-08   | coding std   | repository                                 | inspection              | Pass (INSP)       |
| SRS-MNT-09   | §4.3         | services + glob                            | demonstration           | Pass (four articles and two projects added this baseline with one entry + one MDX each) |
| SRS-MNT-10   | §4.3         | `services/publicApi.ts`, services, `scripts/generate-*.mjs` | inspection, TC-API-01 | Manual (Verified 2026-10-23: same request URLs in the browser, chat send works; RSS and sitemap output unchanged) |
| SRS-MNT-11   | §4.3         | `config/env.ts`, `config/siteDefaults.ts`, `vite.config.ts`, `index.html` | TC-API-02 | Manual (Verified 2026-10-23: build with `VITE_SITE_URL` and `VITE_LOCALE` set) |
| SRS-MNT-12   | §4.3         | `services/publicApi.ts`                    | TC-API-03               | Manual (Verified 2026-10-23 with a local mock server: 200 ms timeout rejected after 212 ms) |
| SRS-MNT-13   | §4.3         | `services/publicApi.ts`                    | TC-API-04               | Manual (Verified 2026-10-23 against a local mock serving the bodies of docs/public-api-v2.md; not yet against the API's v2 endpoints) |
| SRS-CMP-01   | n/a          | whole app                                  | L4 suite (3 engines)    | Open              |
| SRS-CMP-02   | §4.9         | layout tokens                              | TC-E2E-03               | Pass (SS at 1920); other widths Designed |
| SRS-CMP-03   | §6           | stores, theme                              | TC-E2E-08               | Designed          |

## Coverage summary (2026-10-15)

| Status   | Count |
| -------- | ----- |
| Pass     | 65    |
| Designed | 46    |
| Open     | 4     |
| Fail     | 1 (SRS-A11Y-03) |
| Total    | 116 (all SRS requirements except the future SRS-FUT-*) |

"Pass" counts partial passes where the row names a remaining Designed part.

## Coverage summary (2026-10-23, after the UX fixes)

Derived from the 2026-10-15 summary: 30 requirements added, 10 changed
(GEN-03, GEN-05, HOME-02, ART-10, ART-11, PRJ-05, CHAT-02, CHAT-06, RES-03,
THM-02). A changed requirement loses an earlier Designed status and is
`Unverified` until checked again.

| Status   | Count |
| -------- | ----- |
| Pass     | 66 (adds SRS-MAP-03 by inspection; HOME-02 partial) |
| Designed | 38    |
| Manual   | 12 (Verified in browser 2026-10-23: GEN-03, GEN-06, LAY-08, LAY-09, HOME-05, HOME-06, ART-15, ART-16, PRJ-08, RES-06, RES-07, RES-08) |
| Unverified | 25  |
| Open     | 4     |
| Fail     | 1 (SRS-A11Y-03) |
| Total    | 146 (all SRS requirements except the future SRS-FUT-*) |

"Manual" counts partial checks where the row names a remaining Unverified
part (LAY-08 loading state, RES-07 error clearing).

## Coverage update (2026-10-23, PRS-000321)

SRS-GEN-04 changed (Designed → Manual, partial); SRS-A11Y-09 and A11Y-10
added (Manual, A11Y-10 partial). Totals: Designed 37, Manual 15, total 148;
other rows unchanged.

Reverse trace check: every test case in SWE-DOC-006 cites at least one
requirement; every requirement above cites at least one test or inspection.

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
| 2026-10-23 | UX fixes W1 to W26: rows for the new and changed requirements, `Unverified` status, browser check of 2026-10-23, second coverage summary | Claude, for swemre review |
| 2026-10-23 | PRS-000332: rows for GEN-07, GEN-08 | Claude, for swemre review |
| 2026-10-23 | PRS-000321: GEN-04 row changed, A11Y-09 and A11Y-10 added, coverage update | Claude, for swemre review |
| 2026-10-23 | PRS-000311: rows SRS-PRE-01 to PRE-03, SRS-GEN-06 back to Unverified for the new tags | Claude, for swemre review |
| 2026-10-23 | ADR-017: rows for MNT-10 to MNT-12 | Claude, for swemre review |
| 2026-10-23 | PRS-000443: MNT-12 verified, row for MNT-13 | Claude, for swemre review |
| 2026-10-23 | MNT-13 status after the v2 contract | Claude, for swemre review |
| 2026-10-23 | PRS-000314: GEN-10 row | Claude, for swemre review |
