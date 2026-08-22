#!/bin/sh
# 依指定環境啟動 Frontend development server，或建立並預覽 production build。
# host 與 port 由 Frontend/.env 載入後傳給 Vite CLI。

set -eu

ENVIRONMENT="${1:?environment is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FRONTEND_ENV_FILE="$PROJECT_ROOT/Frontend/.env"
PID_FILE="$PROJECT_ROOT/logs/${ENVIRONMENT}-frontend.pid"

. "$PROJECT_ROOT/sh/common/msg_color.sh"
# 載入根目錄環境，取得實際的 APP_ENV。
. "$PROJECT_ROOT/sh/common/load_env.sh"
. "$PROJECT_ROOT/sh/common/process_control.sh"

if [ ! -f "$FRONTEND_ENV_FILE" ]; then
  msg_error "找不到 Frontend/.env，請先執行 sh/init/initialize_after_clone.sh。"
  exit 1
fi

set -a
. "$FRONTEND_ENV_FILE"
set +a

: "${FRONTEND_HOST:?Frontend/.env 必須設定 FRONTEND_HOST}"
: "${FRONTEND_PORT:?Frontend/.env 必須設定 FRONTEND_PORT}"
: "${APP_ENV:?環境入口必須設定 APP_ENV}"

if [ "$APP_ENV" != "$ENVIRONMENT" ]; then
  msg_error "環境入口的 APP_ENV=$APP_ENV 與腳本預期的 environment=$ENVIRONMENT 不一致。"
  exit 1
fi

case "$APP_ENV" in
  development)
    prepare_pid_file "$PID_FILE" "start_frontend.sh"
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
    FRONTEND_ENV="$APP_ENV" npm run dev:start --prefix "$PROJECT_ROOT/Frontend" -- \
      --mode "$APP_ENV" \
      --host "$FRONTEND_HOST" \
      --port "$FRONTEND_PORT" \
      --strictPort &
    CHILD_PID=$!
    wait "$CHILD_PID"
    ;;
  test)
    prepare_pid_file "$PID_FILE" "start_frontend.sh"
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
    FRONTEND_ENV="$APP_ENV" npm run build --prefix "$PROJECT_ROOT/Frontend" -- --mode "$APP_ENV"
    FRONTEND_ENV="$APP_ENV" npm run preview --prefix "$PROJECT_ROOT/Frontend" -- \
      --host "$FRONTEND_HOST" \
      --port "$FRONTEND_PORT" \
      --strictPort &
    CHILD_PID=$!
    wait "$CHILD_PID"
    ;;
  production)
    prepare_pid_file "$PID_FILE" "start_frontend.sh"
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
    FRONTEND_ENV="$APP_ENV" npm run build --prefix "$PROJECT_ROOT/Frontend" -- --mode "$APP_ENV"
    FRONTEND_ENV="$APP_ENV" npm run preview --prefix "$PROJECT_ROOT/Frontend" -- \
      --host "$FRONTEND_HOST" \
      --port "$FRONTEND_PORT" \
      --strictPort &
    CHILD_PID=$!
    wait "$CHILD_PID"
    ;;
  *)
    msg_error "不支援的 environment：$ENVIRONMENT"
    exit 1
    ;;
esac
