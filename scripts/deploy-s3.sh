#!/usr/bin/env bash
# Builds the website and uploads it to its bucket on the Garage (S3 compatible) storage of the
# server.
#
#   S3_ENDPOINT=https://s3.swemre.com S3_BUCKET=swemre.com \
#   S3_ACCESS_KEY_ID=GK... S3_SECRET_ACCESS_KEY=... \
#   VITE_API_BASE=https://api.swemre.com/api npm run deploy:s3
#
# The key is printed by deploy/garage-init.sh in swemre-website-api. rclone does the upload: a
# local rclone when it is installed, otherwise the rclone Docker image.
# Optional: VITE_WORKSPACE_KEY (default swemre-website). swemre-blocks must sit next to this
# project, as it does locally. The build writes public/rss.xml from the published posts, so the
# API must be reachable.
set -euo pipefail

: "${S3_ENDPOINT:?Set S3_ENDPOINT, for example https://s3.swemre.com}"
: "${S3_BUCKET:?Set S3_BUCKET to the bucket name, which is the domain of the website}"
: "${S3_ACCESS_KEY_ID:?Set S3_ACCESS_KEY_ID to the deploy key ID}"
: "${S3_SECRET_ACCESS_KEY:?Set S3_SECRET_ACCESS_KEY to the deploy key secret}"
: "${VITE_API_BASE:?Set VITE_API_BASE to the public API base, for example https://api.swemre.com/api}"
export VITE_API_BASE

cd "$(dirname "$0")/.."
# SKIP_INSTALL=1 keeps the installed packages, for example while a dev server is running
if [ "${SKIP_INSTALL:-}" != "1" ]; then
  npm ci
fi
npm run build

# rclone reads the storage settings from these variables; "garage" is the remote name below
export RCLONE_CONFIG_GARAGE_TYPE=s3
export RCLONE_CONFIG_GARAGE_PROVIDER=Other
export RCLONE_CONFIG_GARAGE_ENDPOINT="$S3_ENDPOINT"
export RCLONE_CONFIG_GARAGE_REGION="${S3_REGION:-garage}"
export RCLONE_CONFIG_GARAGE_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID"
export RCLONE_CONFIG_GARAGE_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_GARAGE_FORCE_PATH_STYLE=true
# The deploy key may write to its bucket but not create buckets
export RCLONE_CONFIG_GARAGE_NO_CHECK_BUCKET=true

if command -v rclone > /dev/null 2>&1; then
  SOURCE=dist
  run_rclone() { rclone "$@"; }
else
  SOURCE=/dist
  HOST_DIST="$(pwd -W 2> /dev/null || pwd)/dist"
  run_rclone() {
    MSYS_NO_PATHCONV=1 docker run --rm -v "$HOST_DIST:/dist:ro" \
      -e RCLONE_CONFIG_GARAGE_TYPE -e RCLONE_CONFIG_GARAGE_PROVIDER -e RCLONE_CONFIG_GARAGE_ENDPOINT \
      -e RCLONE_CONFIG_GARAGE_REGION -e RCLONE_CONFIG_GARAGE_ACCESS_KEY_ID \
      -e RCLONE_CONFIG_GARAGE_SECRET_ACCESS_KEY -e RCLONE_CONFIG_GARAGE_FORCE_PATH_STYLE \
      -e RCLONE_CONFIG_GARAGE_NO_CHECK_BUCKET \
      rclone/rclone:1.69.1 "$@"
  }
fi

TARGET="garage:$S3_BUCKET"
IMMUTABLE="Cache-Control: public, max-age=31536000, immutable"

# Hashed bundles never change, so browsers may keep them for a year
run_rclone copy "$SOURCE/assets" "$TARGET/assets" --header-upload "$IMMUTABLE"
# Everything else, index.html and rss.xml included, is revalidated on every visit
run_rclone sync "$SOURCE" "$TARGET" --exclude "assets/**" --header-upload "Cache-Control: no-cache"
# Old bundles are removed last, once the new index.html points at the new ones
run_rclone sync "$SOURCE/assets" "$TARGET/assets" --header-upload "$IMMUTABLE"

echo "Deployed to $S3_BUCKET on $S3_ENDPOINT"
