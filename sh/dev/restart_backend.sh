#!/bin/sh
# 只重啟 development Backend，不執行資料庫部署或 migration。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/dev/stop_backend.sh"
sh "$PROJECT_ROOT/sh/dev/start_backend.sh"
