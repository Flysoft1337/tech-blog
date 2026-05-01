#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${DEPLOY_HOST:-root@your-server-ip}"
REMOTE_DIR="/opt/blog"

echo "==> Building..."
pnpm build

echo "==> Syncing API server..."
rsync -avz --delete \
  apps/server/dist/ \
  "${SERVER_HOST}:${REMOTE_DIR}/server/dist/"

echo "==> Syncing web (Astro SSR)..."
rsync -avz --delete \
  apps/web/dist/ \
  "${SERVER_HOST}:${REMOTE_DIR}/web/dist/"

echo "==> Syncing config..."
rsync -avz \
  ecosystem.config.cjs \
  Caddyfile \
  "${SERVER_HOST}:${REMOTE_DIR}/"

echo "==> Syncing node_modules (server deps)..."
rsync -avz \
  apps/server/node_modules/ \
  "${SERVER_HOST}:${REMOTE_DIR}/server/node_modules/" \
  --delete

echo "==> Ensuring data directories..."
ssh "${SERVER_HOST}" "mkdir -p ${REMOTE_DIR}/data/uploads"

echo "==> Restarting PM2..."
ssh "${SERVER_HOST}" "cd ${REMOTE_DIR} && pm2 startOrRestart ecosystem.config.cjs --update-env && pm2 save"

echo "==> Done!"
echo "    API:  http://server:3000"
echo "    Web:  http://server:4321"
echo "    Site: http://server (via Caddy)"
