#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${DEPLOY_HOST:-root@your-server-ip}"
REMOTE_DIR="/opt/blog"

echo "==> Building..."
pnpm build

echo "==> Syncing server..."
rsync -avz --delete \
  apps/server/dist/ \
  "${SERVER_HOST}:${REMOTE_DIR}/server/dist/"

echo "==> Syncing web..."
rsync -avz --delete \
  apps/web/dist/ \
  "${SERVER_HOST}:${REMOTE_DIR}/public/"

echo "==> Syncing config..."
rsync -avz \
  ecosystem.config.cjs \
  "${SERVER_HOST}:${REMOTE_DIR}/"

echo "==> Syncing shared node_modules..."
rsync -avz --delete \
  node_modules/ \
  "${SERVER_HOST}:${REMOTE_DIR}/node_modules/" \
  --include='better-sqlite3/***' \
  --include='drizzle-orm/***' \
  --include='fastify/***' \
  --include='fastify-plugin/***' \
  --include='@fastify/***' \
  --include='bcryptjs/***' \
  --include='marked/***' \
  --include='sanitize-html/***' \
  --include='*/' \
  --exclude='*'

echo "==> Restarting PM2..."
ssh "${SERVER_HOST}" "cd ${REMOTE_DIR} && pm2 startOrRestart ecosystem.config.cjs --update-env"

echo "==> Done!"
