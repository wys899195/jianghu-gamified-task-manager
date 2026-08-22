#!/bin/sh
# 重新部署 development database/migration，並啟動 Backend 與 Frontend。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/dev/stop_services.sh"
sh "$PROJECT_ROOT/sh/dev/deploy_and_start.sh"
