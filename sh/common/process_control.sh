#!/bin/sh
# 提供環境服務共用的 PID file 建立、清理與停止功能。

prepare_pid_file() {
  pid_file="$1"
  process_marker="$2"

  if [ ! -f "$pid_file" ]; then
    return 0
  fi

  old_pid="$(cat "$pid_file")"
  case "$old_pid" in
    ''|*[!0-9]*)
      rm -f "$pid_file"
      return 0
      ;;
  esac

  if kill -0 "$old_pid" 2>/dev/null; then
    current_command="$(ps -p "$old_pid" -o command= 2>/dev/null || true)"
    case "$current_command" in
      *"$process_marker"*)
        msg_error "服務已在執行，PID：$old_pid，PID file：$pid_file"
        return 1
        ;;
    esac
  fi

  rm -f "$pid_file"
}

register_pid_file() {
  pid_file="$1"
  mkdir -p "$(dirname "$pid_file")"
  printf '%s\n' "$$" >"$pid_file"
}

remove_pid_file() {
  pid_file="$1"

  if [ -f "$pid_file" ] && [ "$(cat "$pid_file")" = "$$" ]; then
    rm -f "$pid_file"
  fi
}

stop_pid_file() {
  pid_file="$1"
  process_marker="$2"

  if [ ! -f "$pid_file" ]; then
    echo "服務目前沒有 PID file：$pid_file"
    return 0
  fi

  pid="$(cat "$pid_file")"
  case "$pid" in
    ''|*[!0-9]*)
      msg_warning "PID file 無效，已移除：$pid_file"
      rm -f "$pid_file"
      return 0
      ;;
  esac

  if ! kill -0 "$pid" 2>/dev/null; then
    msg_success "服務已停止，移除過期 PID file：$pid_file"
    rm -f "$pid_file"
    return 0
  fi

  current_command="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  case "$current_command" in
    *"$process_marker"*) ;;
    *)
      msg_warning "PID file 未指向預期服務，僅移除 PID file：$pid_file"
      rm -f "$pid_file"
      return 0
      ;;
  esac

  echo "停止服務 PID：$pid"
  kill -TERM "$pid"

  attempt=1
  while kill -0 "$pid" 2>/dev/null && [ "$attempt" -le 10 ]; do
    sleep 1
    attempt=$((attempt + 1))
  done

  if kill -0 "$pid" 2>/dev/null; then
    msg_warning "服務未在期限內停止，送出 SIGKILL：$pid"
    kill -KILL "$pid" 2>/dev/null || true
  fi

  msg_success "服務已停止：$pid"
  rm -f "$pid_file"
}
