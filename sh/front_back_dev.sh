#!/bin/sh

set -eu

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "啟動前後端……"
gnome-terminal \
  --window \
  --title="Jianghu Backend" \
  --working-directory="$PROJECT_ROOT/Backend" \
  --command="sh -c 'npm run dev:start; exec sh'" \
  --tab \
  --title="Jianghu Frontend" \
  --working-directory="$PROJECT_ROOT/Frontend" \
  --command="sh -c 'npm run dev:start; exec sh'"
