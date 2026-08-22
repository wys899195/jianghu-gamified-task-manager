#!/bin/sh
# 啟動指定環境的 Backend 與 Frontend，不執行資料庫部署或 migration。

set -eu

ENVIRONMENT="${1:?environment is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/msg_color.sh"

case "$ENVIRONMENT" in
  development)
    APP_ENV=development
    BACKEND_START_SCRIPT="$PROJECT_ROOT/sh/dev/start_backend.sh"
    FRONTEND_START_SCRIPT="$PROJECT_ROOT/sh/dev/start_frontend.sh"
    LOG_PREFIX=dev
    ;;
  test)
    APP_ENV=test
    BACKEND_START_SCRIPT="$PROJECT_ROOT/sh/test/start_backend.sh"
    FRONTEND_START_SCRIPT="$PROJECT_ROOT/sh/test/start_frontend.sh"
    LOG_PREFIX=test
    ;;
  *)
    msg_error "不支援的 environment：$ENVIRONMENT"
    exit 1
    ;;
esac

export APP_ENV
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_LOG="$LOG_DIR/${LOG_PREFIX}-backend.log"
FRONTEND_LOG="$LOG_DIR/${LOG_PREFIX}-frontend.log"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  exit_status=$?
  trap - EXIT INT TERM

  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  exit "$exit_status"
}

trap cleanup EXIT INT TERM

if [ "$ENVIRONMENT" = "test" ]; then
  npm run build --prefix "$PROJECT_ROOT/Backend"
fi

mkdir -p "$LOG_DIR"
sh "$BACKEND_START_SCRIPT" >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

sh "$FRONTEND_START_SCRIPT" >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

sh "$PROJECT_ROOT/sh/common/wait_for_http.sh" "http://127.0.0.1:3000/api/health"
sh "$PROJECT_ROOT/sh/common/wait_for_http.sh" "http://127.0.0.1:6677/"

msg_success "$ENVIRONMENT Backend PID：$BACKEND_PID，log：$BACKEND_LOG"
msg_success "$ENVIRONMENT Frontend PID：$FRONTEND_PID，log：$FRONTEND_LOG"
echo "按 Ctrl+C 可停止 $ENVIRONMENT Backend 與 Frontend。"

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

msg_error "$ENVIRONMENT Backend 或 Frontend 已停止，請檢查 log。"
exit 1
