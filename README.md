# swemre-website

The personal website at [swemre.com](https://swemre.com): articles, projects, songs, a chat
widget and a resume request form. Built with React 19, TypeScript, Vite, Tailwind CSS and MDX.

Content comes from one workspace of `swemre-website-api` and is written in `swemre-cms`. Block
content is rendered by `swemre-blocks`, the same view the CMS uses for its preview. Articles that
have a `<slug>.mdx` file in `src/page` use that file instead.

## Run locally

Start the API first (see its README), then:

```bash
npm install
npm run dev
```

The site runs on http://localhost:5173. It reads the workspace `swemre-website` from
`http://localhost:8080/api`; see `.env.example` to change either. `swemre-blocks` must sit next to
this folder; Vite and TypeScript resolve it by path.

## Content

- `npm run rss` writes `public/rss.xml` from the published posts. It runs before `dev` and `build`
  and keeps the existing file when the API cannot be reached.
- `scripts/import-content-to-api.mjs` is a one-time import of the content in `src/database` into a
  workspace. It skips posts that already exist, so it can run again:

  ```bash
  ADMIN_PASSWORD=... node --experimental-strip-types --no-warnings scripts/import-content-to-api.mjs
  ```

## Checks

```bash
npm run checkstyle   # ESLint, Prettier and license headers
npm run build        # type check and production build into dist/
```

## Deploy

The build is a static single page app, served by Garage (open source S3 storage) on the server;
see `deploy/README.md` in `swemre-website-api`. `scripts/deploy.sh` builds it for the production
API, copies it to the server over SSH and publishes it there: hashed bundles are cached for a
year, everything else is revalidated. No storage key is needed on your machine.

```bash
SSH_HOST=deploy@31.187.76.148 SSH_KEY=~/.ssh/swemre-deploy npm run deploy
```

Traefik answers routes like `/articles/<slug>` with `index.html`, so they work on reload.
`SKIP_INSTALL=1` skips `npm ci`, for example while a dev server is running.

## License

Personal use is permitted; commercial use needs written permission. See `LICENSE` and `NOTICE`.
