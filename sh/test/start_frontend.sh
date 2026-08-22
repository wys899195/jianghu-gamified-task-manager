#!/bin/sh
# 建立並啟動 test Frontend build 的 preview server。

set -eu

APP_ENV=test
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_frontend.sh" test
