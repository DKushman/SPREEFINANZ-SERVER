#!/usr/bin/env bash
# Deploy: build and start all services from repo root.
# Usage: ./scripts/deploy.sh
# Run after git pull. Requires Docker and Docker Compose.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infra"

cd "$INFRA_DIR"
if [[ ! -f .env ]]; then
  echo "Missing infra/.env – copy from .env.example and set values."
  exit 1
fi

docker compose build --pull
docker compose up -d

echo "Deploy done. Check: docker compose -f $INFRA_DIR/compose.yml ps"
