#!/bin/sh
# 提供服務執行期間使用的 log 與 PID file 路徑。
# Internal library：必須由其他 shell script 以 . 載入，不可直接執行。

: "${PROJECT_ROOT:?PROJECT_ROOT is required}"

RUNTIME_DIR="$PROJECT_ROOT/.logs"

get_service_pid_file() {
  environment="$1"
  service="$2"

  printf '%s/%s-%s.pid\n' \
    "$RUNTIME_DIR" \
    "$environment" \
    "$service"
}
