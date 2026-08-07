#!/bin/sh

set -eu

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_ROOT"

echo "啟動 MySQL 容器……"
docker compose up -d mysql

MYSQL_CONTAINER_ID="$(docker compose ps -q mysql)"

if [ -z "$MYSQL_CONTAINER_ID" ]; then
  echo "錯誤：找不到 MySQL 容器。"
  exit 1
fi

echo "等待 MySQL 就緒……"

MYSQL_STATUS="unknown"
ATTEMPT=1

while [ "$ATTEMPT" -le 60 ]; do
  MYSQL_STATUS="$(
    docker inspect \
      --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      "$MYSQL_CONTAINER_ID"
  )"

  if [ "$MYSQL_STATUS" = "healthy" ]; then
    echo "MySQL 已就緒。"
    exit 0
  fi

  if [ "$MYSQL_STATUS" = "unhealthy" ]; then
    echo "錯誤：MySQL 健康檢查失敗。"
    docker compose logs --tail=50 mysql
    exit 1
  fi

  if [ "$MYSQL_STATUS" = "exited" ] || [ "$MYSQL_STATUS" = "dead" ]; then
    echo "錯誤：MySQL 容器已停止，目前狀態：$MYSQL_STATUS"
    docker compose logs --tail=50 mysql
    exit 1
  fi

  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

echo "錯誤：等待 MySQL 就緒逾時，目前狀態：$MYSQL_STATUS"
docker compose logs --tail=50 mysql
exit 1