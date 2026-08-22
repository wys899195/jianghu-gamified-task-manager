#!/bin/sh
# 部署 production 資料庫，執行正式 migration 前的安全檢查與初始化。

set -eu

APP_ENV=production
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"

: "${MYSQL_DATABASE:? env MYSQL_DATABASE is required}"
: "${ALLOW_PRODUCTION_MIGRATION:?正式資料庫 migration 需要設定 ALLOW_PRODUCTION_MIGRATION=true}"

if [ "$ALLOW_PRODUCTION_MIGRATION" != "true" ]; then
  msg_error "ALLOW_PRODUCTION_MIGRATION 必須是 true。"
  exit 1
fi

case "$MYSQL_DATABASE" in
  *_dev|*_test)
    msg_error "production 不允許使用 development 或 test 資料庫：$MYSQL_DATABASE"
    exit 1
    ;;
esac

sh "$PROJECT_ROOT/sh/common/wait_for_mysql.sh"
sh "$PROJECT_ROOT/sh/common/ensure_database.sh" "$MYSQL_DATABASE"
sh "$PROJECT_ROOT/sh/common/run_migrations.sh" production
