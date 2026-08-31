#!/bin/sh
# 依根目錄 APP_ENV 選擇並執行 Backend 對應的資料庫 migration。
# Internal helper：由環境資料庫部署流程呼叫，不作為日常入口直接執行。

set -eu

ENVIRONMENT="${1:?environment is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"
: "${APP_ENV:?環境入口必須設定 APP_ENV}"

if [ "$APP_ENV" != "$ENVIRONMENT" ]; then
  msg_error "環境入口的 APP_ENV=$APP_ENV 與 migration 預期的 environment=$ENVIRONMENT 不一致。"
  exit 1
fi

case "$ENVIRONMENT" in
  development)
    MIGRATION_SCRIPT="migrate:src"
    ;;
  test)
    MIGRATION_SCRIPT="migrate:src"
    ;;
  production)
    MIGRATION_SCRIPT="migrate"
    ;;
  *)
    msg_error "不支援的 environment：$ENVIRONMENT"
    exit 1
    ;;
esac

NODE_ENV="$APP_ENV" npm run "$MIGRATION_SCRIPT" --prefix "$PROJECT_ROOT/Backend"
msg_success "資料庫 migration 完成：$ENVIRONMENT"
