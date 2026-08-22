#!/bin/sh
# 以 development 模式啟動 Backend，並連線到 development database。

set -eu

APP_ENV=development
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_backend.sh" development
