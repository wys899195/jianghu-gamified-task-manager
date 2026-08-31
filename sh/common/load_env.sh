#!/bin/sh
# 載入專案根目錄的 .env，供各環境 shell wrapper 共用環境設定。
# Internal helper：由其他 shell script 載入根目錄環境設定，不作為日常入口直接執行。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/msg_color.sh"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  msg_error "找不到根目錄的 .env：$PROJECT_ROOT/.env"
  exit 1
fi

# Compose 與 shell wrapper 共用同一份設定；本檔案只負責載入，不寫入任何值。
set -a
. "$PROJECT_ROOT/.env"
set +a
