#!/bin/sh

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

sh "$SCRIPT_DIR/run_mysql.sh"
sh "$SCRIPT_DIR/front_back_dev.sh"

echo
echo "開發環境已啟動。"
echo "Frontend：http://localhost:5173"
echo "Backend：http://127.0.0.1:3000"
echo "MySQL：127.0.0.1:3306"