# Software Coding Standard: syntax and conventions

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Document ID | SWE-DOC-010                                                  |
| Status      | Draft for owner review (drafted by Claude; owner to edit)    |
| Baseline    | 2026-10-15                                                   |
| Owner       | swemre                                                       |

> Owner note: this file used to be empty for you to fill. It now describes
> the conventions the code base already follows, so Claude has something
> concrete to match. Change anything you disagree with; this file wins over
> Claude's habits. Rules marked **[tool]** are enforced by
> `npm run checkstyle` or the compiler; the rest are enforced by review.

## 1. Formatting [tool]

- Prettier with `.prettierrc.json`: single quotes, **no semicolons**, no
  bracket spacing (`{a}`), trailing commas everywhere, arrow parens avoided
  (`x => x`), 2-space indent, 80 columns, LF line endings.
- Never hand-format; run `npm run checkstyle:fix`.
- A line must not start with `(`, `[` or a backtick, because Prettier would
  insert a leading `;`. Assign to a typed `const` first.
- Tailwind classes are sorted by `prettier-plugin-tailwindcss`, including
  inside `cn(...)`.

## 2. Naming

| Thing                    | Convention                         | Example                              |
| ------------------------ | ---------------------------------- | ------------------------------------ |
| Component file           | PascalCase `.tsx`, one component   | `SongRow.tsx`                        |
| Page file                | PascalCase + `Page`                | `ArticlePage.tsx`                    |
| Template file            | PascalCase + `Template` or `Layout`| `ArticleTemplate.tsx`, `DocsLayout.tsx` |
| Hook file and name       | `useX.ts`                          | `useFindAll.ts`                      |
| Context / provider       | `XContext.ts` + `XProvider.tsx`    | `ChatContext.ts`, `ChatProvider.tsx` |
| Service                  | PascalCase class + `Service`       | `ChatService.ts`                     |
| Database array           | camelCase + `Database`             | `articleDatabase`                    |
| Utility                  | camelCase file and export          | `buttonClass.ts`                     |
| Types and interfaces     | PascalCase                         | `ChatMessage`                        |
| Union string literals    | lowercase kebab or words           | `'play-song'`, `'queued'`            |
| Module constants         | `UPPER_SNAKE` for true constants   | `const LIMIT = 5`, `const KEY = 'swemre:theme'` |
| Booleans                 | `is`, `has`, `can`, `should` prefix where natural | `isOpen`, `isPaused`   |
| Event props              | `on` + Verb                        | `onClose`, `onDone`                  |
| MDX files and slugs      | kebab-case                         | `generic-service-layer-react.mdx`    |
| Storage keys             | `swemre:` + kebab-case             | `swemre:chat-conversations`          |
| Design tokens            | role-based, kebab-case; never a Tailwind keyword (`grid`, `flex`, `block`, …) | `--color-fg-muted`, `--spacing-band` |

## 3. TypeScript

- **All types in `src/types/type.d.ts`**, in the right section, imported with
  `import type {X} from '…/types/type'`. No local interfaces or type
  aliases in other files. Inline object types for component props are
  allowed (`{project: Project; sidebar: ReactNode}`).
- `interface` for object shapes that may be extended; `type` for unions,
  mapped and utility types.
- No `enum`, no `namespace`, no parameter properties (`erasableSyntaxOnly`)
  **[tool]**. Use string-literal unions instead of enums.
- Prefer `unknown` to `any`. `any` needs a comment explaining why.
- `undefined` for "absent" (`find` results, optional props). `null` only for
  "explicitly cleared" state (`current: Song | null`, `select(null)`).
- Narrow parsed external data (`JSON.parse`, storage) with checks before use.
- `as` casts only at trust boundaries (parsed storage, glob imports) and
  never to silence an error you do not understand.
- Format notes live in the type file as short JSDoc lines:
  `/** ISO 8601, UTC. */`, `/** Minutes. */`.

## 4. React

- Function components only. Named exports for components; **default
  exports only for route pages** (`export default function ArticlePage`).
- Props typed inline in the parameter destructuring.
- The React Compiler memoises; do not add `useMemo`, `useCallback` or
  `memo` unless an identity is part of a contract (for example the loader
  passed to `useAsyncData`) **[tool: react-hooks rules]**.
- Never create components during render (`react-hooks/static-components`)
  **[tool]**.
- Refs stay local to the component that owns the DOM node. Do not put a ref
  object into context; register elements through callbacks in an effect.
- Effects: one concern per effect; always clean up subscriptions, observers,
  listeners and in-flight async work (`let live = true` pattern).
- Use React 19 context as provider: `<ThemeContext value={…}>`.
- Data comes from services via `useService` / `useFindAll`, never from
  `database/` imports.
- Accessibility: icon-only buttons get `aria-label`; decorative elements get
  `aria-hidden="true"`; use native elements (`<button>`, `<dialog>`, `<nav>`).

## 5. Imports and exports

- Order (as written today): third-party packages first, then relative
  imports sorted by path, then type-only imports in place
  (`import type …`). Keep `import type` separate from value imports
  **[tool: verbatimModuleSyntax]**.
