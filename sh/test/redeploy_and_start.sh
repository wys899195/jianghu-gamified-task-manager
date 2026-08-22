#!/bin/sh
# 重新部署 test database/migration，並啟動 Backend 與 Frontend。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/test/stop_services.sh"
sh "$PROJECT_ROOT/sh/test/deploy_and_start.sh"
