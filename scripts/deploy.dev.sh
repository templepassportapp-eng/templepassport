#!/bin/bash
# Dev deployment script — runs on the dev GCE VM, called by GitHub Actions over SSH.
#
# Usage: deploy.dev.sh
#
# Simpler than deploy.sh (prod): always uses IMAGE_TAG=dev, no rollback needed.

set -euo pipefail

APP_DIR=/opt/temple-passport
ENV_FILE=$APP_DIR/.env.dev
COMPOSE="docker compose --env-file $ENV_FILE -f $APP_DIR/docker-compose.dev.yml"
REGISTRY=asia-south1-docker.pkg.dev

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Run scripts/gce-setup-dev.sh first."
  exit 1
fi

source "$ENV_FILE"
IMAGE=$REGISTRY/$GCP_PROJECT_ID/temple-passport/backend

echo "[dev-deploy] Pulling $IMAGE:dev ..."
gcloud auth configure-docker $REGISTRY --quiet
docker pull "$IMAGE:dev"

echo "[dev-deploy] Ensuring postgres is running..."
$COMPOSE up -d --no-build postgres
sleep 5

echo "[dev-deploy] Restarting backend..."
$COMPOSE up -d --no-deps --no-build backend

echo "[dev-deploy] Waiting for backend to become healthy (max 5 min)..."
MAX_RETRIES=30
RETRY=0
STATUS="starting"

while [ $RETRY -lt $MAX_RETRIES ]; do
  CONTAINER_ID=$($COMPOSE ps -q backend 2>/dev/null || true)
  if [ -n "$CONTAINER_ID" ]; then
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID" 2>/dev/null || echo "unknown")
  fi
  [ "$STATUS" = "healthy" ] && break
  RETRY=$((RETRY + 1))
  echo "[dev-deploy] [$RETRY/$MAX_RETRIES] Status: $STATUS — retrying in 10s..."
  sleep 10
done

if [ "$STATUS" != "healthy" ]; then
  echo "[dev-deploy] ERROR: Backend unhealthy after $((MAX_RETRIES * 10))s."
  $COMPOSE logs backend --tail=30 || true
  exit 1
fi

echo "[dev-deploy] Reloading nginx..."
$COMPOSE exec -T nginx nginx -s reload || true

echo "[dev-deploy] Pruning old images..."
docker image prune -f --filter "until=2h" || true

echo "[dev-deploy] Done."
