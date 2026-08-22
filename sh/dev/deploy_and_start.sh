#!/bin/sh
# 部署 development database，並在同一個前景程序中啟動 Backend 與 Frontend。

set -eu

APP_ENV=development
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/dev/deploy_database.sh"
sh "$PROJECT_ROOT/sh/common/start_services.sh" development
