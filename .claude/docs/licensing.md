# Licensing and file headers

## Terms

Copyright 2026 **swemre**, contact **emre@swemre.com**.

Licensed under the **Apache License 2.0 + Commons Clause License Condition
v1.0** (`LICENSE`, `NOTICE`).

- Personal use, study and modification of the code and content: allowed.
- "Selling" the software (including hosted or consulting services whose value
  derives substantially from it): **not allowed** without written permission.
- Any commercial gain requires prior written permission: emre@swemre.com.

Caveats worth remembering:

- Plain Apache-2.0 **does** allow commercial use; the Commons Clause is what
  restricts selling. The Commons Clause targets "Sell", not every conceivable
  commercial benefit. For a stricter non-commercial-only license, consider
  PolyForm Noncommercial 1.0.0 (a deliberate swap, owner's call).
- Apache + Commons Clause is source-available, not OSI "open source".
- Article text is covered by the same license (`LICENSE` names "article
  content"). If the owner wants different terms for prose (for example
  CC BY-NC 4.0), split them explicitly.
- Not legal advice; have a lawyer review before relying on it.

## Per-file header

Applies to `.ts .tsx .js .mjs .css .mdx .html`. Comment syntax varies:

```ts
/**
 * Copyright 2026 swemre (emre@swemre.com). All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 with the Commons Clause
 * License Condition v1.0 (the "License"). Personal use of this code and
 * content is permitted; any commercial gain requires prior written
 * permission from the copyright holder. See the LICENSE file for full terms.
 *
 * Contact: emre@swemre.com
 */
```

- CSS uses `/* … */`, MDX uses `{/* … */}`, HTML uses `<!-- … -->` placed
  after `<!doctype html>`.
- JSON/Markdown/SVG and lockfiles have no header.

## How it is enforced

- **Source of truth**: `scripts/license-headers.mjs` (`YEAR`, wording, per
  extension comment style).
- **Check**: `npm run checkstyle` fails listing files with no
  `Copyright <year> swemre` marker in the first 1200 characters.
- **Fix**: `npm run checkstyle:fix` prepends missing headers.
- **Editor**: the `psioniq.psi-header` extension, configured in
  `.vscode/settings.json`, inserts the same header automatically when a new
  file is created and saved (`autoHeader: autoSave`). It uses the current
  year (`<<year>>`), so a file created in 2027 gets 2027.
- **Claude**: when creating any file of the above types, add the header (or run
  `checkstyle:fix` afterward).

When changing wording, update **both** `license-headers.mjs` and the
`psi-header.templates` block in `.vscode/settings.json`.
