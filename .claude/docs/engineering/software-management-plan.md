# Software Management Plan (SMP)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-001                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

## 1. Scope

### 1.1 Identification

**swemre-website**: the personal portfolio and article site of Emre
(handle `swemre`), deployed as static files at
`https://swemre.com` (planned).

### 1.2 System overview

A client-side single-page application (React 19, TypeScript, Vite 8, MDX,
Tailwind CSS v4) that presents:

- a one-screen home page with contact actions and three lists (articles,
  projects, liked songs);
- an articles section and a projects section in a documentation-site layout;
- legal ("special") pages;
- a site-wide search dialog;
- a bottom-right dock with a persistent Spotify player and a chat widget.

There is no backend. Content ships with the bundle; visitor state lives in the
browser's `localStorage`.

### 1.3 Document overview

This plan defines how the software is classified, developed, verified,
configured and released. It is the parent of all other engineering documents
(see `README.md`).

## 2. Software classification

| Criterion (NPR 7150.2 Appendix D) | Assessment                                                     |
| --------------------------------- | -------------------------------------------------------------- |
| Human safety impact               | None                                                           |
| Mission or property impact        | None; a failure means a page does not render                    |
| Data sensitivity                  | Low; visitor data stays in the visitor's browser               |
| Financial impact                  | None                                                           |
| Resulting class                   | **Class F equivalent** (general-purpose IT)                    |
| Safety-critical                   | **No** (see SWE-DOC-008 §4)                                     |

Consequence: the full NASA document set is kept, but tailored. Formal
milestone reviews are replaced by self-review checklists, and independent
verification and validation (IV&V) is not required.

## 3. Organisation and roles

| Role                          | Who                     | Responsibilities                                              |
| ----------------------------- | ----------------------- | ------------------------------------------------------------- |
| Project owner, product owner  | swemre                  | Scope, priorities, content, approval of every change          |
| Software engineer             | swemre, assisted by Claude Code | Design, implementation, documentation                  |
| Software assurance            | swemre                  | Review against SWE-DOC-008 checklists before release          |
| Configuration manager         | swemre                  | Branches, commits, tags, releases (Claude never commits or pushes unasked) |

## 4. Lifecycle model

Incremental and iterative. Each increment follows:

```text
 Request ──► Requirements ──► Design ──► Implement ──► Verify ──► Review ──► Release
   ▲          (SRS update)    (SDD/ADR)   (code+docs)   (STP/STPr)  (owner)   (SVD, tag)
   └───────────────────────────── feedback ◄──────────────────────────────────┘
```

| Phase          | Entry criteria                     | Exit criteria                                                        |
| -------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Requirements   | Owner request                      | SRS entries added or changed with IDs and verification methods       |
| Design         | Requirements agreed                | SDD section updated; ADR written for non-obvious decisions           |
| Implementation | Design agreed                      | Code complete; license headers present; no `TODO` without an owner tag |
| Verification   | Implementation complete            | `npm run checkstyle` and `npm run build` pass; affected test cases executed; results recorded |
| Review         | Verification passed                | Owner reviewed the diff and the SA checklist                         |
| Release        | Review approved                    | SVD updated, version tagged, deployed                                |

## 5. Milestones

| Milestone | Content                                                          | Status      |
| --------- | ---------------------------------------------------------------- | ----------- |
| M0        | Project scaffold, MDX articles, localStorage interactions        | Done        |
| M1        | Tooling: gts checkstyle, license headers, `.claude` docs         | Done        |
| M2        | Pages, services, search, design system, docs look                | Done        |
| M3        | Project pages, Spotify dock, chat widget, single type file       | Done        |
| M4        | Wide layout, header bands, NASA-style documentation              | Done (this baseline) |
| M5        | Automated test suite (Vitest, Testing Library, Playwright, axe)  | Planned     |
| M6        | Hosting, CI pipeline, first tagged release `v1.0.0`              | Planned     |
| M7        | Backend: chat delivery and presence, resume-request storage      | Planned     |

## 6. Standards and practices

| Area           | Standard                                                         | Document    |
| -------------- | ---------------------------------------------------------------- | ----------- |
| Coding         | Google TypeScript Style (gts 7) plus project rules                | SWE-DOC-010 |
| Formatting     | Prettier, `semi: false`, enforced by `npm run checkstyle`         | `checkstyle.md` |
| Styling        | Token-only Tailwind v4 theme in `src/main.css`                    | `design-system.md` |
| Accessibility  | WCAG 2.2 level AA target                                          | SRS-A11Y-*  |
| Licensing      | Apache 2.0 + Commons Clause; header in every source file          | `licensing.md` |
| Documentation  | This document set                                                 | SWE-DOC-000 |

## 7. Verification and validation approach

- **Verification** (built right): static analysis (ESLint with type-aware gts
  rules, TypeScript compiler), formatting and header checks, unit and
  component tests (planned), end-to-end tests (planned), inspection.
- **Validation** (right thing built): the owner demonstrates each increment in
  the browser at the target viewport sizes (see SWE-DOC-005 §5).

Details: SWE-DOC-005 (plan) and SWE-DOC-006 (procedures).

## 8. Configuration management

See SWE-DOC-009 (`../workflow.md`). Summary: Git, `main` as the integration
branch, short-lived topic branches, Conventional Commits, semantic versioning,
tags per release.

## 9. Risk management

Continuous: risks are identified at every increment and tracked in
SWE-DOC-011. Each risk has likelihood (1 to 5), impact (1 to 5), owner,
mitigation and status. Risks scoring 12 or more are reviewed before every
release.

## 10. Metrics

| Metric                                  | Source                         | Target                     |
| --------------------------------------- | ------------------------------ | -------------------------- |
| Lint and format violations              | `npm run checkstyle`           | 0                          |
| Type errors                             | `npm run build` (`tsc -b`)     | 0                          |
| Requirements without verification      | RTM                            | 0                          |
| Requirements verified by passing test   | RTM                            | Increases each milestone   |
| Statement coverage (unit + component)   | Vitest coverage (planned)      | ≥ 80 % for `services/`, `hooks/`, `forms/` |
| Lighthouse performance and accessibility | Lighthouse CI (planned)       | ≥ 90 each                  |
| Open high risks (score ≥ 15)            | Risk register                  | 0 at release               |

## 11. Tailoring

| NPR 7150.2 expectation                 | Tailoring for this project                                     |
| -------------------------------------- | -------------------------------------------------------------- |
| Formal reviews (SRR, PDR, CDR, TRR)    | Replaced by the phase exit criteria in §4 and owner review     |
| IV&V                                   | Not applicable (Class F, non-safety-critical)                  |
| Separate SA organisation               | Owner performs SA with the SWE-DOC-008 checklists              |
| Software safety plan                   | Merged into SWE-DOC-008                                        |
| Data dictionary                        | `src/types/type.d.ts` plus SWE-DOC-004                         |
| Operations and maintenance plan        | Covered by SWE-DOC-009 and SWE-DOC-013                         |

## Change log

| Date       | Change         | Author                    |
| ---------- | -------------- | ------------------------- |
| 2026-10-15 | Initial draft  | Claude, for swemre review |
