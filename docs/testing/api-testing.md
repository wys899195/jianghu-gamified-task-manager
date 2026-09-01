# API System Test 與 Postman

本文件規範 API System Test 的 Postman 資產責任、Data-Driven 設計與 HTTP／DB 驗證方式。測試資產的目前檔名與執行準備見 [`../../API-Tests/README.md`](../../API-Tests/README.md)。

## 1. Responsibility

API System Test 驗證完整 Backend HTTP flow，不取代 Unit Test：

```text
HTTP
→ Express
→ Middleware
→ Controller
→ Service
→ Repository
→ Dedicated Test DB
```

整體案例密度、Unit／API 分工與 DB boundary 由 [`testing-strategy.md`](testing-strategy.md) 統一管理。

## 2. Test Asset Responsibilities

### Environment

只保存環境差異，例如 `baseUrl`、API version、deployment-specific endpoint 與必要固定測試帳號；Environment 不作 testcase database。

### Collection

負責 Request、URL、headers、共用 Pre-request／Test Script 與測試流程。

### Data JSON

負責 testcase name、request body、expected status，以及必要的 expected fields／schema。API 公開契約由 `docs/api/` 擁有，Data JSON 只選擇並執行其中的高價值案例。

### `pm.variables`

保存本次 iteration／request 的暫時資料，例如 unique email。暫時資料不優先寫入 Environment。

## 3. Data-Driven Testing

Testcase 少時可使用一個 testcase 對應一個 Request。Testcase 增加後優先使用：

```text
一個 API = 一個 Request
+ 外部 testcase data
+ 共用 Pre-request / Test Script
```

API test 可讀性優先於過度 DRY。

## 4. Request Body Shape

Failure Case 的 request shape 不同時，例如 missing field 或錯誤型別，不要用空字串假裝欄位不存在。可將完整 `body` 放進 testcase data，再由 Pre-request Script `JSON.stringify()`。

## 5. Database Verification Boundary

API System Test 必須遵循 [`testing-strategy.md` 的 Repository／DB 驗證邊界](testing-strategy.md#repository-db-boundary)：

- 使用可重建的 Dedicated Test DB。
- 不連 development／production database。
- 先執行最新 migrations。
- 驗證真實 Repository、SQL、constraint 與必要 DB state，不 mock 正在測試的 integration boundary。

## 6. Test Case Density

核心 API 優先涵蓋 Happy Path、高價值 Failure Case、代表性 invalid input、Auth／Permission、重要 Business Error 與必要 DB state。

API System Test 不重複所有 Schema boundary permutation。像 Auth route、Cookie、Request／Response 與 status 等 expected behavior，應引用 [`Authentication API Contract`](../api/authentication.md)，不得在本文件維護第二份 Auth 規格。

## 7. Regression Handling

已發生且值得長期保護的 bug 以可執行 regression testcase 保存。除錯時依實際 Route → Schema／Middleware → Controller／Service → Error Handler 流程定位，不在本規範長期保存可能改名的類別清單。

## 8. Asset Layout Evolution

目前資產仍是平面 collection／environment 加上 `data/`；實際狀態見 `API-Tests/README.md`。只有在 collection 數量或操作成本明顯增加時，再評估 `collections/`、`environments/` 與統一 runner；結構變更必須和資產及操作文件同時完成。
