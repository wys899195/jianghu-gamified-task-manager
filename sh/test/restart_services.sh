#!/bin/sh
# 只重啟 test Backend 與 Frontend，不執行資料庫部署或 migration。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/test/stop_services.sh"
sh "$PROJECT_ROOT/sh/common/start_services.sh" test
