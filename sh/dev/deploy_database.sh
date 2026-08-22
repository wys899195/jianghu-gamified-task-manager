#!/bin/sh
# 部署 development 資料庫，建立 _dev database 並執行 development migrations。

set -eu

APP_ENV=development
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"

: "${MYSQL_DATABASE:? env MYSQL_DATABASE is required}"

case "$MYSQL_DATABASE" in
  *_dev|*_test)
    msg_error "MYSQL_DATABASE 不應該已經包含 _dev 或 _test 後綴。"
    exit 1
    ;;
esac

DATABASE_NAME="${MYSQL_DATABASE}_dev"

sh "$PROJECT_ROOT/sh/common/wait_for_mysql.sh"
sh "$PROJECT_ROOT/sh/common/ensure_database.sh" "$DATABASE_NAME"
sh "$PROJECT_ROOT/sh/common/run_migrations.sh" development
