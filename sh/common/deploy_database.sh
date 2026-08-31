#!/bin/sh
# 部署 development 或 test 資料庫，並執行對應 migration。
# Internal helper：由 development 與 test 的資料庫部署入口呼叫，不作為日常入口直接執行。

set -eu

ENVIRONMENT="${1:?environment is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"

: "${APP_ENV:?環境入口必須設定 APP_ENV}"
: "${MYSQL_DATABASE:? env MYSQL_DATABASE is required}"

if [ "$APP_ENV" != "$ENVIRONMENT" ]; then
  msg_error "環境入口的 APP_ENV=$APP_ENV 與資料庫部署預期的 environment=$ENVIRONMENT 不一致。"
  exit 1
fi

case "$ENVIRONMENT" in
  development)
    DATABASE_SUFFIX=dev
    ;;
  test)
    DATABASE_SUFFIX=test
    ;;
  *)
    msg_error "共用資料庫部署只支援 development 或 test：$ENVIRONMENT"
    exit 1
    ;;
esac

case "$MYSQL_DATABASE" in
  *_dev|*_test)
    msg_error "MYSQL_DATABASE 不應該已經包含 _dev 或 _test 後綴。"
    exit 1
    ;;
esac

DATABASE_NAME="${MYSQL_DATABASE}_${DATABASE_SUFFIX}"

sh "$PROJECT_ROOT/sh/common/wait_for_mysql.sh"
sh "$PROJECT_ROOT/sh/common/ensure_database.sh" "$DATABASE_NAME"
sh "$PROJECT_ROOT/sh/common/run_migrations.sh" "$ENVIRONMENT"
