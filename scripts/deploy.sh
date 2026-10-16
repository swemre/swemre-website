#!/usr/bin/env bash
# Builds the website and publishes it on the server over SSH.
#
#   SSH_HOST=deploy@31.187.76.148 npm run deploy
#
# The build is copied next to the API stack on the server, and deploy/publish-site.sh there
# uploads it to the Garage bucket that serves the site. No storage key is needed here.
# Optional:
#   SSH_KEY             private key for the server, for example ~/.ssh/swemre-deploy
#   VITE_API_BASE       the public API base, default https://api.swemre.com/api
#   VITE_WORKSPACE_KEY  the workspace the site reads, default swemre-website
#   REMOTE_DIR          where swemre-website-api lives on the server, default swemre-website-api
#   SKIP_INSTALL=1      keeps the installed packages, for example while a dev server is running
# swemre-blocks must sit next to this project. The build writes public/rss.xml from the
# published posts, so the API must be reachable.
set -euo pipefail

: "${SSH_HOST:?Set SSH_HOST, for example deploy@31.187.76.148}"
export VITE_API_BASE="${VITE_API_BASE:-https://api.swemre.com/api}"
REMOTE_DIR="${REMOTE_DIR:-swemre-website-api}"
REMOTE_BUILD="$REMOTE_DIR/deploy/site-build"
SSH=(ssh -o BatchMode=yes)
if [ -n "${SSH_KEY:-}" ]; then
  SSH+=(-i "$SSH_KEY")
fi

cd "$(dirname "$0")/.."
if [ "${SKIP_INSTALL:-}" != "1" ]; then
  npm ci
fi
npm run build

echo "Copying the build to $SSH_HOST:$REMOTE_BUILD"
tar -czf - -C dist . | "${SSH[@]}" "$SSH_HOST" \
  "rm -rf '$REMOTE_BUILD' && mkdir -p '$REMOTE_BUILD' && tar -xzf - -C '$REMOTE_BUILD'"

echo "Publishing"
"${SSH[@]}" "$SSH_HOST" "cd '$REMOTE_DIR/deploy' && ./publish-site.sh site-build"
