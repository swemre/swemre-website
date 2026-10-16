# Architecture Decision Records (ADR)

| Field       | Value                         |
| ----------- | ----------------------------- |
| Document ID | SWE-DOC-012                   |
| Status      | Draft for owner review        |
| Baseline    | 2026-10-15                    |
| Owner       | swemre                        |

Format per record: **Status** (Proposed, Accepted, Superseded), **Context**,
**Decision**, **Consequences**. Records are never deleted; a reversed
decision is marked Superseded with a link to its replacement.

---

## ADR-001 Static SPA with Vite, React 19 and the React Compiler

- **Status**: Accepted (M0)
- **Context**: Personal site, no server, owner wants modern React and fast
  local development.
- **Decision**: Vite 8 (Rolldown) SPA, React 19, React Compiler via the Babel
  preset, React Router 7 with one layout route.
- **Consequences**: Simple static hosting; no SEO pre-rendering (SRS-FUT-04);
  React Compiler rules (`react-hooks/refs`, `static-components`) shape some
  code (ADR-007, ADR-009).

## ADR-002 Content in MDX, metadata in typed arrays

- **Status**: Accepted (M0)
- **Context**: Articles need prose, code and occasional components; metadata
  must be typed and queryable without parsing front matter.
- **Decision**: Bodies in `src/page/<folder>/<slug>.mdx`; metadata in
  `src/database/*.ts`. Bodies discovered by `import.meta.glob`.
- **Consequences**: Two files per item, linked by slug; integrity test
  TC-ART-01 guards mismatches. MDX excluded from Prettier (it mangles
  `{/* */}` comments).

## ADR-003 Generic async service layer

- **Status**: Accepted (M2)
- **Context**: Owner wants a local "database" now and a backend later.
- **Decision**: `SwemreService<T>` with Promise-returning CRUD; array and
  localStorage implementations; typed registry via `ServiceContext`;
  `useService(name)`.
- **Consequences**: Components are backend-agnostic and testable with fake
  services; slight ceremony for static data.

## ADR-004 Visitor state in localStorage via an external store

- **Status**: Accepted (M0)
- **Context**: Likes, saves and views per visitor without a server.
- **Decision**: `ArticleInteractionStore` on `useSyncExternalStore`, keyed by
  permanent article `id`, synced across tabs.
- **Consequences**: Article ids can never change; counts are per browser,
  not global.

## ADR-005 Google TypeScript Style (gts) as "checkstyle"

- **Status**: Accepted (M1)
- **Context**: Owner asked for the TypeScript equivalent of Google Java
  Checkstyle.
- **Decision**: gts 7 (ESLint 9 + Prettier), one `npm run checkstyle`
  command that also checks license headers; VS Code formats on save with the
  same config.
- **Consequences**: ESLint pinned to v9 until gts supports v10 (RSK-13).

## ADR-006 Apache 2.0 + Commons Clause, header in every file

- **Status**: Accepted (M1)
- **Context**: Personal use allowed, commercial gain only with permission.
- **Decision**: Apache 2.0 with Commons Clause v1.0; header enforced by
  script and inserted by the psi-header extension.
- **Consequences**: Source-available, not OSI open source. See
  `../licensing.md`.

## ADR-007 MDX bodies built at module load

- **Status**: Accepted (M2)
- **Context**: Creating `React.lazy` components during render violates
  `react-hooks/static-components` and remounts bodies.
- **Decision**: `lazyBodies(glob)` creates the lazy map once per module;
  pages pass the component to `MdxBody` as a prop.
- **Consequences**: Stable identities, one chunk per body.

## ADR-008 Token-only Tailwind v4 theme

- **Status**: Accepted (M2), extended (M4)
- **Context**: Owner wants every visual value managed in `main.css`.
- **Decision**: Clear Tailwind namespaces (`color`, `shadow`, `inset-shadow`,
  `drop-shadow`, `radius`, `font`, `text`, and since M4 `container`); define
  semantic tokens; dark mode as a variable swap under `[data-theme='dark']`.
  Layout sizes are tokens too, including fluid ones.
- **Consequences**: Off-system classes do not compile; adding a visual value
  always means adding a token.

## ADR-009 Persistent dock mounted by the layout route

- **Status**: Accepted (M3)
- **Context**: Music must keep playing across pages; chat must follow the
  visitor.
