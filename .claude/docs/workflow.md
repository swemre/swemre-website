# Software Configuration Management Plan (SCMP) and workflow

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Document ID | SWE-DOC-009                                                  |
| Status      | Draft for owner review (drafted by Claude; owner to edit)    |
| Baseline    | 2026-10-15                                                   |
| Owner       | swemre                                                       |

> Owner note: this file was reserved for you. It now proposes a workflow
> based on the facts known so far (default branch `main`, git user `swemre`,
> Claude never commits or pushes unless asked). Adjust it to how you
> actually want to work.

## 1. Configuration items

| CI class         | Items                                                               | Controlled by |
| ---------------- | ------------------------------------------------------------------- | ------------- |
| Source           | `src/**`, `scripts/**`, `index.html`                                | Git           |
| Content          | `src/page/**/*.mdx`, `src/database/**`                              | Git           |
| Configuration    | `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.vscode/**` | Git |
| Documentation    | `.claude/**`, `README.md`, `LICENSE`, `NOTICE`                      | Git           |
| Generated        | `public/rss.xml` (committed, regenerated on dev/build), `dist/` (ignored) | Build    |

## 2. Branching

| Branch          | Purpose                                         | Lifetime          |
| --------------- | ----------------------------------------------- | ----------------- |
| `main`          | Always releasable; production deploys from tags | Permanent         |
| `feat/<topic>`  | New feature or content area                      | Until merged      |
| `fix/<topic>`   | Bug fix                                          | Until merged      |
| `content/<slug>`| New or edited article or project                 | Until merged      |
| `docs/<topic>`  | Documentation only                               | Until merged      |
| `chore/<topic>` | Tooling, dependencies                            | Until merged      |

- Branch from `main`; keep branches short (days, not weeks).
- Merge with **squash** into `main` so each change is one commit with a
  Conventional Commit message.
- Rebase a branch on `main` before merging when it is behind.

## 3. Commits

Conventional Commits:

```text
<type>(<scope>): <summary in imperative, ≤ 72 chars>

<body: what and why, wrapped at 72>

Refs: SRS-ART-12, TC-ART-03
```

| Type       | Use                                             |
| ---------- | ----------------------------------------------- |
| `feat`     | New behaviour (new SRS requirement)             |
| `fix`      | Defect fix                                      |
| `content`  | Article, project or legal text                  |
| `docs`     | `.claude` or README                             |
| `style`    | Visual or token changes without behaviour change |
| `refactor` | Code change without behaviour change            |
| `test`     | Tests only                                      |
| `chore`    | Tooling, dependencies, config                   |

Scopes: `articles`, `projects`, `home`, `nav`, `search`, `player`, `chat`,
`resume`, `theme`, `legal`, `rss`, `design`, `services`, `tooling`, `docs`.

Commits made with Claude end with:

```text
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

**Claude never commits, pushes, tags or deploys unless the owner asks in
that conversation.**

## 4. Pull requests and review

PR description template:

```markdown
## What
<one paragraph>

## Why
<request or requirement IDs>

## Verification
- [ ] npm run checkstyle
- [ ] npm run build
- [ ] Tests: <TC ids run> / not applicable
- [ ] Screenshots (light and dark) for visual changes

## Docs
- [ ] SRS / SDD / ICD / STPr / RTM updated or not needed
```

Review uses the change checklist in SWE-DOC-008 §5.1. The owner is the only
approver. PRs created with Claude end with the line
`🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 5. Versioning and releases

- Semantic versioning in `package.json`: `MAJOR.MINOR.PATCH`.
  - MAJOR: route or storage-schema changes that break existing links or data.
  - MINOR: new features or sections.
  - PATCH: fixes and content.
- First public release: `v1.0.0` (milestone M6).
- Release steps:
  1. Release checklist (SWE-DOC-008 §5.2).
  2. Update the SVD (SWE-DOC-013) and bump `package.json`.
  3. Commit `chore(release): vX.Y.Z`, tag `vX.Y.Z`, push tag.
  4. Host builds and deploys the tag (planned CI).
  5. Smoke test production: `/`, one article, search, RSS.

## 6. Deployment (planned)

| Step        | Detail                                                             |
| ----------- | ------------------------------------------------------------------ |
| CI          | GitHub Actions: `npm ci`, `npm run checkstyle`, `npm run build`, tests |
| Preview     | Every PR gets a preview URL from the host                           |
| Production  | Tags on `main` deploy to `swemre.com`                               |
| Rollback    | Redeploy the previous tag                                           |
| SPA routing | Host fallback to `index.html` (RSK-15)                              |

## 7. Content workflow

1. Branch `content/<slug>`.
2. Run the matching skill: `/new-article <slug> <title>`,
   `/new-project <slug> <title>` or `/new-song <spotify URL>`. Each adds the
   database entry (and MDX body) and then runs `/add-rss-item`, which appends
   the feed entry to `src/database/feedDatabase.ts`. A free-form
   announcement is `/add-rss-item note <title> <summary> [link]`.
3. Write with `##`/`###` headings; code fences with languages; callouts for
   asides.
4. `npm run dev`, read it in both themes.
5. `npm run checkstyle:fix`, `npm run checkstyle`, `npm run build` (the build
   regenerates `public/rss.xml`).
6. Commit as `content(articles): add <title>`; merge; release as a PATCH.

Article `id` values are permanent once published (they key visitor state).

## 8. Change control for documentation

- Behaviour changes update the affected engineering docs in the same commit
  (SWE-DOC-000 maintenance rules).
- Document status moves from "Draft for owner review" to "Baselined" when
  the owner has reviewed it; record the date in its change log.

## 9. Backups

Git remote (GitHub `swemre/swemre-website`) is the backup of record.
Visitor data is never on a server, so there is nothing else to back up
until a backend exists.

## Change log

| Date       | Change                                         | Author                    |
| ---------- | ---------------------------------------------- | ------------------------- |
| 2026-10-15 | Owner placeholder replaced with a full draft   | Claude, for swemre review |
