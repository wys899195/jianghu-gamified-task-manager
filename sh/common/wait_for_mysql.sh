#!/bin/sh
# 啟動 MySQL 容器並等待其 healthcheck 通過。

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/msg_color.sh"

cd "$PROJECT_ROOT"

docker compose up -d mysql

MYSQL_CONTAINER_ID="$(docker compose ps -q mysql)"

if [ -z "$MYSQL_CONTAINER_ID" ]; then
  msg_error "找不到 MySQL 容器。"
  exit 1
fi

MYSQL_STATUS="unknown"
ATTEMPT=1

while [ "$ATTEMPT" -le 60 ]; do
  MYSQL_STATUS="$(
    docker inspect \
      --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      "$MYSQL_CONTAINER_ID"
  )"

  if [ "$MYSQL_STATUS" = "healthy" ]; then
    msg_success "MySQL 已就緒。"
    exit 0
  fi

  if [ "$MYSQL_STATUS" = "unhealthy" ] || [ "$MYSQL_STATUS" = "exited" ] || [ "$MYSQL_STATUS" = "dead" ]; then
    msg_error "MySQL 無法就緒，目前狀態：$MYSQL_STATUS"
    docker compose logs --tail=50 mysql
    exit 1
  fi

  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

msg_error "等待 MySQL 就緒逾時，目前狀態：$MYSQL_STATUS"
docker compose logs --tail=50 mysql
exit 1
