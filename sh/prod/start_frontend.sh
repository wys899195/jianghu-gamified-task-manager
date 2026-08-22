#!/bin/sh
# 建立並啟動 production Frontend build 的 preview server。

set -eu

APP_ENV=production
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_frontend.sh" production
