# Software Assurance and Safety Plan (SAP)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-008                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Purpose

Defines the assurance activities that give confidence the software meets its
requirements and standards, following the structure of NASA-STD-8739.8B
(software assurance, software safety, IV&V), tailored to a Class F,
non-safety-critical website.

## 2. Assurance disciplines

| NASA-STD-8739.8B discipline | Applied here as                                                      |
| --------------------------- | -------------------------------------------------------------------- |
| Software quality            | Checklists in §5, metrics in SMP §10, static analysis on every change |
| Software safety             | Criticality assessment §4 (result: not safety-critical)              |
| Software reliability        | Error-handling review, fault-injection tests (storage, Spotify)       |
| Software verification & validation | STP / STPr, RTM status per release                              |
| IV&V                        | Not applicable (tailored out in SMP §11)                              |
| Cybersecurity               | §6 security assessment                                                |

## 3. Responsibilities

The owner performs assurance. Claude may run checks and report findings, but
approval of a change and of a release is always the owner's.

## 4. Software safety criticality assessment

| Question (NASA-STD-8739.8B Appendix A)                                  | Answer |
| ----------------------------------------------------------------------- | ------ |
| Can the software cause or contribute to a hazard to people?              | No     |
| Does it control hardware or physical processes?                          | No     |
| Does it provide data used for safety decisions?                          | No     |
| Does it process sensitive personal data at scale?                        | No; form data stays in the tab, chat on the device |
| **Result**                                                              | **Not safety-critical**. No hazard reports required. |

### 4.1 Failure modes and effects (lightweight FMEA)

| ID    | Component                 | Failure mode                                | Effect on visitor                        | Sev | Detection                    | Mitigation                                          |
| ----- | ------------------------- | ------------------------------------------- | ---------------------------------------- | --- | ---------------------------- | --------------------------------------------------- |
| FM-01 | `localStorage`            | Unavailable / quota / corrupt               | Preferences not remembered               | Low | TC-SVC-02, TC-ART-06, TC-E2E-08 | try/catch on read and write; in-memory fallback   |
| FM-02 | Spotify iFrame API        | Blocked or offline                          | Custom player missing                    | Low | TC-PLY-03, TC-E2E-06          | Plain embed fallback; retry on next click            |
| FM-03 | Spotify CDN               | Artwork 404                                 | Broken image in song row                 | Low | Manual                         | Fallback icon when `artworkUrl` is missing; **no handler for a 404** (RSK-08) |
| FM-04 | MDX body chunk            | Network failure on lazy load                | Article body never loads; Suspense spinner stays | Med | TC-E2E (planned)        | **None yet**: add an error boundary (RSK-05)         |
| FM-05 | Service promise           | Rejects                                     | Page stuck on "Loading…"                  | Med | Unit test (planned)            | **None yet**: add error state to `useAsyncData` (RSK-04) |
| FM-06 | Metadata/MDX mismatch     | Slug without body or body without metadata  | "Not found" for a listed article         | Med | TC-ART-01 integrity check      | Review checklist item C-7                            |
| FM-07 | Theme script              | Throws                                      | Light theme flash for dark users         | Low | Inspection                     | Wrapped in try/catch                                 |
| FM-08 | Resume form               | Service rejects                             | Spinner forever, request lost            | Med | Unit test (planned)            | **None yet** (RSK-04)                                |

## 5. Review checklists

### 5.1 Change checklist (every change)

