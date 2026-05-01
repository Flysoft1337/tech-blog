#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${DEPLOY_HOST:-root@your-server-ip}"
REMOTE_DIR="/opt/blog"

echo "==> Building..."
pnpm build

echo "==> Syncing API server..."
rsync -avz --delete \
  apps/server/dist/ \
  apps/server/package.json \
  "${SERVER_HOST}:${REMOTE_DIR}/server/"

echo "==> Syncing web (Astro SSR)..."
rsync -avz --delete \
  apps/web/dist/ \
  "${SERVER_HOST}:${REMOTE_DIR}/web/dist/"

rsync -avz apps/web/package.json "${SERVER_HOST}:${REMOTE_DIR}/web/"

echo "==> Syncing config & lockfile..."
rsync -avz \
  ecosystem.config.cjs \
  Caddyfile \
  pnpm-lock.yaml \
  package.json \
  "${SERVER_HOST}:${REMOTE_DIR}/"

echo "==> Installing dependencies on server..."
ssh "${SERVER_HOST}" "cd ${REMOTE_DIR}/server && npm install --omit=dev --ignore-scripts 2>/dev/null || pnpm install --prod"

echo "==> Ensuring data directories..."
ssh "${SERVER_HOST}" "mkdir -p ${REMOTE_DIR}/data/uploads"

echo "==> Restarting PM2..."
ssh "${SERVER_HOST}" "cd ${REMOTE_DIR} && pm2 startOrRestart ecosystem.config.cjs --update-env && pm2 save"

echo "==> Done!"
echo "    API:  http://server:3000"
echo "    Web:  http://server:4321"
echo "    Site: http://server (via Caddy)"
