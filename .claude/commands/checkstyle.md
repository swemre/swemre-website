---
description: Run the Google TypeScript Style check and fix what is safe to fix
---

1. Run `npm run checkstyle`.
2. If it fails on formatting or missing license headers, run
   `npm run checkstyle:fix`, then `npm run checkstyle` again.
3. For remaining ESLint errors, fix the code. Do not disable rules or add
   `eslint-disable` comments unless asked.
4. Report exactly what failed and what changed.
