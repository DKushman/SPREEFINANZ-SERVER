#!/usr/bin/env bash
# Restore a PostgreSQL database from a dump file.
# Usage: ./scripts/restore.sh <db_name> <dump_file>
#   db_name: devdesign_db | preiseberechnen_db
#   dump_file: path to .sql dump (e.g. backups/devdesign_db_20250101_120000.sql)
# WARNING: Restore overwrites existing data. Use only on empty DB or after confirmation.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infra"

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <db_name> <dump_file>"
  echo "  db_name: devdesign_db | preiseberechnen_db"
  echo "  dump_file: path to .sql dump file"
  exit 1
fi

DB_NAME="$1"
DUMP_FILE="$2"

if [[ "$DB_NAME" != "devdesign_db" && "$DB_NAME" != "preiseberechnen_db" ]]; then
  echo "db_name must be devdesign_db or preiseberechnen_db"
  exit 1
fi

if [[ "$DUMP_FILE" != /* ]]; then
  DUMP_FILE="$REPO_ROOT/$DUMP_FILE"
fi
if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file not found: $DUMP_FILE"
  exit 1
fi

cd "$INFRA_DIR"
if [[ ! -f .env ]]; then
  echo "Missing infra/.env"
  exit 1
fi

# shellcheck source=/dev/null
source .env
export PGPASSWORD="${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD}"
USER="${POSTGRES_USER:-postgres}"

echo "Restoring $DB_NAME from $DUMP_FILE (this may overwrite data)."
read -r -p "Continue? [y/N] " reply
if [[ "${reply,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

docker compose exec -T postgres psql -U "$USER" -d "$DB_NAME" < "$DUMP_FILE"
unset PGPASSWORD
echo "Restore completed for $DB_NAME."