- Relative paths; no path aliases.
- No barrel (`index.ts`) files.
- Import `.ts` files without extensions in `src/`; scripts that run under
  Node import with the `.ts` extension.

## 6. Comments and documentation

- License header on every source file **[tool]**.
- Otherwise almost none. Allowed:
  - format notes (`/** ISO 8601, UTC. */`);
  - `TODO(swemre): …` or `TODO(backend): …` with an owner tag;
  - one-line explanations of non-obvious behaviour (StrictMode ref guard,
    collapse keeps audio playing, MDX before the React plugin);
  - comments required by lint (empty `catch` blocks).
- No doc comments that restate the code, no commented-out code, no section
  banners except in `type.d.ts` and `main.css`.

## 7. CSS and styling

- Tailwind utilities only; no new CSS classes, no inline `style`, no raw hex
  in components.
- Every visual value is a token in `src/main.css`: light value in `@theme`,
  dark value under `:root[data-theme='dark']`.
- No pixel sizes in components. Use tokens (`max-w-page`, `w-dock`,
  `h-band`) or the spacing scale for control sizes (`h-8`, `size-9`).
  Exceptions: icon `size` props, `Icon` SVG geometry, the Spotify API
  `height: 152` parameter.
- Arbitrary values are allowed only for things Tailwind cannot name
  (gradients, grid templates) and must reference tokens:
  `lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)]`.
- Use `cn()` for conditional classes. `cn` does **not** merge conflicts,
  so never pass two classes that set the same property.
- When hiding something whose base classes set `display`, use a variant
  (`max-sm:hidden`) rather than adding `hidden`.

## 8. MDX authoring

- Start with the MDX license header `{/* … */}`.
- No `h1`; templates render the title. Use `##` for sections, `###` for
  subsections (they feed the table of contents).
- Every code fence names a language (` ```ts `, ` ```tsx `, ` ```css `,
  ` ```bash `, ` ```text `). Code samples follow this standard too (no
  semicolons in TS).
- Use `<Callout type="note | tip | warning | danger">` for asides; no import
  needed.
- Tables for comparisons; keep cells short.
- Placeholder or example content starts with a warning callout.
- British or American spelling: be consistent within a page.

## 9. Error handling and logging

- Wrap all `localStorage` and `JSON.parse` access in `try`/`catch`; fall back
  to empty state; comment empty `catch` blocks with the reason.
- Never leave a promise floating **[tool: no-floating-promises]**: `await`
  it, return it, or mark it `void` deliberately.
- New async UI must have a failure state (see RSK-04 for existing gaps).
- No `console.log` in committed code. `console.error` only for genuinely
  unexpected failures.

## 10. Adapted "Power of Ten" rules (Holzmann, NASA/JPL)

| #  | Original rule (C)                                  | Adaptation for this code base                                          |
| -- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| 1  | Simple control flow; no goto or recursion           | No recursion over external data; early returns instead of deep nesting |
| 2  | Fixed upper bound on loops                          | Loops over external or stored data are bounded (`slice(0, limit)`)    |
| 3  | No dynamic memory after initialisation              | Not applicable to JS; instead: create services, stores and lazy bodies once at module load |
| 4  | Functions fit on one page (~60 lines)               | Components and functions ≤ ~80 lines of logic; extract otherwise       |
| 5  | Two assertions per function                         | Guard clauses on inputs at trust boundaries (storage, URL params, forms) |
| 6  | Smallest possible scope for data                    | `const` by default; state in the lowest component that needs it       |
| 7  | Check every return value and parameter              | Handle `undefined` from lookups; handle or deliberately ignore promises |
| 8  | Limited preprocessor use                            | No code generation at runtime; build-time only (MDX, Shiki, RSS)       |
| 9  | Restrict pointer use                                | No mutation of shared objects outside their owning service or store    |
| 10 | Compile with all warnings, zero warnings            | `npm run checkstyle` and `npm run build` must be clean                 |

## 11. Testing (from milestone M5)

- Vitest for unit and component tests, Playwright for end-to-end.
- Files: `src/**/__tests__/<Subject>.test.ts(x)`, `e2e/<journey>.spec.ts`.
- Test names start with the test case ID: `it('TC-CHAT-03 truncates titles at 40 characters', …)`.
- Inject fakes through `ServiceProvider`; do not mock modules when a
  service double works.
- Test files follow every rule in this document, including the license
  header.

## 12. Examples of the preferred style

```tsx
import type {ReactNode} from 'react'
import {DocHeader} from '../components/DocHeader'
import type {Project} from '../types/type'

export function ProjectSummary({
  project,
  actions,
}: {
  project: Project
  actions?: ReactNode
}) {
  return (
    <DocHeader
      crumbs={[
        {label: 'Projects', to: '/projects'},
        {label: project.title},
      ]}
      title={project.title}
      summary={project.summary}
      actions={actions}
    />
  )
}
```

```ts
function readRows<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? (value as T[]) : []
  } catch {
    return []
  }
}
```

## Change log

| Date       | Change                                         | Author                    |
| ---------- | ---------------------------------------------- | ------------------------- |
| 2026-10-15 | Owner placeholder replaced with a full draft   | Claude, for swemre review |
