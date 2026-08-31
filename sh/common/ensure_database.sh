#!/bin/sh
# 建立指定的 MySQL 資料庫，並授予應用程式帳號存取權限。
# Internal helper：由環境資料庫部署流程呼叫，不作為日常入口直接執行。

set -eu

DATABASE_NAME="${1:?database name is required}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

. "$PROJECT_ROOT/sh/common/load_env.sh"

case "$DATABASE_NAME" in
  ''|*[!A-Za-z0-9_]* )
    msg_error "資料庫名稱只允許英文字母、數字與底線：$DATABASE_NAME"
    exit 1
    ;;
esac

: "${MYSQL_USER:? env MYSQL_USER is required}"
: "${MYSQL_CHARACTER_SET:? env MYSQL_CHARACTER_SET is required}"
: "${MYSQL_COLLATION:? env MYSQL_COLLATION is required}"

for database_setting in "$MYSQL_CHARACTER_SET" "$MYSQL_COLLATION"; do
  case "$database_setting" in
    ''|*[!A-Za-z0-9_]*)
      msg_error "資料庫字元設定只允許英文字母、數字與底線：$database_setting"
      exit 1
      ;;
  esac
done

cd "$PROJECT_ROOT"

docker compose exec -T \
  -e "TARGET_DATABASE=$DATABASE_NAME" \
  -e "TARGET_USER=$MYSQL_USER" \
  -e "TARGET_CHARACTER_SET=$MYSQL_CHARACTER_SET" \
  -e "TARGET_COLLATION=$MYSQL_COLLATION" \
  mysql sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$TARGET_DATABASE\` CHARACTER SET $TARGET_CHARACTER_SET COLLATE $TARGET_COLLATION; GRANT ALL PRIVILEGES ON \`$TARGET_DATABASE\`.* TO '\''$TARGET_USER'\''@'\''%'\''; FLUSH PRIVILEGES;"'

msg_success "資料庫已就緒：$DATABASE_NAME"
