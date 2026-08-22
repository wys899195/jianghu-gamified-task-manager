#!/bin/sh
# 在 test Backend 上執行 health 與 authentication API 的 Postman CLI 測試。

set -eu

APP_ENV=test
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"
: "${APP_ENV:?test 環境入口必須設定 APP_ENV}"

if [ "$APP_ENV" != "test" ]; then
  msg_error "API 測試只能在 APP_ENV=test 下執行。"
  echo "請先透過 test 環境入口注入 APP_ENV=test，再啟動 test Backend。"
  exit 1
fi

ENVIRONMENT_PATH="$PROJECT_ROOT/API-Tests/local-environment.json"
REGISTER_DATA_PATH="$PROJECT_ROOT/API-Tests/data/register.json"

if ! command -v postman >/dev/null 2>&1; then
  msg_error "找不到 Postman CLI。"
  echo "請先確認 postman --version 可以正常執行。"
  exit 1
fi

for collection_path in \
  "$PROJECT_ROOT/API-Tests/health-collection.json" \
  "$PROJECT_ROOT/API-Tests/auth-collection.json"; do
  if [ ! -f "$collection_path" ]; then
    msg_error "找不到 Postman Collection：$collection_path"
    exit 1
  fi
done

if [ ! -f "$ENVIRONMENT_PATH" ]; then
  msg_error "找不到 Postman environment：$ENVIRONMENT_PATH"
  exit 1
fi

if [ ! -f "$REGISTER_DATA_PATH" ]; then
  msg_error "找不到註冊 API 測試資料：$REGISTER_DATA_PATH"
  exit 1
fi

run_collection() {
  collection_path="$1"
  iteration_data_path="${2:-}"
  echo "Collection：$collection_path"

  if [ -n "$iteration_data_path" ]; then
    postman collection run \
      "$collection_path" \
      --environment "$ENVIRONMENT_PATH" \
      --iteration-data "$iteration_data_path" \
      --reporters cli \
      --bail failure
  else
    postman collection run \
      "$collection_path" \
      --environment "$ENVIRONMENT_PATH" \
      --reporters cli \
      --bail failure
  fi
}

echo "開始執行 Test Health API 自動化測試……"
run_collection "$PROJECT_ROOT/API-Tests/health-collection.json"

echo "開始執行 Test Auth API 自動化測試……"
run_collection "$PROJECT_ROOT/API-Tests/auth-collection.json" "$REGISTER_DATA_PATH"

msg_success "Test API 自動化測試完成。"
