#!/bin/bash
# Deployment script — runs on the GCE VM, called by GitHub Actions over SSH.
#
# Usage: deploy.sh <IMAGE_TAG>
#
# Reads secrets from /opt/temple-passport/.env.prod (never committed to git).
# Pulls the new backend image, does a rolling restart, health-checks,
# and rolls back to the previous tag if the backend fails to become healthy.

set -euo pipefail

IMAGE_TAG=${1:?Usage: deploy.sh <IMAGE_TAG>}
APP_DIR=/opt/temple-passport
ENV_FILE=$APP_DIR/.env.prod
COMPOSE="docker compose --env-file $ENV_FILE -f $APP_DIR/docker-compose.prod.yml"
REGISTRY=asia-south1-docker.pkg.dev

# ── Preflight ────────────────────────────────────────────────────────────────

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Run scripts/gce-setup.sh first."
  exit 1
fi

source "$ENV_FILE"
IMAGE=$REGISTRY/$GCP_PROJECT_ID/temple-passport/backend

echo "[deploy] Image: $IMAGE:$IMAGE_TAG"

# ── Pull new image ───────────────────────────────────────────────────────────

echo "[deploy] Authenticating Docker to Artifact Registry..."
gcloud auth configure-docker $REGISTRY --quiet

echo "[deploy] Pulling $IMAGE:$IMAGE_TAG ..."
docker pull "$IMAGE:$IMAGE_TAG"

# ── Save previous tag for rollback ───────────────────────────────────────────

PREV_TAG=$(grep '^IMAGE_TAG=' "$ENV_FILE" | cut -d= -f2 || echo "latest")
echo "[deploy] Previous tag: $PREV_TAG → New tag: $IMAGE_TAG"

# ── Update env file ──────────────────────────────────────────────────────────

sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$IMAGE_TAG/" "$ENV_FILE"

# ── Rolling restart (backend only — postgres and nginx stay up) ──────────────

echo "[deploy] Starting new backend container..."
$COMPOSE up -d --no-deps --no-build backend

# ── Health check ─────────────────────────────────────────────────────────────

echo "[deploy] Waiting for backend to become healthy..."
MAX_RETRIES=42   # 42 × 10s = 7 minutes
RETRY=0
STATUS="starting"

while [ $RETRY -lt $MAX_RETRIES ]; do
  CONTAINER_ID=$($COMPOSE ps -q backend 2>/dev/null || true)
  if [ -n "$CONTAINER_ID" ]; then
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID" 2>/dev/null || echo "unknown")
  fi

  if [ "$STATUS" = "healthy" ]; then
    echo "[deploy] Backend is healthy."
    break
  fi

  RETRY=$((RETRY + 1))
  echo "[deploy] [$RETRY/$MAX_RETRIES] Status: $STATUS — retrying in 10s..."
  sleep 10
done

# ── Handle unhealthy result ──────────────────────────────────────────────────

if [ "$STATUS" != "healthy" ]; then
  echo ""
  echo "[deploy] ERROR: Backend failed to become healthy after $((MAX_RETRIES * 10))s."
  echo "[deploy] Last 50 log lines:"
  $COMPOSE logs backend --tail=50 || true
  echo ""
  echo "[deploy] Rolling back to $PREV_TAG..."
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$PREV_TAG/" "$ENV_FILE"
  $COMPOSE up -d --no-deps --no-build backend
  echo "[deploy] Rollback complete. Previous version restored."
  exit 1
fi

# ── Reload nginx (picks up any config or admin-dist changes) ─────────────────

echo "[deploy] Reloading nginx..."
$COMPOSE exec -T nginx nginx -s reload || true

# ── Cleanup old images ───────────────────────────────────────────────────────

echo "[deploy] Pruning unused Docker images..."
docker image prune -f --filter "until=24h" || true

echo ""
echo "[deploy] Deployment complete. Running: $IMAGE:$IMAGE_TAG"
