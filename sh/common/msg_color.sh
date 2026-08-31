#!/bin/sh
# 提供可在終端機使用的錯誤、警告與成功訊息格式。
# Internal library：必須由其他 shell script 以 . 載入，不可直接執行。

msg_error() {
  if [ -t 2 ] && [ -z "${NO_COLOR:-}" ]; then
    printf '\033[1;31m錯誤：%s\033[0m\n' "$1" >&2
  else
    printf '錯誤：%s\n' "$1" >&2
  fi
}

msg_warning() {
  if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
    printf '\033[33m警告：%s\033[0m\n' "$1"
  else
    printf '警告：%s\n' "$1"
  fi
}

msg_success() {
  if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
    printf '\033[32m%s\033[0m\n' "$1"
  else
    printf '%s\n' "$1"
  fi
}
