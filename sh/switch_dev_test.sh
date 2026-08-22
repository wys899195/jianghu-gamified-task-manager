#!/bin/sh
# 停止目前由本專案管理的服務，並切換 development 或 test 模式。

set -eu

TARGET_ENV="${1:?environment is required: development or test}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
. "$PROJECT_ROOT/sh/common/msg_color.sh"

case "$TARGET_ENV" in
  development)
    START_SCRIPT="$PROJECT_ROOT/sh/dev/deploy_and_start.sh"
    ;;
  test)
    START_SCRIPT="$PROJECT_ROOT/sh/test/deploy_and_start.sh"
    ;;
  *)
    msg_error "switch_dev_test 只支援 development 或 test，不處理 production。"
    exit 1
    ;;
esac

echo "停止 development 服務。"
sh "$PROJECT_ROOT/sh/dev/stop_services.sh"

echo "停止 test 服務。"
sh "$PROJECT_ROOT/sh/test/stop_services.sh"

echo "切換到 $TARGET_ENV。"
APP_ENV="$TARGET_ENV" sh "$START_SCRIPT"
