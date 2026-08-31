#!/bin/sh
# 部署 test 資料庫，建立 _test database 並執行 test migrations。

set -eu

APP_ENV=test
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/deploy_database.sh" test
