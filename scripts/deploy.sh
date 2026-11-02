#!/usr/bin/env bash
# Builds the website and publishes it on the server over SSH.
#
#   npm run deploy                 build, upload and publish
#   ROLLBACK=1 npm run deploy      publish the previous build again
#
# SSH_HOST, SSH_KEY and VITE_READ_KEY come from the shell or from .env.deploy.local (ignored by
# git); values already set in the shell win over the file. The build ignores .env.local: every
# VITE_* setting is set here, so a local read key or API base never reaches production.
# The build is copied next to the API stack on the server, and deploy/publish-site.sh there
# uploads it to the Garage bucket that serves the site. The previous build stays on the server
# as site-build.prev for ROLLBACK=1. No storage key is needed here.
# Optional:
#   VITE_API_BASE       the public API base, default https://api.swemre.com/api
#   VITE_CHANNEL_KEY    the website channel the site reads, default swemre-website
#   VITE_SITE_URL       where the site is served, default https://swemre.com
#   VITE_LOCALE, VITE_API_TIMEOUT_MS   default en and 10000
#   REMOTE_DIR          where swemre-website-api lives on the server, default swemre-website-api
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

: "${SSH_HOST:?Set SSH_HOST, for example deploy@31.187.76.148}"
REMOTE_DIR="${REMOTE_DIR:-swemre-website-api}"
REMOTE_BUILD="$REMOTE_DIR/deploy/site-build"
SSH=(ssh -o BatchMode=yes)
if [ -n "${SSH_KEY:-}" ]; then
  SSH+=(-i "$SSH_KEY")
fi

if [ "${ROLLBACK:-}" = "1" ]; then
  echo "Publishing the previous build again"
  "${SSH[@]}" "$SSH_HOST" "cd '$REMOTE_DIR/deploy' && test -d site-build.prev && ./publish-site.sh site-build.prev"
  exit 0
fi

: "${VITE_READ_KEY:?Set VITE_READ_KEY to the read key of the production website channel}"
export VITE_API_MODE=live
# The build writes rss.xml and sitemap.xml from the API and fails if it cannot reach it
export VITE_FEEDS_REQUIRED=1
export VITE_API_BASE="${VITE_API_BASE:-https://api.swemre.com/api}"
export VITE_CHANNEL_KEY="${VITE_CHANNEL_KEY:-swemre-website}"
export VITE_SITE_URL="${VITE_SITE_URL:-https://swemre.com}"
export VITE_LOCALE="${VITE_LOCALE:-en}"
export VITE_API_TIMEOUT_MS="${VITE_API_TIMEOUT_MS:-10000}"

if [ "${SKIP_INSTALL:-}" != "1" ]; then
  npm ci
fi
npm run build

echo "Copying the build to $SSH_HOST:$REMOTE_BUILD (the previous one becomes site-build.prev)"
tar -czf - -C dist . | "${SSH[@]}" "$SSH_HOST" \
  "rm -rf '$REMOTE_BUILD.next' && mkdir -p '$REMOTE_BUILD.next' && tar -xzf - -C '$REMOTE_BUILD.next' && { if [ -d '$REMOTE_BUILD' ]; then rm -rf '$REMOTE_BUILD.prev' && mv '$REMOTE_BUILD' '$REMOTE_BUILD.prev'; fi; } && mv '$REMOTE_BUILD.next' '$REMOTE_BUILD'"

# The server's deploy/refresh-site.sh reran the V3 rss, sitemap and pre-render scripts from this
# copy. V4 has none of them, so copying the V4 sources here keeps that refresh from republishing
# a V3 build; it fails until the server side is updated for V4.
REMOTE_REFRESH="$REMOTE_DIR/deploy/site-refresh"
echo "Copying the refresh scripts to $SSH_HOST:$REMOTE_REFRESH"
tar -czf - scripts src package.json | "${SSH[@]}" "$SSH_HOST"   "rm -rf '$REMOTE_REFRESH' && mkdir -p '$REMOTE_REFRESH' && tar -xzf - -C '$REMOTE_REFRESH'"
printf 'VITE_API_BASE=%s
VITE_SITE_URL=%s
VITE_CHANNEL_KEY=%s
VITE_READ_KEY=%s
VITE_LOCALE=%s
'   "$VITE_API_BASE" "${VITE_SITE_URL:-}" "${VITE_CHANNEL_KEY:-}"   "${VITE_READ_KEY:-}" "${VITE_LOCALE:-}" | "${SSH[@]}" "$SSH_HOST" "cat > '$REMOTE_REFRESH/site.env'"

echo "Publishing"
"${SSH[@]}" "$SSH_HOST" "cd '$REMOTE_DIR/deploy' && ./publish-site.sh site-build"
