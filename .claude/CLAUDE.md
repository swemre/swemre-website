# swemre-website: Claude Code guide

Personal portfolio and article site for **swemre** (emre@swemre.com).
React 19 + TypeScript + Vite 8, content written in MDX.

This file is the entry point. Everyday guides live in `.claude/docs/` and are
imported below. The formal engineering set (NASA NPR 7150.2 style) lives in
`.claude/docs/engineering/`; it is **not** auto-imported, so read the
relevant document when a task touches requirements, design, interfaces,
tests, risks or releases.

Documents previously reserved for the owner (`architecture.md`,
`syntax-and-conventions.md`, `workflow.md`) now hold full drafts marked
"Draft for owner review". The owner may edit them at any time; their content
overrides Claude's defaults.

## Docs index

Everyday guides (auto-imported):

- @docs/project-overview.md: what the project is, stack, folder layout, routes
- @docs/commands.md: every npm script, verification and screenshot commands
- @docs/article-system.md: services (`useService`), array databases, MDX content, localStorage, search, dock
- @docs/design-system.md: Tailwind v4 tokens in `src/main.css`, layout widths, header bands, UI conventions
- @docs/checkstyle.md: Google TypeScript Style (gts), Prettier, VS Code wiring
- @docs/licensing.md: license, per-file header, how headers are enforced
- @docs/syntax-and-conventions.md: SWE-DOC-010 coding standard (includes adapted Power of Ten rules)
- @docs/workflow.md: SWE-DOC-009 configuration management, branching, commits, releases

Skills (`.claude/skills/`): `new-article`, `new-project`, `new-song` and
`add-rss-item`. Use them whenever content is added; each `new-*` skill ends
by calling `add-rss-item`, because the build fails when an article, project
or song has no entry in `src/database/feedDatabase.ts`.

Engineering set (read on demand; index in `docs/engineering/README.md`):

| ID          | Document                                  | File                                                    |
| ----------- | ----------------------------------------- | ------------------------------------------------------- |
| SWE-DOC-001 | Software Management Plan                  | `docs/engineering/software-management-plan.md`          |
| SWE-DOC-002 | Software Requirements Specification       | `docs/engineering/software-requirements-specification.md` |
| SWE-DOC-003 | Software Design Description (architecture) | `docs/architecture.md`                                 |
| SWE-DOC-004 | Interface Control Document                | `docs/engineering/interface-control-document.md`        |
| SWE-DOC-005 | Software Test Plan                        | `docs/engineering/software-test-plan.md`                |
| SWE-DOC-006 | Test Procedures and test designs          | `docs/engineering/software-test-procedures.md`          |
| SWE-DOC-007 | Requirements Traceability Matrix          | `docs/engineering/requirements-traceability-matrix.md`  |
| SWE-DOC-008 | Software Assurance and Safety Plan        | `docs/engineering/software-assurance-plan.md`           |
| SWE-DOC-011 | Risk Register                             | `docs/engineering/risk-register.md`                     |
| SWE-DOC-012 | Architecture Decision Records             | `docs/engineering/architecture-decision-records.md`     |
| SWE-DOC-013 | Software Version Description              | `docs/engineering/software-version-description.md`      |

## Hard rules (always apply)

1. **Every new source file gets the license header** (`.ts .tsx .js .mjs .css
   .mdx .html`). Run `npm run checkstyle:fix` to add it. JSON, Markdown and
   other files that cannot hold comments are exempt.
2. **Run `npm run checkstyle` and `npm run build` before declaring work done.**
   Report failures honestly; do not silence rules to make them pass.
3. **Data goes through services.** Components get data via
   `useService(name)` / `useFindAll`, never by importing `database/*` arrays.
   Article metadata is static (`database/`); views, likes and favorites live
   only in localStorage via `services/ArticleInteractionStore.ts`.
4. **Folder rules.** `src/page/` holds only pages and MDX. Templates,
   components, hooks, context, forms, services, database, types, config and
   utils each have their own folder. **All types live in one file,
   `src/types/type.d.ts`**, grouped by `// ---------- section ----------`
   dividers; import with `import type {X} from '…/types/type'`. No local
   interfaces elsewhere. The code must stay `erasableSyntaxOnly` (no parameter
   properties or enums). `skipLibCheck` skips `.d.ts` files, so after editing
   it run `npx tsc -p tsconfig.app.json --noEmit --skipLibCheck false`.
5. **Styling is Tailwind classes only.** Every colour, shadow, radius, font,
   text size and layout size is a token in `src/main.css`; Tailwind defaults
   (including the container scale) are cleared. No new CSS classes, no inline
   `style`, no raw hex, **no hard-coded pixel widths or heights** in
   components (icons and control sizes on the spacing scale excepted). Add a
   token to `main.css` (light in `@theme`, dark under `[data-theme='dark']`).
   Never name a token after a Tailwind keyword (`grid`, `flex`, `block`, …).
6. **Code style comes from `gts` plus Prettier.** Do not hand-format. Single quotes,
   no bracket spacing (`{a}`), trailing commas, arrow parens avoided, 2 spaces,
   80 columns, **no semicolons** (Prettier `semi: false` plus ESLint
   `semi: ['error', 'never']`).
7. **Comments: almost none.** Keep license headers, format notes (ISO dates,
   units, slug/file conventions), `TODO(...)` markers and comments explaining
   genuinely non-obvious behaviour or required by lint (empty `catch`).
   No doc comments that restate the code.
8. **Do not change the license** or the copyright holder without being asked.
9. Do not commit or push unless asked.
10. **Keep the engineering docs in sync.** A behaviour change updates the
    SRS requirement, the SDD section, the ICD (if an interface changed), the
    test design and the RTM row in the same change. Mark anything you could
    not verify as `Unverified`/`Designed`, never as `Pass`.
11. **No CI/CD, ever.** GitHub Actions is forbidden, and so is any other
    pipeline (`.github/workflows`, host Git integrations, build hooks,
    preview deploys). Never add one; all checks run locally and deploys are
    run by hand.

## Gotchas

- ESLint is pinned to **v9** because `gts@7` depends on it. Do not bump to v10
  until gts supports it.
- `npm audit` reports a high advisory via `gts > inquirer > external-editor > tmp`.
  It is dev-only (gts CLI prompts) and has no fix upstream.
- `.mdx` files are excluded from Prettier (it mangles `{/* */}` comments).
- `services/mdxBodies.ts` builds the lazy MDX body components at module load
  on purpose; creating them during render violates
  `react-hooks/static-components`.
- RSS: never edit `public/rss.xml`; it is generated from
  `src/database/feedDatabase.ts`. Feed ids and dates are permanent once
  published.
- Sound: interactive elements get sounds automatically through
  `SoundProvider`. If a component plays its own sound with
  `useSound().play(...)`, mark the triggering element `data-sound="none"`
  (or `data-sound-enter="none"` on a text field) so it does not play twice.
- TypeScript `strict` is off (RSK-03). Do not rely on the compiler to catch
  null or implicit-any mistakes.
- Windows Python writes CRLF in text mode; open files for writing with
  LF newlines, or run `npm run checkstyle:fix` afterwards.
