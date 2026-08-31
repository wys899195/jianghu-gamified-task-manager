#!/bin/sh
# 停止指定環境的 Backend 或 Frontend，不影響其他環境服務。
# Internal helper：由各環境的 service 停止入口呼叫，不作為日常入口直接執行。

set -eu

ENVIRONMENT="${1:?environment is required}"
SERVICE="${2:?service is required}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/msg_color.sh"
. "$PROJECT_ROOT/sh/common/runtime_paths.sh"

case "$ENVIRONMENT" in
  development|test|production) ;;
  *)
    msg_error "不支援的 environment：$ENVIRONMENT"
    exit 1
    ;;
esac

case "$SERVICE" in
  backend)
    PROCESS_MARKER="start_backend.sh"
    ;;
  frontend)
    PROCESS_MARKER="start_frontend.sh"
    ;;
  *)
    msg_error "不支援的 service：$SERVICE"
    exit 1
    ;;
esac

. "$PROJECT_ROOT/sh/common/process_control.sh"
PID_FILE="$(get_service_pid_file "$ENVIRONMENT" "$SERVICE")"
stop_pid_file "$PID_FILE" "$PROCESS_MARKER"
