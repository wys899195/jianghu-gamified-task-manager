#!/bin/sh
# 依根目錄 APP_ENV 注入 NODE_ENV，並啟動對應的 Backend server script。

set -eu

ENVIRONMENT="${1:?environment is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_ENV_FILE="$PROJECT_ROOT/Backend/.env"

. "$PROJECT_ROOT/sh/common/msg_color.sh"
. "$PROJECT_ROOT/sh/common/runtime_paths.sh"

PID_FILE="$(get_service_pid_file "$ENVIRONMENT" backend)"

if [ ! -f "$BACKEND_ENV_FILE" ]; then
  msg_error "找不到 Backend/.env：$BACKEND_ENV_FILE"
  echo "請先執行 sh/init/initialize_after_clone.sh。"
  exit 1
fi

. "$PROJECT_ROOT/sh/common/load_env.sh"
. "$PROJECT_ROOT/sh/common/process_control.sh"
: "${APP_ENV:?環境入口必須設定 APP_ENV}"

if [ "$APP_ENV" != "$ENVIRONMENT" ]; then
  msg_error "環境入口的 APP_ENV=$APP_ENV 與腳本預期的 environment=$ENVIRONMENT 不一致。"
  exit 1
fi

case "$ENVIRONMENT" in
  development)
    SERVER_SCRIPT="dev"
    ;;
  test)
    SERVER_SCRIPT="start"
    ;;
  production)
    SERVER_SCRIPT="start"
    ;;
  *)
    msg_error "不支援的 environment：$ENVIRONMENT"
    exit 1
    ;;
esac

prepare_pid_file "$PID_FILE" "start_backend.sh"
register_pid_file "$PID_FILE"

CHILD_PID=""
cleanup() {
  remove_pid_file "$PID_FILE"
}

stop_child() {
  if [ -n "$CHILD_PID" ]; then
    kill -TERM "$CHILD_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'stop_child; exit 143' INT TERM

NODE_ENV="$APP_ENV" npm run "$SERVER_SCRIPT" --prefix "$PROJECT_ROOT/Backend" &
CHILD_PID=$!
wait "$CHILD_PID"