| #   | Item                                                                                   |
| --- | -------------------------------------------------------------------------------------- |
| C-1 | `npm run checkstyle` passes.                                                            |
| C-2 | `npm run build` passes.                                                                 |
| C-3 | If `src/types/type.d.ts` changed: `npx tsc -p tsconfig.app.json --noEmit --skipLibCheck false` shows no `src/` errors. |
| C-4 | New source files have the license header.                                               |
| C-5 | No raw hex colours, inline styles or pixel sizes in components; new tokens have light and dark values. |
| C-6 | Data reaches components only through services.                                          |
| C-7 | Every new article or project has exactly one metadata entry and one `<slug>.mdx`.       |
| C-8 | External links in new tabs have `rel="noreferrer noopener"`.                             |
| C-9 | Promises are awaited, returned or explicitly `void`-ed; rejections considered.          |
| C-10 | Icon-only buttons have `aria-label`; decorative elements are `aria-hidden`.            |
| C-11 | Comments follow the policy (header, format notes, `TODO(...)`, non-obvious behaviour).  |
| C-12 | SRS, SDD, ICD, STPr and RTM updated if behaviour or interfaces changed.                 |
| C-13 | Token names do not collide with Tailwind utility names (ADR-011).                       |

### 5.2 Release checklist

| #   | Item                                                                     |
| --- | ------------------------------------------------------------------------ |
| R-1 | Change checklist satisfied for every change since the last release.      |
| R-2 | Release exit criteria in STP §5.3 met, or waivers recorded in the SVD.   |
| R-3 | TC-MAN-01 visual check done in both themes.                              |
| R-4 | Privacy policy matches the storage keys and third parties in the ICD.    |
| R-5 | `TODO(swemre)` placeholders reviewed (phone number, songs, projects).     |
| R-6 | Risk register reviewed; no open risk ≥ 15.                               |
| R-7 | SVD updated and the version tagged.                                       |

## 6. Security assessment

| Threat (STRIDE)        | Surface                           | Assessment                                                         | Control                                       |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| Spoofing               | Chat "owner" messages             | Visitor could edit storage to fake owner messages, visible only to themself | Accept (local only); backend will sign owner messages |
| Tampering              | `localStorage`                    | Visitor-controlled; only affects that visitor                      | Defensive parsing (SRS-SEC-06)                 |
| Repudiation            | n/a                               | No server actions                                                  | n/a                                           |
| Information disclosure | Third parties (Spotify)           | IP address to CDN; cookies after play                              | Disclosed in privacy policy v1.1; script only on demand |
| Denial of service      | Static host                       | Host's responsibility                                              | CDN hosting (planned)                          |
| Elevation of privilege | XSS via MDX or user text          | MDX is authored by the owner and compiled at build time; user text rendered as text | No `dangerouslySetInnerHTML`; React escaping |

Supply chain: dependencies are pinned through `package-lock.json`.
`npm audit` reports one high advisory (`gts > inquirer > external-editor >
tmp`) in a dev-only CLI path with no upstream fix; accepted (RSK-06).

Recommended HTTP headers for the host (planned, SDD §9):
`Content-Security-Policy` allowing `self`, `open.spotify.com` (script, frame)
and `*.spotifycdn.com` (img); `Referrer-Policy: strict-origin-when-cross-origin`;
`X-Content-Type-Options: nosniff`; `Permissions-Policy` disabling unused APIs.

## 7. Static analysis

| Tool                  | Configuration                                       | Gate                        |
| --------------------- | --------------------------------------------------- | --------------------------- |
| TypeScript            | `tsconfig.app.json` (`erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) | `npm run build` |
| ESLint 9 + gts 7      | Type-aware rules incl. `no-floating-promises`, plus React hooks, React Compiler rules, `semi: never` | `npm run checkstyle` |
| Prettier 3            | `.prettierrc.json`, Tailwind class sorting           | `npm run checkstyle`        |
| License headers       | `scripts/license-headers.mjs --check`                | `npm run checkstyle`        |

Finding: TypeScript `strict` is **not** enabled in `tsconfig.app.json`.
Enabling it is recommended (RSK-03, ADR-012 proposed).

## 8. Audits

| Audit                         | When                  | Output                         |
| ----------------------------- | --------------------- | ------------------------------ |
| Documentation consistency     | Each release          | RTM status refreshed           |
| Dependency audit (`npm audit`, outdated) | Monthly    | Risk register update           |
| Accessibility (axe + manual)  | Each release (M5+)    | STPr Appendix A, RTM           |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
