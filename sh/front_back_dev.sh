#!/bin/sh

PROJECT_ROOT=".."

# 偵測環境：優先使用系統支援的終端機
if command -v xfce4-terminal &> /dev/null; then
  xfce4-terminal \
    --window \
    -T "Jianghu Backend" \
    --working-directory="$PROJECT_ROOT/Backend" \
    -e "sh -c 'npm run dev:start; exec sh'" \
    --tab \
    -T "Jianghu Frontend" \
    --working-directory="$PROJECT_ROOT/Frontend" \
    -e "sh -c 'npm run dev:start; exec sh'"

elif command -v gnome-terminal &> /dev/null; then
  gnome-terminal \
    --window \
    --title="Jianghu Backend" \
    --working-directory="$PROJECT_ROOT/Backend" \
    --command="sh -c 'npm run dev:start; exec sh'" \
    --tab \
    --title="Jianghu Frontend" \
    --working-directory="$PROJECT_ROOT/Frontend" \
    --command="sh -c 'npm run dev:start; exec sh'"

else
  echo "錯誤：找不到支援的終端機模擬器 (xfce4-terminal 或 gnome-terminal)。"
  exit 1
fi
