#!/bin/sh
# 以 production 模式啟動已編譯的 Backend server。

set -eu

APP_ENV=production
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_backend.sh" production
