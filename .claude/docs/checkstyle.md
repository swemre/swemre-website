# Checkstyle (Google TypeScript Style)

Google Java Checkstyle has no direct TypeScript twin. The equivalent is
**[gts](https://github.com/google/gts)** (Google TypeScript Style): ESLint rules
plus Prettier formatting that implement Google's TypeScript conventions.
Installed version: **gts 7.0.0** (latest at time of setup, October 2026).

## Pieces

| File                      | Role                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `eslint.config.js`        | Flat config: spreads `gts`, adds `semi: never`, `no-extra-semi`, React hooks/refresh rules |
| `.prettierrc.json`        | gts formatting: `bracketSpacing:false`, `singleQuote`, `semi:false`, `trailingComma:all`, `arrowParens:avoid`, Tailwind class sorting |
| `.prettierignore`         | Skips `dist`, lockfile, `.claude`, `LICENSE`, `*.mdx`      |
| `.editorconfig`           | 2 spaces, LF, final newline, 80 columns                    |
| `.vscode/settings.json`   | Format on save with Prettier, ESLint fix on save           |
| `scripts/license-headers.mjs` | License header check/fix                               |

## Commands

```text
npm run checkstyle       # check only (CI-safe)
npm run checkstyle:fix   # auto-fix lint, format, headers
```

`skipLibCheck` hides errors in `src/types/type.d.ts`. After editing it, run
`npx tsc -p tsconfig.app.json --noEmit --skipLibCheck false` and look only at
`src/` findings (`@types/mdx` reports unrelated JSX namespace errors).

`checkstyle` = `eslint .` && `prettier --check .` && `license-headers --check`.

## Notable rules from gts

`eqeqeq`, `no-var`, `prefer-const`, `prefer-arrow-callback`, `eol-last`,
`no-trailing-spaces`, single quotes, `@typescript-eslint/no-floating-promises`
(type-aware), no `.only` in tests, `ban-ts-comment` as warning.

## Project-specific adjustments (in `eslint.config.js`)

- **No semicolons**: `semi: ['error', 'never']` and `no-extra-semi`, matching
  Prettier `semi: false`. Lines that would start with `(`, `[` or a backtick
  must be restructured (Prettier would add a leading `;`).
- `parserOptions.project` points at `tsconfig.app.json` and
  `tsconfig.node.json` (root `tsconfig.json` only holds references).
- React hooks and react-refresh rules apply to `src/**`.
- Config and script files are ESM (`sourceType: 'module'`, Node globals).

## VS Code

Recommended extensions are in `.vscode/extensions.json`:
Prettier, ESLint, psi-header, MDX, EditorConfig. With them installed, saving
a file formats it with the same config the CLI uses.

## Version pinning

`gts@7` depends on `eslint@^9`, so this repo uses ESLint 9 and `@eslint/js` 9.
Revisit when gts publishes ESLint 10 support.
