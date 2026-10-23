# Risk Register

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-011                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

Scoring: likelihood (L) 1 rare to 5 almost certain × impact (I) 1
negligible to 5 severe = score. ≥ 15 high (blocks release), 8 to 14
medium, ≤ 7 low. Approach: **Mitigate**, **Accept**, **Watch**, **Transfer**.

| ID     | Risk                                                                                         | L | I | Score | Approach | Mitigation / action                                                         | Owner  | Status |
| ------ | -------------------------------------------------------------------------------------------- | - | - | ----- | -------- | --------------------------------------------------------------------------- | ------ | ------ |
| RSK-01 | No automated tests: regressions in services, search or player go unnoticed                    | 4 | 3 | 12    | Mitigate | Implement SWE-DOC-006 test designs in milestone M5                           | swemre | Open   |
| RSK-02 | Spotify changes or retires the iFrame API                                                    | 2 | 3 | 6     | Watch    | Fallback iframe already in place; isolate API in `spotifyIframeApi.ts`        | swemre | Open   |
| RSK-03 | TypeScript `strict` is off, so null and implicit-any bugs slip past the compiler              | 3 | 3 | 9     | Mitigate | Enable `strict` in `tsconfig.app.json` and fix findings (ADR-012 proposed)    | swemre | Open   |
| RSK-04 | Rejected promises are not handled in `useAsyncData` (UI stuck loading); the contact forms handle failures since 2026-10-23 | 2 | 3 | 6     | Mitigate | Add `error` to `AsyncResult`, a retry UI and a failure message in the form    | swemre | Closed (PRS-000333) |
| RSK-05 | Lazy MDX chunk fails to load (deploy during a visit, flaky network)                          | 2 | 3 | 6     | Mitigate | Error boundary around `MdxBody` with a reload prompt                          | swemre | Open   |
| RSK-06 | `npm audit` high advisory in dev-only `gts > inquirer > tmp`                                  | 1 | 2 | 2     | Accept   | Not shipped to users; re-check monthly                                        | swemre | Open   |
| RSK-07 | Layer rule exception: `ArticlePage` imports `articleInteractionStore` directly                 | 2 | 1 | 2     | Accept   | Wrap in a `useRegisterView` hook when touching the page next                  | swemre | Open   |
| RSK-08 | Spotify artwork URL breaks (CDN path change)                                                 | 2 | 1 | 2     | Mitigate | `onError` fallback to the Spotify icon in `SongRow` and `SpotifyPanel`        | swemre | Open   |
| RSK-09 | `fg-subtle` on `canvas` in dark mode is 2.90:1, below 3:1                                     | 5 | 2 | 10    | Mitigate | Lighten dark `--color-fg-subtle` (for example `#6e7a87` gives ≈ 3.4:1) and re-measure | swemre | Open |
| RSK-10 | Chat messages that fail to send stay on the device until retried                                  | 3 | 2 | 6     | Mitigate | "Not sent · tap to retry" label and automatic retry shipped                    | swemre | Open   |
| RSK-11 | Resume requests are lost on reload (in-memory service)                                       | 5 | 3 | 15    | Mitigate | **High**: connect a backend or `mailto:` fallback before public launch (SRS-FUT-01) | swemre | Open |
| RSK-12 | Placeholder content (phone number, example projects) goes live                                | 3 | 3 | 9     | Mitigate | Release checklist R-5; `TODO(swemre)` markers                                 | swemre | Open   |
| RSK-13 | ESLint 9 pinned by gts 7; ecosystem moves to ESLint 10                                        | 3 | 1 | 3     | Watch    | Re-check gts releases quarterly                                               | swemre | Open   |
| RSK-14 | Token names collide with Tailwind utility names (as `--spacing-grid` did with `inline-grid`)   | 2 | 3 | 6     | Mitigate | ADR-011 naming rule; review checklist C-13; visual check TC-MAN-01            | swemre | Mitigated 2026-10-15 |
| RSK-15 | No SPA fallback on the host makes deep links 404                                              | 3 | 4 | 12    | Mitigate | Configure fallback to `index.html` when choosing the host (SDD §9)            | swemre | Open   |
| RSK-16 | Long reading width hurts readability of prose (resolved: column capped at 75ch on 2026-10-15)                                    | 3 | 2 | 6     | Watch    | Owner chose a wide layout; revisit after feedback                             | swemre | Open   |
| RSK-17 | Sound effects annoy visitors or clash with screen readers                                    | 3 | 2 | 6     | Mitigate | Quiet master gain, short sounds, persistent mute switch in the dock; consider defaulting to muted when `prefers-reduced-motion` is set | swemre | Open |
| RSK-18 | A content change forgets its feed entry and breaks the build                                 | 3 | 1 | 3     | Accept   | Intended: the generator names the missing entry; `new-*` skills add it automatically | swemre | Open |

## High risks requiring action before release

- **RSK-11** (15): resume requests are not delivered anywhere.

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial register | Claude, for swemre review |
| 2026-10-23 | RSK-04 closed by PRS-000333 (failed loads show an error and Retry) | Claude, for swemre review |
