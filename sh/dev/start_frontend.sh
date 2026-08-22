#!/bin/sh
# 啟動 development Frontend Vite server。

set -eu

APP_ENV=development
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/start_frontend.sh" development
