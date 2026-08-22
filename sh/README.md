# Shell Scripts

本目錄包含專案初始化、環境部署、服務啟停與 API 測試腳本。一般使用時優先執行環境目錄或根目錄的入口腳本，不需要直接執行 `sh/common/` 底層 helper。

## 初始化

Clone 專案後執行一次：

```sh
sh/init/initialize_after_clone.sh
```

此腳本會建立根目錄與前後端的 `.env`，並安裝前後端所需的套件。

## Dev（開發模式）

以下腳本用於啟動、停止或重啟開發模式的資料庫與前後端服務。

| 腳本 | 用途 |
|---|---|
| `dev/deploy_and_start.sh` | 部署開發模式專用資料庫 ⮕ 執行資料庫 migration ⮕ 啟動前後端 |
| `dev/deploy_database.sh` | 部署開發模式專用資料庫 ⮕ 執行資料庫 migration |
| `dev/redeploy_and_start.sh` | 停止前後端 ⮕ 重新部署資料庫 ⮕ 執行資料庫 migration ⮕ 重啟前後端 |
| `dev/restart_backend.sh` | 重啟後端 |
| `dev/restart_frontend.sh` | 重啟前端 |
| `dev/restart_services.sh` | 重啟前後端 |
| `dev/start_backend.sh` | 啟動開發模式的後端，並連線到開發模式的資料庫 |
| `dev/start_frontend.sh` | 啟動開發模式的前端 Vite server |
| `dev/stop_backend.sh` | 停止後端 |
| `dev/stop_frontend.sh` | 停止前端 |
| `dev/stop_services.sh` | 同時停止前後端 |

## Test（測試模式）

以下腳本用於啟動、停止或重啟測試模式的資料庫與前後端服務。

| 腳本 | 用途 |
|---|---|
| `test/deploy_and_start.sh` | 部署測試模式專用資料庫 ⮕ 執行資料庫 migration ⮕ 啟動前後端 |
| `test/deploy_database.sh` | 部署測試模式專用資料庫 ⮕ 執行資料庫 migration |
| `test/redeploy_and_start.sh` | 停止前後端 ⮕ 重新部署資料庫 ⮕ 執行資料庫 migration ⮕ 重啟前後端 |
| `test/restart_backend.sh` | 重啟後端 |
| `test/restart_frontend.sh` | 重啟前端 |
| `test/restart_services.sh` | 重啟前後端 |
| `test/run_api_test.sh` | 使用 Postman CLI 執行測試模式的 API 自動化測試 |
| `test/start_backend.sh` | 啟動測試模式的後端，供整合測試與 API 自動化測試使用 |
| `test/start_frontend.sh` | 建立測試模式的前端 build，並啟動 preview server |
| `test/stop_backend.sh` | 停止後端 |
| `test/stop_frontend.sh` | 停止前端 |
| `test/stop_services.sh` | 停止前後端 |

## 切換模式

由於開發、測試、正式模式各使用不同資料庫與環境變數，切換模式時請務必執行以下腳本，**僅供快速切換開發、測試模式**：

```sh
sh/switch_dev_test.sh development
sh/switch_dev_test.sh test
```

切換模式的腳本會停止目前模式的服務 ⮕ 呼叫目標模式的 `deploy_and_start.sh` 腳本。

## Prod（正式模式）

正式模式的資料庫部署需要額外確認正式環境資料庫 migration 權限，不應在沒有明確確認的情況下執行：

```sh
ALLOW_PRODUCTION_MIGRATION=true sh/prod/deploy_database.sh
```

## 其他說明

`sh/common/` 底下的腳本作為 helper 腳本，由 `sh/dev/`、`sh/test/` 或 `sh/prod/` 的腳本呼叫，基本上不會獨立執行。其中 `msg_color.sh` 提供紅色粗體錯誤、黃色警告與綠色成功訊息格式。
