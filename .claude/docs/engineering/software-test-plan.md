# Software Test Plan (STP)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-005                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Scope

This plan defines how swemre-website is verified against SWE-DOC-002 (SRS):
test levels, environments, tools, entry and exit criteria, and how results
are recorded. Individual test designs and procedures are in SWE-DOC-006.

### 1.1 Current state (be honest)

| Activity                                  | State at this baseline                             |
| ----------------------------------------- | -------------------------------------------------- |
| Static analysis (ESLint + gts, type-aware) | **Automated**, runs in `npm run checkstyle`         |
| Formatting and license header checks      | **Automated**, `npm run checkstyle`                 |
| Type checking                             | **Automated**, `npm run build` (`tsc -b`) plus the manual `.d.ts` check |
| Build                                     | **Automated**, `npm run build`                      |
| Unit and component tests                  | **Not implemented**; designed in SWE-DOC-006, milestone M5 |
| End-to-end tests                          | **Not implemented**; designed in SWE-DOC-006, milestone M5 |
| Accessibility and performance audits      | **Not implemented**; designed, milestone M5         |
| Visual checks                             | **Manual**, headless Chrome screenshots at set viewports |

## 2. Test strategy

### 2.1 Test levels

```text
          ▲ fewer, slower, broader
          │   L5  Manual exploratory and demonstration (owner)
          │   L4  End-to-end (Playwright, real browser, production build)
          │   L3  Component integration (Vitest + Testing Library, jsdom)
          │   L2  Unit (Vitest: services, stores, validation, utils)
          │   L1  Static (tsc, ESLint gts, Prettier, license headers)
          ▼ more, faster, narrower
```

| Level | Target                                    | Tooling (planned versions pinned in M5)              | Runs                       |
| ----- | ----------------------------------------- | ---------------------------------------------------- | -------------------------- |
| L1    | Whole repository                          | `tsc`, ESLint 9 + gts 7, Prettier 3, license script   | Every change, CI           |
| L2    | `services/`, `forms/`, `utils/`, stores   | Vitest, fake `localStorage` (jsdom)                   | Every change, CI           |
| L3    | Components, hooks, providers, templates   | Vitest + `@testing-library/react` + `user-event`, injected `ServiceProvider` | Every change, CI |
| L4    | Routes and journeys in Chromium, Firefox, WebKit | Playwright against `vite preview`; `@axe-core/playwright` | CI on `main` and PRs |
| L5    | Look and feel, Spotify playback, chat UX  | Owner in real browsers                                | Each release               |

### 2.2 Verification methods

Each SRS requirement has a method (T, A, I, D). This plan covers **T** and
**D**; **I** is covered by the review checklists in SWE-DOC-008, and **A** by
the analyses listed in §7.

### 2.3 Test design techniques

- **Equivalence partitioning and boundary values** for validation (name
  length 1/2, reason 9/10 characters, chat title 40/41 characters).
- **State transition testing** for the player (SDD §4.7), the chat
  conversation lifecycle and chat message delivery (`sending` → `sent` or
  `queued`, `queued` → `sending` on retry; TC-CHAT-08 to TC-CHAT-10).
- **Decision tables** for search scoring.
- **Error guessing / fault injection** for storage (throws, invalid JSON,
  wrong shape) and the Spotify script (blocked).
- **Pairwise viewport × theme** for visual checks: widths 360, 768, 1024,
  1440, 1920, 2560, 3440 × light, dark.

### 2.4 Test doubles

| Dependency           | Double                                                         |
| -------------------- | -------------------------------------------------------------- |
| Services             | Fake `ServiceMap` through `ServiceProvider services={...}`     |
| `localStorage`, `sessionStorage` | jsdom storage; a throwing stub for fault cases       |
| swemre-website-api   | `fetch` stub per case (L2/L3); a local stub HTTP server for the sitemap script (TC-MAP-01); Playwright route abort for offline chat (L4) |
| Chat socket          | Fake `WebSocket` whose `onopen` and `onmessage` the test fires   |
| Connectivity         | Dispatched window `online` event; Playwright `context.setOffline` |
| Spotify iFrame API   | Stub on `window.onSpotifyIframeApiReady` with a fake controller (L3); network route block (L4 fallback test) |
| Time                 | Vitest fake timers for `sentAt`, `createdAt`                    |
| `crypto.randomUUID`  | Spy returning deterministic ids                                 |
| `IntersectionObserver`, `matchMedia` | Minimal polyfills in the test setup; `matchMedia` with a controllable `change` event for the theme (TC-THM-03), phone scroll lock and `pointer: coarse` |

## 3. Test items

All modules under `src/`, `scripts/generate-rss.mjs`,
`scripts/generate-sitemap.mjs`, `scripts/license-headers.mjs`, `index.html`
inline script, `public/robots.txt` and `src/main.css` tokens.

