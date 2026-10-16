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
**Manual** (demonstrated by hand), **Fail**, **Open** (no verification yet).

Evidence keys: `CS` = `npm run checkstyle` passed, `BLD` = `npm run build`
passed, `SS` = headless Chrome screenshots at 1920×1080 (light and dark)
reviewed on 2026-10-15, `INSP` = inspection of the code on 2026-10-15.

## Functional

| Requirement  | Design (SDD)  | Code                                                         | Test case(s)              | Status (evidence) |
| ------------ | ------------- | ------------------------------------------------------------ | ------------------------- | ----------------- |
| SRS-GEN-01   | §3.1, §9      | `vite.config.ts`, `package.json`                             | TC-MNT-02                 | Pass (BLD)        |
| SRS-GEN-02   | §4.1          | `templates/SiteLayout.tsx`                                   | TC-E2E-01                 | Pass (INSP, SS)   |
| SRS-GEN-03   | §4.2          | `App.tsx` `NotFound`                                         | TC-ART-09                 | Designed          |
| SRS-GEN-04   | §4.1          | `SiteLayout` effect                                          | TC-E2E-01                 | Designed          |
| SRS-GEN-05   | §4.2          | page effects                                                 | TC-ART-08                 | Designed          |
| SRS-LAY-01   | §4.9          | `main.css` `--container-page`, all `max-w-page` users        | TC-E2E-03                 | Pass (SS at 1920); 3440 cap Designed |
| SRS-LAY-02   | §4.9          | `Navbar`, `Footer` `max-w-wide`                              | TC-E2E-03                 | Pass (SS at 1920) |
| SRS-LAY-03   | §4.5          | `DocsLayout` `max-w-reading`                                 | TC-E2E-03                 | Pass (INSP)       |
| SRS-LAY-04   | §4.5          | `components/HeaderBand.tsx`, `--color-band-*`                | TC-E2E-04, TC-MAN-01      | Pass (SS, INSP)   |
| SRS-LAY-05   | §4.5, §4.9    | `--spacing-band`, `h-band`                                   | TC-E2E-04                 | Pass (SS: ≈160 px at 1080 px height) |
| SRS-LAY-06   | §4.9          | all components                                               | TC-MNT-05                 | Pass (INSP, grep for arbitrary px values) |
| SRS-NAV-01   | §4.1          | `components/Navbar.tsx`                                      | TC-E2E-01                 | Pass (SS)         |
| SRS-NAV-02   | §4.1          | `Navbar`                                                     | TC-NAV-01                 | Designed          |
| SRS-NAV-03   | §4.1          | `Navbar`, `SearchButton`, `ThemeSwitch`                      | TC-NAV-01                 | Pass (SS)         |
| SRS-NAV-04   | §4.1          | `Navbar` `data-tone`, `utils/navTone.ts`, `useScrolled`      | TC-E2E-04                 | Pass (SS at scroll 0); scrolled state Designed |
| SRS-NAV-05   | §4.1          | `Navbar` mobile menu                                         | TC-NAV-02                 | Designed          |
| SRS-HOME-01  | §4.5          | `page/home/HomePage.tsx`, `config/site.ts`                   | TC-HOME-01                | Pass (SS)         |
| SRS-HOME-02  | §4.5          | `HomePage`                                                   | TC-HOME-01                | Pass (SS)         |
| SRS-HOME-03  | §4.5          | `HomePage`, `ListBox`, `SongRow`                             | TC-HOME-01                | Pass (SS)         |
| SRS-HOME-04  | §4.5          | `HomeTemplate`, `SiteLayout` `lg:h-dvh`                      | TC-E2E-01                 | Pass (SS at 1920×1080) |
| SRS-ART-01   | §5            | `database/articleDatabase.ts`, `type.d.ts`                   | TC-ART-02                 | Pass (INSP)       |
| SRS-ART-02   | §4.3          | `ArticleService`, `mdxBodies.ts`                             | TC-ART-01                 | Pass (BLD: separate chunks) |
| SRS-ART-03   | §4.3          | `ArticleService.findAll`                                     | TC-ART-01                 | Pass (SS)         |
| SRS-ART-04   | §4.5          | `ArticlesPage`                                               | TC-ART-07                 | Designed          |
| SRS-ART-05   | §4.5          | `ArticlesPage`                                               | TC-ART-07                 | Designed          |
| SRS-ART-06   | §4.5          | `ArticleTemplate`, `DocHeader`, `ArticleActions`             | TC-ART-08                 | Pass (SS)         |
| SRS-ART-07   | §4.5          | `DocsLayout`, `useHeadings`, `useActiveHeading`, `Toc`       | TC-ART-11                 | Pass (SS: TOC rendered); scroll-spy Designed |
| SRS-ART-08   | §4.5          | `ArticlePage`, `PagerLink`                                   | TC-ART-08                 | Designed          |
| SRS-ART-09   | §4.5          | `ArticlePage`, `SidebarNav`                                  | TC-ART-08                 | Pass (SS)         |
| SRS-ART-10   | §6            | `ArticlePage`                                                | TC-ART-09                 | Designed          |
| SRS-ART-11   | §4.4          | `ArticlePage` ref guard, `ArticleInteractionStore`           | TC-ART-04, TC-ART-10      | Designed          |
| SRS-ART-12   | §4.4          | `ArticleInteractionStore`, `useArticleInteraction`           | TC-ART-03, TC-E2E-01      | Designed          |
| SRS-ART-13   | §4.4          | `ArticleInteractionStore.subscribe`                          | TC-ART-05                 | Designed          |
| SRS-ART-14   | §4.10         | `vite.config.ts` Shiki                                       | TC-MAN-01                 | Pass (SS earlier baseline) |
| SRS-PRJ-01   | §5            | `projectDatabase.ts`, `page/projects/*.mdx`                  | TC-PRJ-01                 | Pass (INSP)       |
| SRS-PRJ-02   | §4.3          | `ProjectService.findAll`, `ProjectsPage`                     | TC-PRJ-01                 | Pass (SS)         |
| SRS-PRJ-03   | §4.5          | `ProjectTemplate`, `DocHeader`                               | TC-PRJ-02                 | Pass (SS)         |
| SRS-PRJ-04   | §4.5          | `ProjectPage`                                                | TC-PRJ-02                 | Pass (SS)         |
| SRS-PRJ-05   | §6            | `ProjectPage`                                                | TC-ART-09 (analogue)      | Designed          |
| SRS-PRJ-06   | n/a           | `page/projects/swemre-website.mdx`                           | inspection                | Pass (INSP)       |
| SRS-SRCH-01  | §4.6          | `SearchDialogProvider`, `SearchButton`                       | TC-SRCH-04, TC-SRCH-05    | Designed          |
| SRS-SRCH-02  | §4.6          | `searchSources.ts`                                           | TC-E2E-02                 | Designed          |
| SRS-SRCH-03  | §4.6          | `SearchService.score`                                        | TC-SRCH-01, TC-SRCH-02    | Designed          |
| SRS-SRCH-04  | §4.6          | `SearchDialog`                                               | TC-SRCH-04                | Designed          |
| SRS-SRCH-05  | §4.6          | `SearchService.register`                                     | TC-SRCH-03                | Pass (INSP)       |
| SRS-SRCH-06  | §4.6          | `SearchDialog` `play-song`                                   | TC-SRCH-04 variant        | Designed          |
| SRS-PLY-01   | §4.7          | `SongRow`                                                    | TC-MAN-02                 | Pass (SS, static states) |
| SRS-PLY-02   | §4.7          | `PlayerProvider.toggle`                                      | TC-PLY-01, TC-MAN-02      | Designed          |
| SRS-PLY-03   | §4.7          | `PlayerProvider` controller ref                              | TC-PLY-01                 | Designed          |
| SRS-PLY-04   | §4.7          | `Dock` in `SiteLayout`                                       | TC-E2E-05, TC-MAN-02      | Open              |
| SRS-PLY-05   | §4.7          | `SpotifyPanel` collapse                                      | TC-E2E-05                 | Open              |
| SRS-PLY-06   | §4.7          | `PlayerProvider.close`                                       | TC-PLY-02                 | Designed          |
| SRS-PLY-07   | §4.7, §6      | `SpotifyPanel` fallback                                      | TC-PLY-03, TC-E2E-06      | Designed          |
| SRS-PLY-08   | §4.7, §8      | `spotifyIframeApi.ts`                                        | TC-PLY-01                 | Pass (INSP)       |
| SRS-CHAT-01  | §4.7          | `ChatLauncher`, `OwnerAvatar`                                | TC-CHAT-06                | Pass (SS)         |
| SRS-CHAT-02  | §4.7          | `ChatPanel`, `ChatProvider`                                  | TC-CHAT-06                | Designed          |
| SRS-CHAT-03  | §4.7          | `ChatService`, `LocalStorageService`                         | TC-SVC-02, TC-E2E-07      | Designed          |
| SRS-CHAT-04  | §4.7          | `ChatService.start`                                          | TC-CHAT-01                | Designed          |
| SRS-CHAT-05  | §4.7          | `ChatService.send`                                           | TC-CHAT-03                | Designed          |
| SRS-CHAT-06  | §4.7          | `ChatService.presence`, `ChatPanel`                          | TC-CHAT-02, TC-E2E-07     | Designed          |
| SRS-CHAT-07  | §4.7          | `ChatPanel` `onKeyDown`, `submit`                            | TC-CHAT-07                | Designed          |
| SRS-CHAT-08  | §4.7          | `Dock` `forceCollapsed`                                      | TC-CHAT-06                | Designed          |
| SRS-CHAT-09  | §9 (future)   | `ChatService` `TODO(backend)`                                | future                    | Open (future)     |
| SRS-RES-01   | §4.1          | `ResumeModalProvider`, `ResumeRequestModal`                  | TC-RES-02                 | Designed          |
| SRS-RES-02   | §4.1          | `forms/validateResumeRequest.ts`                             | TC-RES-01, TC-RES-03      | Designed          |
| SRS-RES-03   | §4.3          | `ResumeRequestForm`, `ContactFormService`                    | TC-RES-02                 | Designed          |
| SRS-RES-04   | §4.1          | `Modal` (`<dialog>`)                                         | TC-E2E-10                 | Designed          |
| SRS-THM-01   | §4.8          | `ThemeProvider`, `ThemeSwitch`                               | TC-THM-01                 | Pass (SS both themes) |
| SRS-THM-02   | §4.8          | `ThemeProvider.initialMode`, `index.html`                    | TC-THM-01, TC-THM-02      | Designed          |
| SRS-THM-03   | §4.8          | `index.html` inline script                                   | inspection                | Pass (INSP)       |
| SRS-LGL-01   | §4.2          | `SpecialPage`, `SpecialPageService`                          | TC-LGL-01                 | Pass (SS earlier baseline) |
| SRS-LGL-02   | §4.5          | `CorporateTemplate`                                          | TC-LGL-01                 | Pass (SS earlier baseline) |
| SRS-LGL-03   | §4.1          | `Footer`                                                     | TC-FTR-01                 | Pass (INSP)       |
| SRS-RSS-01   | §4.10         | `package.json` `predev`, `prebuild`, `swemre-rss` plugin     | TC-RSS-01                 | Pass (BLD runs it); dev plugin Designed |
| SRS-RSS-02   | §4.10         | `scripts/generate-rss.mjs`                                   | TC-RSS-01                 | Pass (manual parse) |
| SRS-RSS-03   | §4.10, §5     | `database/feedDatabase.ts`                                   | TC-RSS-01                 | Pass (17 items)   |
| SRS-RSS-04   | §4.10         | `generate-rss.mjs` validation                                | TC-RSS-02                 | Pass (manual fault injection) |
| SRS-RSS-05   | §4.10         | `generate-rss.mjs` `lastBuildDate`                           | TC-RSS-03                 | Pass (INSP)       |
| SRS-RSS-06   | n/a           | `.claude/skills/*`                                           | inspection                | Pass (INSP)       |
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
| SRS-PERF-01  | §7           | `mdxBodies.ts`                             | build output analysis   | Pass (BLD)        |
| SRS-PERF-02  | §7           | whole app                                  | TC-E2E-11               | Designed          |
| SRS-PERF-03  | §7           | whole app                                  | TC-E2E-11               | Designed          |
| SRS-PERF-04  | §4.6         | `SearchService`                            | TC-PERF-01              | Designed          |
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

Reverse trace check: every test case in SWE-DOC-006 cites at least one
requirement; every requirement above cites at least one test or inspection.

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
