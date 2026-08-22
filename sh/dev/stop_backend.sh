#!/bin/sh
# 停止 development Backend。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/common/stop_service.sh" development backend
