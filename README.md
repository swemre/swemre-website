# swemre-website

The personal website at [swemre.com](https://swemre.com): articles, projects, the liked songs, a
newsletter, and the contact, resume and call back forms. Built with React 19, TypeScript,
Vite 8 and React Router 7, with plain CSS from the V4 design system (`src/design`).

The site bundles no content. Everything comes from one website channel of **SWEPress public
API v2**, read with a read key. A page's section (category) and its reserved `layout-*` tag pick
its template. `docs/mock-api.md` describes every endpoint, error and fault, and the content model.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: the defaults run the mock
npm run dev                  # http://localhost:5173
```

### Mock or live

| `VITE_API_MODE`  | Where the data comes from                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mock` (default) | The Vite plugin in `mock/` answers `/api/public/v2/...` from `mock/seed/*.json`. It works in `npm run dev` and `npm run preview`; no backend is needed. |
| `live`           | The site calls `VITE_API_BASE` with `VITE_CHANNEL_KEY` and `VITE_READ_KEY`, for example the local SWEPress API at `http://localhost:8080/api`.          |

`.env.example` lists every setting:

- the API mode and base
- the channel and its read key
- the site URL and locale
- the read timeout

### Dev switches (dev server, or any mock build)

- `?state=articles:loading,songs:error` forces data hooks into the loading, empty or error state.
- `?fault=503` makes the mock fail every call with that status. It also takes `timeout`, `slow`,
  or a single resource such as `?fault=songs:500`.
- `?seed=0` shows the boards' songs in board order.
- In any form, an email starting with `fail@` gets `504`, and one starting with `slow@` is
  answered after 3 s.

## Layout

| Path             | What                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `src/contract/`  | Wire types of API v2, view models, blocks, forms and the template map |
| `src/data/`      | API client, cache and hooks, adapters, template rules, route resolver |
| `src/design/`    | Design tokens, components, site shell                                 |
| `src/templates/` | One template per page kind                                            |
| `src/forms/`     | The form template: newsletter, contact, resume and call back          |
| `mock/`          | The mock API plugin, seed content and media                           |
| `docs/`          | `mock-api.md`                                                         |

## Scripts

```bash
npm run dev          # dev server with the mock API
npm run build        # type check (tsc -b) and production build into dist/
npm run preview      # serve dist/ (the mock API too, when VITE_API_MODE=mock)
npm run typecheck    # tsc -b
npm run lint         # eslint .
npm run checkstyle   # ESLint, Prettier and license headers
npm run v4:shoot -- --base http://localhost:5173 --boards ../v4-ref/boards   # site shots per board state
npm run v4:boards -- --boards ../v4-ref/boards   # board frames + v4-shots/report.html
```

`v4:shoot` starts nothing, so run `npm run dev` first. Both commands take `--vp m,t,d,4k`,
`--theme dark,light`, `--only Home,Contact` and `--out` (default `v4-shots/`). Playwright comes
from the project or from the global `node_modules`.

Every source file starts with the license header from `src/main.tsx`
(`node scripts/license-headers.mjs --fix` adds it).

## Deploy

### Cloudflare (from 1.0.0-ALPHA)

The site is a static build with a pre-rendered page per route, served by Cloudflare as static
assets (`wrangler.jsonc`, no Worker code). `scripts/deploy-cloudflare.sh` builds it for the
production API, adds `404.html` (the app shell, answered with status 404 for unknown routes) and
`_headers` (`cloudflare/_headers`: HSTS, nosniff, referrer policy, a year of cache for the hashed
bundles), then runs `wrangler deploy`.

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... VITE_READ_KEY=... npm run deploy:cloudflare
```

- The variables can also sit in `.env.deploy.local` (ignored by git), one `NAME=value` per line;
  a variable already set in the shell wins over the file.
- `VITE_READ_KEY` is the read key of the website channel (`VITE_CHANNEL_KEY`, default
  `swemre-website`), created in SWE-Press. The script refuses to deploy without it.
- The token needs the **Workers Scripts: Edit** permission. Without it, wrangler signs in through
  the browser.
- `/articles/foo` serves `articles/foo/index.html`, and `/articles/foo/` redirects to it, so the
  canonical URLs keep no trailing slash.
- `DRY_RUN=1` builds and checks the upload without deploying.
- With `SSH_HOST` (and `SSH_KEY`) it also copies the build and the refresh scripts to the server,
  where `refresh-site.sh` in `swemre-website-api` keeps the feeds and pre-rendered pages current
  between deploys.

Once, on the day the site leaves the VPS: in the Cloudflare dashboard, open Workers & Pages >
swemre-website > Settings > Domains & Routes, add `swemre.com` and `www.swemre.com` as custom
domains (this replaces their A records), and add a redirect rule from `www.swemre.com/*` to
`https://swemre.com/${1}`.

### VPS (until 1.0.0-ALPHA)

The build is served by Garage (open source S3 storage) on the server; see `deploy/README.md` in
`swemre-website-api`. `scripts/deploy.sh` builds it for the production API, copies it to the
server over SSH and publishes it there: hashed bundles are cached for a year, everything else is
revalidated. No storage key is needed on your machine.

```bash
SSH_HOST=deploy@31.187.76.148 SSH_KEY=~/.ssh/swemre-deploy npm run deploy
```

Traefik answers routes like `/articles/<slug>` with `index.html`, so they work on reload.
`SKIP_INSTALL=1` skips `npm ci`, for example while a dev server is running.

## License

Personal use is permitted; commercial use needs written permission. See `LICENSE` and `NOTICE`.
