# API System Test 與 Postman CLI

## 1. Responsibility

API System Test 驗證完整 Backend HTTP flow，不取代 Unit Test。目前 Repository、migration、SQL、constraint 與 DB state 也由 API System Test 搭配 Dedicated Test DB 驗證；若未來 transaction、併發或 SQL 除錯成本提高，再評估獨立 Repository / DB Integration Test。

目前使用 Postman CLI。

測試資產位於：

```text
API-Tests/
```

應提供統一執行入口，例如 `run_api_test.sh`；實際路徑以 repository 為準。

## 2. Test Asset Responsibilities

### Environment

只保存環境差異，例如：

- `baseUrl`。
- API version。
- deployment-specific endpoint。
- environment-specific values。
- 必要的固定測試帳號。

Environment 不作 testcase database。

### Collection

負責：

- Request 定義。
- URL。
- headers。
- 共用 Pre-request Script。
- 共用 Test Script。
- 測試流程。

### Data JSON

負責：

- testcase name。
- request body。
- expected status。
- 必要時 expected error code / fields / schema。

### `pm.variables`

保存本次 iteration / request 的暫時資料，例如 unique email。

暫時資料不優先寫入 Environment。

## 3. Data-Driven Testing

Testcase 少時可使用：

```text
一個 testcase = 一個 Request
```

Testcase 增加後優先：

```text
一個 API = 一個 Request
+ 外部 testcase data
+ 共用 Pre-request / Test Script
```

API test 的可讀性優先於過度 DRY。

## 4. Request Body Shape

當 Failure Case 的 request shape 不同，例如：

- missing email。
- missing password。
- 欄位不存在。
- 不同型別。

不要用空字串假裝欄位不存在。

可把整個 `body` 放進 testcase data，Pre-request Script 再 `JSON.stringify()`。

## 5. Suggested Asset Structure

```text
API-Tests/
├── collections/
├── data/
├── environments/
└── run_api_test.sh
```

責任：

- `collections/`：Requests 與共用 scripts。
- `data/`：testcase input / expected result。
- `environments/`：環境設定。
- `run_api_test.sh`：Postman CLI 執行入口。

實際 Collection 拆分方式依 API 數量調整。

## 6. Database Verification Boundary

API System Test 使用可重建的 Dedicated Test DB，且不得連接 development / production database。

目前由此層共同驗證：

- migration 能正確建立測試 Schema。
- Repository 實際 SQL 能透過完整 HTTP flow 正常執行。
- UNIQUE / FK / NOT NULL 等重要 constraint。
- 必要的 DB state 與資料 mapping。
- 與 API 行為直接相關的 transaction 結果。

不要為了測試 SQL 而在 Unit Test 連接 MySQL。

## 7. Test Case Density

核心 API 優先涵蓋：

- Happy Path。
- 一到數個高價值 Failure Case。
- 代表性 invalid input。
- Authentication / Authorization。
- 重要 Business Error。
- 必要 DB state。

API System Test 不重複所有 Schema boundary permutation。

## 8. Auth V1 Verification

Auth API 的核心 flow：

```text
Register
→ Login
→ Access Token
→ Refresh
→ Logout
→ Session revoke / expiry
```

至少驗證：

### Login

- 正確帳號 + 正確密碼 → 200。
- 回傳 Access Token。
- 設定 Refresh Token Cookie。
- 錯誤帳號 → 401 `USER_INVALID_CREDENTIALS`。
- 錯誤密碼 → 401 `USER_INVALID_CREDENTIALS`。
- 代表性的 invalid schema → 400。

### Refresh

- 有效 Refresh Session → 新 Access Token。
- Session revoked → 401。
- Session expired → 401。
- V1 Refresh Token 不 Rotation。
- 可更新 `last_used_at`。
- 不延長 `expires_at`。

### Logout

- 撤銷目前 Session。
- 清除 Cookie。
- 不依賴 Access Token。
- 無 Refresh Cookie → 204。
- Logout 後原 Refresh Token → 401。
- 其他有效 Session 不受影響。

### Protected API

- `authenticateRequest` 只驗 Access Token。
- 不查 `auth_sessions`。
- Access Token expired / invalid → 401。

## 9. Regression Note

曾出現「Login 缺少 password 卻得到 500」的問題。

遇到此類問題優先檢查：

```text
AuthRoutes
→ LoginRequestSchema
→ ValidationMiddleware
→ ErrorHttpStatusMap
```

不要先把 Request 格式檢查大量移入 AuthService。

## 10. Implementation Status

實際 Collection、Environment、shell entrypoint 與 Backend URL 以 repository 最新內容為準，不使用舊對話範例覆蓋現況。
