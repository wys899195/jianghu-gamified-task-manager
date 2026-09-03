# API System Test 操作說明

此目錄保存目前可執行的 Postman API System Test 資產；測試設計與 DB 邊界見 [`../docs/testing/api-testing.md`](../docs/testing/api-testing.md)。

## 目前資產

```text
API-Tests/
├── account-collection.json
├── auth-collection.json
├── auth-session-collection.json
├── health-collection.json
├── local-environment.json
└── data/
    └── register.json
```

- `*-collection.json`：Request、流程與 Test Script。
- `*-environment.json`／`local-environment.json`：環境差異。
- `data/`：Data-Driven testcase input 與 expected result。

## 執行前檢查

- 使用專用且可重建的 test database，不連 development／production database。
- 先執行最新 migrations。
- 確認 Backend 已以 test environment 啟動，且 environment 中的 `baseUrl` 指向該 Backend。
- 使用實際安裝的 Postman CLI 讀取 collection、environment 與需要的 data file。

Repository 已提供 `sh/test/run_api_test.sh` 作為統一入口。先依 [`sh/README.md` 的 API 測試流程](../sh/README.md#api-測試)啟動 test 環境與 Backend，再在另一個終端機執行：

```sh
sh/test/run_api_test.sh
```

此 runner 依序執行 health、註冊、Auth Session 與 account collections，並為註冊 collection 載入 `data/register.json`。Auth Session collection 會建立專用測試帳號，驗證重複 Email、登入、Refresh、登出與 Refresh Cookie 的生命週期。Account collection 會自行建立並刪除專用測試帳號，以完整流程驗證身份驗證、密碼確認、hard delete、Refresh Cookie 清除與 Session cascade。若日後重整為 `collections/`、`environments/` 等目錄，必須在同一變更中更新 runner 與本文件。
