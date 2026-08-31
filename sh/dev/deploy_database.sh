#!/bin/sh
# 部署 development 資料庫，建立 _dev database 並執行 development migrations。

set -eu

APP_ENV=development
export APP_ENV

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/deploy_database.sh" development
