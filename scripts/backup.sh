#!/usr/bin/env bash
# Backup both PostgreSQL databases into ./backups/ (timestamped files).
# Usage: ./scripts/backup.sh
# Requires: run from repo root, Docker Compose stack running (postgres).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infra"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

cd "$INFRA_DIR"
if [[ ! -f .env ]]; then
  echo "Missing infra/.env"
  exit 1
fi

# shellcheck source=/dev/null
source .env
export PGPASSWORD="${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD}"
USER="${POSTGRES_USER:-postgres}"

docker compose exec -T postgres pg_dump -U "$USER" devdesign_db > "$BACKUP_DIR/devdesign_db_${TIMESTAMP}.sql"
docker compose exec -T postgres pg_dump -U "$USER" preiseberechnen_db > "$BACKUP_DIR/preiseberechnen_db_${TIMESTAMP}.sql"

unset PGPASSWORD
echo "Backups written to $BACKUP_DIR (devdesign_db_${TIMESTAMP}.sql, preiseberechnen_db_${TIMESTAMP}.sql)"
