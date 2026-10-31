#!/usr/bin/env bash
# Builds the website and deploys it to Cloudflare (static assets, wrangler.jsonc).
#
#   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... VITE_READ_KEY=... npm run deploy:cloudflare
#
# VITE_READ_KEY is the read key of the website channel (public API v2), created in SWE-Press.
# Needs a Cloudflare API token with the "Workers Scripts: Edit" permission on the account.
# Without CLOUDFLARE_API_TOKEN, wrangler signs in through the browser instead.
# The variables can also sit in .env.deploy.local (ignored by git); values already set in the
# shell win over the file.
# Optional:
#   VITE_API_BASE       the public API base, default https://api.swemre.com/api
#   VITE_CHANNEL_KEY    the website channel the site reads, default swemre-website
#   VITE_SITE_URL       where the site is served, default https://swemre.com
#   VITE_LOCALE and the other VITE_* settings (.env.example)
#   SSH_HOST            also copies the build and the refresh scripts to the server, so its
#                       refresh-site.sh can keep the feeds and pre-rendered pages current
#   SSH_KEY             private key for the server, for example ~/.ssh/swemre-deploy
#   REMOTE_DIR          where swemre-website-api lives on the server, default swemre-website-api
#   DRY_RUN=1           builds and checks the upload without deploying
#   SKIP_INSTALL=1      keeps the installed packages, for example while a dev server is running
# The build runs in live mode: the site reads the API in the browser, and the build machine must
# reach the API to write rss.xml and sitemap.xml.
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -f .env.deploy.local ]; then
  while IFS='=' read -r key value || [ -n "$key" ]; do
    case "$key" in '' | '#'*) continue ;; esac
    value="${value%$'\r'}"
    value="${value/#\~/$HOME}"
    if [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < .env.deploy.local
fi

export VITE_API_MODE=live
# The build writes rss.xml and sitemap.xml from the API and fails if it cannot reach it
export VITE_FEEDS_REQUIRED=1
export VITE_API_BASE="${VITE_API_BASE:-https://api.swemre.com/api}"
export VITE_CHANNEL_KEY="${VITE_CHANNEL_KEY:-swemre-website}"
export VITE_SITE_URL="${VITE_SITE_URL:-https://swemre.com}"
WRANGLER=(npx --yes wrangler@4.149.0)
if [ -z "${VITE_READ_KEY:-}" ] && [ "${DRY_RUN:-}" != "1" ]; then
  echo "Set VITE_READ_KEY to the website channel's read key" >&2
  exit 1
fi

if [ "${SKIP_INSTALL:-}" != "1" ]; then
  npm ci
fi
npm run build

# Routes without a pre-rendered page get the app shell with status 404 (wrangler.jsonc)
cp dist/index.html dist/404.html
cp cloudflare/_headers dist/_headers

if [ "${DRY_RUN:-}" = "1" ]; then
  "${WRANGLER[@]}" deploy --dry-run
else
  "${WRANGLER[@]}" deploy
fi

if [ -n "${SSH_HOST:-}" ]; then
  SSH=(ssh -o BatchMode=yes)
  if [ -n "${SSH_KEY:-}" ]; then
    SSH+=(-i "$SSH_KEY")
  fi
  REMOTE_DIR="${REMOTE_DIR:-swemre-website-api}"
  REMOTE_BUILD="$REMOTE_DIR/deploy/site-build"
  REMOTE_REFRESH="$REMOTE_DIR/deploy/site-refresh"
  echo "Copying the build and the refresh scripts to $SSH_HOST"
  tar -czf - -C dist . | "${SSH[@]}" "$SSH_HOST" \
    "rm -rf '$REMOTE_BUILD' && mkdir -p '$REMOTE_BUILD' && tar -xzf - -C '$REMOTE_BUILD'"
  tar -czf - scripts src package.json cloudflare wrangler.jsonc | "${SSH[@]}" "$SSH_HOST" \
    "rm -rf '$REMOTE_REFRESH' && mkdir -p '$REMOTE_REFRESH' && tar -xzf - -C '$REMOTE_REFRESH'"
  printf 'VITE_API_BASE=%s\nVITE_SITE_URL=%s\nVITE_CHANNEL_KEY=%s\nVITE_READ_KEY=%s\nVITE_LOCALE=%s\n' \
    "$VITE_API_BASE" "$VITE_SITE_URL" "$VITE_CHANNEL_KEY" "${VITE_READ_KEY:-}" "${VITE_LOCALE:-}" \
    | "${SSH[@]}" "$SSH_HOST" "cat > '$REMOTE_REFRESH/site.env'"
fi
