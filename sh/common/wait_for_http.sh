#!/bin/sh
# 等待指定 HTTP endpoint 可正常回應。

set -eu

URL="${1:?url is required}"
ATTEMPT=1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$PROJECT_ROOT/sh/common/msg_color.sh"

if ! command -v curl >/dev/null 2>&1; then
  msg_error "找不到 curl，無法等待 HTTP endpoint。"
  exit 1
fi

while [ "$ATTEMPT" -le 60 ]; do
  if curl --fail --silent --show-error "$URL" >/dev/null 2>&1; then
    msg_success "HTTP endpoint 已就緒：$URL"
    exit 0
  fi

  sleep 1
  ATTEMPT=$((ATTEMPT + 1))
done

msg_error "等待 HTTP endpoint 逾時：$URL"
exit 1
