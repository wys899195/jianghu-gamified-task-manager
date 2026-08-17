#!/bin/sh

set -eu

# 複製.env，缺的值要自己設定
if [ -f "../.env.example" ] && [ ! -f "../.env" ]; then
  cp "../.env.example" "../.env"
fi
if [ -f "../Backend/.env.example" ] && [ ! -f "../Backend/.env" ]; then
  cp "../Backend/.env.example" "../Backend/.env"
fi



(cd ../Backend && npm install)
(cd ../Frontend && npm install)