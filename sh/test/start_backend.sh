#!/bin/sh
# 以 test 模式啟動 Backend，供 integration 與 API tests 使用。

set -eu

APP_ENV=test
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_backend.sh" test
