# Commands

Run from the repository root.

| Command                 | What it does                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | RSS generation, then Vite dev server on http://localhost:5173 (HMR)  |
| `npm run build`         | RSS generation, `tsc -b` type-check, production bundle into `dist/`  |
| `npm run rss`           | Validate `src/database/feedDatabase.ts` and regenerate `public/rss.xml` (also runs before `dev`/`build`, and on database changes during `dev`). Exits 1 on feed problems |
| `npm run preview`       | Serve the production build locally                                   |
| `npm run lint`          | ESLint only                                                          |
| `npm run checkstyle`    | ESLint (gts) + `prettier --check` + license-header check. Read-only. |
| `npm run checkstyle:fix`| ESLint `--fix` + `prettier --write` + adds missing license headers   |

## Before finishing any change

```text
npm run checkstyle
npm run build
```

If `src/types/type.d.ts` changed, also run
`npx tsc -p tsconfig.app.json --noEmit --skipLibCheck false` (ignore the
`node_modules/@types/mdx` findings).

Tests (`npm test`, `npm run test:e2e`) do not exist yet; they are planned in
`engineering/software-test-plan.md` (milestone M5).

Both must pass. If `checkstyle` fails only on formatting or missing headers,
`npm run checkstyle:fix` resolves it.

## Slash commands and skills

Command (in `.claude/commands/`):

- `/checkstyle`: run the style check and fix what is safe to fix

Skills (in `.claude/skills/<name>/SKILL.md`; invoke as `/<name>` or let
Claude pick them):

| Skill           | Arguments                                   | What it does                                                   |
| --------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `new-article`   | `<slug> <title>`                            | Article entry + MDX body, then `add-rss-item`                  |
| `new-project`   | `<slug> <title> [year] [repoUrl] [url]`     | Project entry + MDX write-up, then `add-rss-item`              |
| `new-song`      | `<spotify URL or id> [title] [artist]`      | Verifies the track via oEmbed, adds it, then `add-rss-item`    |
| `add-rss-item`  | `<article\|project\|song\|note> <ref or title> …` | Appends to `feedDatabase.ts`, runs `npm run rss`, checks the output |

The build fails if an article, project or song has no feed item, so the
`new-*` skills always finish by calling `add-rss-item`.

## Visual check

`npm run build`, then `npx vite preview --port 4179`, then headless Chrome:

```text
chrome --headless=new --hide-scrollbars --window-size=1920,1080 --blink-settings=preferredColorScheme=1 --virtual-time-budget=5000 --screenshot=out.png http://localhost:4179/articles
```

Use `--force-dark-mode` instead of the blink setting for the dark theme.
Headless Chrome will not go below about 500 px wide. Procedure:
`engineering/software-test-procedures.md` TC-MAN-01.

## Platform notes

Development is on Windows 11 with Git Bash and PowerShell. Prefer scripts that
work in both. Line endings are LF (`.editorconfig`, `files.eol`); Git may warn
about LF to CRLF conversion, which is harmless. Windows Python writes CRLF in
text mode, so scripts that edit files should open them with LF newlines
(Prettier rejects CRLF).
