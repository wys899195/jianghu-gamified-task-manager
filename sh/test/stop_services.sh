#!/bin/sh
# 停止 test Backend 與 Frontend。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

sh "$PROJECT_ROOT/sh/test/stop_frontend.sh"
sh "$PROJECT_ROOT/sh/test/stop_backend.sh"
