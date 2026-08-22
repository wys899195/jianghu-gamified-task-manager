#!/bin/sh
# Clone 專案後執行的一次性初始化腳本，建立.env檔並安裝前後端依賴套件。

set -eu

# 計算腳本與專案根目錄路徑。
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$PROJECT_ROOT/sh/common/msg_color.sh"
# 定義根目錄環境設定檔與初始化預設值。
ROOT_ENV_FILE="$PROJECT_ROOT/.env"
DEFAULT_DATABASE_PASSWORD="000000"
TERMINAL_SETTINGS=""

# 把終端機恢復成原本的輸入狀態。
restore_terminal() {
  if [ -n "$TERMINAL_SETTINGS" ]; then
    stty "$TERMINAL_SETTINGS" 2>/dev/null || true
    TERMINAL_SETTINGS=""
  fi
}

# 確保中斷或結束時還原終端機設定。
trap 'restore_terminal; exit 130' INT TERM
trap restore_terminal EXIT

# 讀取環境設定檔中的指定欄位。
get_env_value() {
  env_file="$1"
  env_key="$2"
  sed -n "s/^${env_key}=//p" "$env_file" | head -n 1
}

# 更新環境設定檔中的指定欄位。
set_env_value() {
  env_file="$1"
  env_key="$2"
  env_value="$3"
  temp_file="${env_file}.tmp.$$"

  awk -v key="$env_key" -v value="$env_value" '
    index($0, key "=") == 1 {
      print key "=" value
      found = 1
      next
    }
    { print }
    END {
      if (!found) {
        print key "=" value
      }
    }
  ' "$env_file" > "$temp_file"

  mv "$temp_file" "$env_file"
}

# 隱藏輸入並讀取單次密碼。
read_secret() {
  secret_prompt="$1"

  printf '%s' "$secret_prompt"
  TERMINAL_SETTINGS="$(stty -g)"
  stty -echo
  if IFS= read -r secret_value; then
    read_status=0
  else
    read_status=$?
  fi
  restore_terminal
  printf '\n'

  if [ "$read_status" -ne 0 ]; then
    msg_error "無法讀取終端機輸入。"
    exit 1
  fi
}

# 確認密碼欄位並寫入根目錄.env檔。
prompt_secret_if_empty() {
  env_key="$1"
  prompt_message="$2"
  current_value="$(get_env_value "$ROOT_ENV_FILE" "$env_key")"

  if [ -n "$current_value" ]; then
    return 0
  fi

  if [ ! -t 0 ] || [ ! -t 1 ]; then
    msg_error "$env_key 尚未設定，且目前不是互動式終端機。"
    echo "請手動填入 $ROOT_ENV_FILE 的 $env_key，或在互動式終端機重新執行初始化腳本。"
    exit 1
  fi

  while :; do
    read_secret "$prompt_message"
    first_secret="$secret_value"

    if [ -z "$first_secret" ]; then
      printf '確認使用預設密碼「%s」嗎(y/n)?' "$DEFAULT_DATABASE_PASSWORD"
      if IFS= read -r use_default; then
        :
      else
        msg_error '無法讀取終端機輸入。'
        exit 1
      fi

      case "$use_default" in
        y|Y)
          secret_value="$DEFAULT_DATABASE_PASSWORD"
          break
          ;;
        n|N)
          echo "請重新設定 $env_key。"
          continue
          ;;
        *)
          echo "請輸入 y 或 n。"
          continue
          ;;
      esac
    fi

    read_secret "請再次輸入 $env_key："
    if [ "$first_secret" != "$secret_value" ]; then
      msg_error "兩次輸入的密碼不一致，請再試一次並重新設定 $env_key。"
      first_secret=""
      secret_value=""
      continue
    fi

    secret_value="$first_secret"
    break
  done

  set_env_value "$ROOT_ENV_FILE" "$env_key" "$secret_value"
}

cd "$PROJECT_ROOT"

# 建立根目錄.env檔。
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  cp ".env.example" ".env"
  msg_success "已建立根目錄 .env，請填入必要設定。"
fi

# 確認根目錄.env檔存在。
if [ ! -f "$ROOT_ENV_FILE" ]; then
  msg_error "找不到根目錄 .env.example，無法建立 $ROOT_ENV_FILE。"
  exit 1
fi

# 確認 MySQL root 與應用程式密碼。
prompt_secret_if_empty "MYSQL_ROOT_PASSWORD" "請輸入 MySQL root 密碼（若不輸入直接按 Enter 將使用預設密碼「${DEFAULT_DATABASE_PASSWORD}」）："
prompt_secret_if_empty "MYSQL_PASSWORD" "請輸入 MySQL 後端資料庫專用密碼（若不輸入直接按 Enter 將使用預設密碼「${DEFAULT_DATABASE_PASSWORD}」）："

# 建立後端.env檔。
if [ -f "Backend/.env.example" ] && [ ! -f "Backend/.env" ]; then
  BACKEND_ENV_FILE="$PROJECT_ROOT/Backend/.env"
  cp "Backend/.env.example" "$BACKEND_ENV_FILE"

  # 產生後端使用的 JWT secret。
  JWT_SECRET_VALUE="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  set_env_value "$BACKEND_ENV_FILE" "JWT_SECRET" "$JWT_SECRET_VALUE"

  msg_success "已建立 Backend/.env，請填入必要設定，並確認後端 host 與 port。"
fi

# 同步後端使用的資料庫密碼。
if [ -f "$PROJECT_ROOT/Backend/.env" ]; then
  BACKEND_ENV_FILE="$PROJECT_ROOT/Backend/.env"
  MYSQL_PASSWORD_VALUE="$(get_env_value "$ROOT_ENV_FILE" "MYSQL_PASSWORD")"

  if [ -n "$MYSQL_PASSWORD_VALUE" ]; then
    # 確保後端密碼與根目錄設定一致。
    set_env_value "$BACKEND_ENV_FILE" "DB_PASSWORD" "$MYSQL_PASSWORD_VALUE"
    chmod 600 "$BACKEND_ENV_FILE"
  fi
fi

# 建立前端.env檔。
if [ -f "Frontend/.env.example" ] && [ ! -f "Frontend/.env" ]; then
  cp "Frontend/.env.example" "Frontend/.env"
  msg_success "已建立 Frontend/.env，請確認前端 host 與 port。"
fi

# 安裝後端與前端的依賴套件。
npm install --prefix Backend
npm install --prefix Frontend

msg_success "專案初始化完成。"
