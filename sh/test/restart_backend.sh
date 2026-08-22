#!/bin/sh
# 只重啟 test Backend，不執行資料庫部署或 migration。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/test/stop_backend.sh"
sh "$PROJECT_ROOT/sh/test/start_backend.sh"