- **Decision**: `Dock` rendered in `SiteLayout`; one Spotify controller in
  `PlayerProvider`, host element registered from `SpotifyPanel` through
  `attachHost` in an effect (keeps refs out of context for the React
  Compiler); collapse with zero height, not unmount.
- **Consequences**: Player survives navigation; only one embed exists.

## ADR-010 Single type file

- **Status**: Accepted (M3). Supersedes the M2 "one type per file" rule.
- **Context**: Owner asked to merge all types.
- **Decision**: `src/types/type.d.ts`, sections separated by divider
  comments; no local interfaces elsewhere.
- **Consequences**: `skipLibCheck` skips `.d.ts` files, so type errors there
  are only found with `--skipLibCheck false` (checklist C-3).

## ADR-011 Decorative header band, wide fluid layout, token naming rule

- **Status**: Accepted (M4)
- **Context**: Owner wants content to fill a 1920 px screen, caps only on
  ultrawide screens, a short (~150 px) band without text or images, in
  primary tones with a grid, and no hard-coded sizes.
- **Decision**:
  - `--container-page` 150rem, `--container-wide` 160rem,
    `--container-reading` 80rem (revised 2026-10-15: 108rem, 116rem and
    75ch, a standard reading measure, after the owner found 150rem too
    wide; sidebar gaps widened to 3.5rem at lg and 5rem at xl), `--container-sidebar`
    `clamp(14rem, 14vw, 19rem)`.
  - `HeaderBand` is `aria-hidden`, `h-band` (`clamp(8.5rem, 16vh, 10rem)`),
    gradient `band-from → band-via → band-to` plus glow and grid.
  - Titles, breadcrumbs and meta move into the page body (`DocHeader`).
  - Article cover images removed.
  - Panel and dialog widths become fluid tokens (`w-dock`, `w-dialog`,
    `w-palette`).
  - **Naming rule**: never name a `--spacing-*` or `--container-*` token after
    a Tailwind utility keyword (`grid`, `flex`, `block`, `table`, `hidden`,
    `contents`, …). `--spacing-grid` generated `.inline-grid { inline-size }`
    and broke every `inline-grid` element; it was renamed `--spacing-band-cell`.
- **Consequences**: Long prose lines on wide screens (RSK-16); no hero
  imagery; one place to tune all sizes.

## ADR-012 Enable TypeScript strict mode

- **Status**: Proposed
- **Context**: `tsconfig.app.json` does not set `strict`; gts expects it.
- **Decision (proposed)**: Enable `strict: true`, fix the findings in one
  change.
- **Consequences**: Stronger null safety; a one-off clean-up.

## ADR-013 No semicolons

- **Status**: Accepted (M3)
- **Context**: Owner preference.
- **Decision**: Prettier `semi: false` plus ESLint `semi: ['error', 'never']`
  and `no-extra-semi`.
- **Consequences**: Lines starting with `(`, `[` or a template literal need
  restructuring (Prettier would insert a leading `;`).

## ADR-014 Synthesized interface sounds with delegated listeners

- **Status**: Accepted (M4)
- **Context**: Owner wants a sound for every button and key press, with a
  mute switch.
- **Decision**: Generate sounds with the Web Audio API (oscillator plus gain
  envelope per recipe) instead of audio files; attach two capture-phase
  document listeners in `SoundProvider` that classify the event target;
  let elements override with `data-sound` / `data-sound-enter`; persist mute
  in `localStorage`.
- **Consequences**: Zero downloads and no per-component wiring; new
  controls get sounds automatically. Sounds are simple tones rather than
  recorded samples. Elements that trigger their own event sound must opt
  out of the default to avoid doubles.

## ADR-015 Append-only feed log drives RSS

- **Status**: Accepted (M4)
- **Context**: The feed covered articles only, regenerated a new
  `lastBuildDate` on every run and could not announce projects, songs or
  notes.
- **Decision**: `feedDatabase.ts` lists every announcement once with a
  permanent id and date; the generator resolves references, validates
  completeness and fails the build on problems; skills add entries.
- **Consequences**: One more file to touch per content item (automated by
  skills); deterministic output; feed readers see stable GUIDs.

## Change log

| Date       | Change                          | Author                    |
| ---------- | ------------------------------- | ------------------------- |
| 2026-10-15 | Records written for M0 to M4    | Claude, for swemre review |
