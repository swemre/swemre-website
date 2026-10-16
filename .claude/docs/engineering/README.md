# Engineering documentation set

| Field          | Value                                              |
| -------------- | -------------------------------------------------- |
| Document ID    | SWE-DOC-000                                        |
| Project        | swemre-website                                     |
| Owner          | swemre (emre@swemre.com)                           |
| Status         | Draft for owner review                             |
| Baseline       | 2026-10-15, working tree on `main` after `8807ffc` |
| Classification | NPR 7150.2 Class F equivalent (general IT, non-safety-critical) |

This folder holds the project's engineering documents. Their structure follows
**NASA NPR 7150.2D** (*NASA Software Engineering Requirements*), with content
guidance from **NASA-HDBK-2203** (*NASA Software Engineering Handbook*), and
the assurance approach follows **NASA-STD-8739.8B** (*Software Assurance and
Software Safety Standard*). The documents are tailored to a one-person,
static, client-side website: every record NPR 7150.2 expects exists, but each
one is kept to the size that is useful at this scale.

## Document tree

| ID          | Document                                                        | NPR 7150.2 / HDBK-2203 equivalent              | File                                                                 |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| SWE-DOC-000 | Index and conventions                                           | n/a                                            | `README.md` (this file)                                              |
| SWE-DOC-001 | Software Management Plan (SMP)                                  | SWE-013, Software Development/Management Plan  | `software-management-plan.md`                                        |
| SWE-DOC-002 | Software Requirements Specification (SRS)                       | SWE-050, SWE-051, SRS                          | `software-requirements-specification.md`                             |
| SWE-DOC-003 | Software Design Description (SDD), the architecture             | SWE-057, SWE-058, SDD                          | `../architecture.md`                                                 |
| SWE-DOC-004 | Interface Control Document (ICD)                                | Interface Design Description (IDD)             | `interface-control-document.md`                                      |
| SWE-DOC-005 | Software Test Plan (STP)                                        | SWE-065, Software Test Plan                    | `software-test-plan.md`                                              |
| SWE-DOC-006 | Software Test Procedures and test designs (STPr)                | SWE-065, SWE-066, Software Test Procedures     | `software-test-procedures.md`                                        |
| SWE-DOC-007 | Requirements Traceability Matrix (RTM)                          | SWE-052, SWE-059, SWE-072, bidirectional trace | `requirements-traceability-matrix.md`                                |
| SWE-DOC-008 | Software Assurance and Safety Plan (SAP)                        | NASA-STD-8739.8B                               | `software-assurance-plan.md`                                         |
| SWE-DOC-009 | Software Configuration Management Plan (SCMP) and workflow      | SWE-079 to SWE-085                             | `../workflow.md`                                                     |
| SWE-DOC-010 | Software Coding Standard                                        | SWE-061, coding standards                      | `../syntax-and-conventions.md`                                       |
| SWE-DOC-011 | Risk Register                                                   | SWE-086, continuous risk management            | `risk-register.md`                                                   |
| SWE-DOC-012 | Architecture Decision Records (ADR)                             | SDD rationale section                          | `architecture-decision-records.md`                                   |
| SWE-DOC-013 | Software Version Description (SVD)                              | SWE-063, Software Version Description          | `software-version-description.md`                                    |

Supporting guides (not formal NASA documents, kept for day-to-day work):
`../project-overview.md`, `../commands.md`, `../article-system.md`,
`../design-system.md`, `../checkstyle.md`, `../licensing.md`.

## Applicable and reference documents

| Ref  | Document                                                                 | Use here                                       |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| [A1] | NPR 7150.2D, NASA Software Engineering Requirements                      | Document set, classification, lifecycle        |
| [A2] | NASA-HDBK-2203, NASA Software Engineering Handbook                       | Content outlines for SRS, SDD, STP, SVD        |
| [A3] | NASA-STD-8739.8B, Software Assurance and Software Safety Standard        | Assurance activities, hazard analysis          |
| [R1] | G. J. Holzmann, "The Power of Ten: Rules for Developing Safety-Critical Code", 2006 | Adapted coding rules (SWE-DOC-010)  |
| [R2] | Google TypeScript Style Guide and `gts` 7                                | Enforced style                                 |
| [R3] | WCAG 2.2, W3C                                                            | Accessibility requirements                     |
| [R4] | IEEE 29148, Requirements engineering                                     | Requirement wording ("shall", one condition)   |
| [R5] | Apache License 2.0 + Commons Clause v1.0 (`LICENSE`, `NOTICE`)           | Licensing constraints                          |

## Conventions used in every document

- **Header table**: document ID, status, baseline date, owner.
- **Status values**: `Draft`, `Draft for owner review`, `Baselined`, `Superseded`.
- **Requirement IDs**: `SRS-<AREA>-<NN>`, never reused after deletion
  (deleted requirements are marked `Deleted` and kept in the table).
- **Test case IDs**: `TC-<AREA>-<NN>`, matching the requirement area.
- **Risk IDs**: `RSK-<NN>`. **Decision IDs**: `ADR-<NNN>`.
- **Verification methods** (NASA): **T** test, **A** analysis,
  **I** inspection, **D** demonstration.
- **"Shall"** means mandatory, **"should"** means recommended, **"may"** means
  optional. Each requirement states one condition and one verifiable outcome.
- **Dates** are ISO 8601 (`YYYY-MM-DD`).
- **Change log** at the end of each document: date, change, author.

## Maintenance rules

1. A change in behaviour updates the SRS, the SDD section, the ICD (if an
   interface changed), the test procedure and the RTM **in the same change**.
2. A new architectural decision gets an ADR before or with the code.
3. A new risk, or a change in a risk's likelihood or impact, is recorded in
   the risk register.
4. Each release updates the SVD.
5. Claude keeps these documents in sync when it changes behaviour, and marks
   anything it cannot verify as `Unverified` instead of guessing.

## Change log

| Date       | Change                                   | Author |
| ---------- | ---------------------------------------- | ------ |
| 2026-10-15 | Initial documentation set drafted         | Claude, for swemre review |