### 3.0 Verification state of the 2026-10-23 UX fixes

The UX fixes (SRS change log 2026-10-23) have designed test cases in
SWE-DOC-006 but no automated tests yet. Twelve were checked by the lead in a
browser on 2026-10-23 (TC-MAN-05); the RTM marks them "Verified in browser
2026-10-23" and every other new or changed requirement `Unverified`.

### 3.1 Features not tested by automation

| Feature                                      | Reason                                     | Covered by        |
| -------------------------------------------- | ------------------------------------------ | ----------------- |
| Real Spotify audio playback                  | Third-party, needs account and audio        | L5 demonstration  |
| Visual polish (gradient tone, spacing)       | Subjective                                 | L5, screenshots   |
| Legal correctness of the privacy policy      | Not software                               | Owner, lawyer     |

## 4. Environment

| Item       | Specification                                                    |
| ---------- | ---------------------------------------------------------------- |
| OS         | Windows 11 (development); Ubuntu LTS (CI, planned)                |
| Node       | 22.14 or later (needed for `--experimental-strip-types`)          |
| Browsers   | Chromium, Firefox, WebKit via Playwright; Chrome stable for screenshots |
| Build      | Production build served with `vite preview`                       |
| Viewports  | 360×740, 768×1024, 1024×768, 1440×900, 1920×1080, 2560×1440, 3440×1440 |
| Data       | Repository seed data; clean storage per test unless stated        |

## 5. Entry and exit criteria

### 5.1 Entry

- Change compiles locally.
- Requirements touched by the change are identified (RTM row).

### 5.2 Exit (per change)

- L1 passes: `npm run checkstyle` and `npm run build` exit 0.
- All L2 and L3 tests pass (once M5 lands).
- New or changed requirements have at least one designed test case.

### 5.3 Exit (per release)

- All P1 requirements verified (status `Pass` in the RTM).
- L4 suite passes in all three browser engines.
- axe: zero serious or critical violations.
- Lighthouse: performance ≥ 90, accessibility ≥ 90, best practices ≥ 90.
- No open risk with score ≥ 15.

### 5.4 Suspension and resumption

Suspend L4 if the production build fails or seed data is invalid; resume
after L1 passes again.

## 6. Defect management

| Severity | Definition                                              | Release impact          |
| -------- | ------------------------------------------------------- | ----------------------- |
| S1       | Site or a route does not render; data loss of visitor state | Blocks release      |
| S2       | A P1 requirement fails with no workaround               | Blocks release          |
| S3       | A P2/P3 requirement fails, or a P1 with a workaround     | Owner decides           |
| S4       | Cosmetic                                                | Does not block          |

Defects are tracked as GitHub issues labelled `bug` and `S1` to `S4`, linked
to the requirement ID and test case ID.

## 7. Analyses (verification method A)

| Analysis                              | Requirement   | Method                                                         |
| ------------------------------------- | ------------- | -------------------------------------------------------------- |
| Colour contrast                       | SRS-A11Y-03   | Compute WCAG ratios for every text/background token pair in both themes; record in SWE-DOC-006 appendix |
| Search complexity                     | SRS-PERF-04   | O(documents × terms); 500 docs × 5 terms well under 50 ms; confirm with a benchmark test |
| Bundle composition                    | SRS-PERF-01   | Inspect `vite build` output: one chunk per MDX body             |

## 8. Records

- CI logs are the record for L1 to L4.
- Each release appends a test summary to the SVD (SWE-DOC-013): date,
  commit, suites run, pass/fail counts, open defects.
- Manual (L5) results are recorded in the SVD with the viewport, browser and
  theme used.

## 9. Implementation plan for M5

1. Add dev dependencies: `vitest`, `@vitest/coverage-v8`, `jsdom`,
   `@testing-library/react`, `@testing-library/user-event`,
   `@testing-library/jest-dom`, `@playwright/test`, `@axe-core/playwright`.
2. Add scripts: `test` (Vitest run), `test:watch`, `test:coverage`,
   `test:e2e` (Playwright with `vite preview` as web server).
3. Test files: `src/**/__tests__/<Name>.test.ts(x)` for L2/L3,
   `e2e/<journey>.spec.ts` for L4. Test files carry the license header and
   follow the same lint rules.
4. Add `npm test` to the definition of done in `CLAUDE.md`.
5. Implement test cases in the order: P1 unit cases, P1 component cases,
   P1 journeys, then the rest.

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
| 2026-10-23 | UX fixes: sitemap script and robots.txt as test items, new test doubles (API `fetch`, socket, connectivity, `sessionStorage`, `matchMedia` changes), chat delivery state testing, §3.0 verification state | Claude, for swemre review |
