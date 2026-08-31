# 測試策略

## 1. Testing Pyramid for Current Project

目前單人 Modular Monolith 專案主要使用：

```text
Static Checks
→ Unit Test
→ API System Test
→ E2E（前端穩定後再評估核心流程）
```

| Layer | 主要驗證 | 外部依賴 |
|---|---|---|
| Static Checks | TypeScript、Lint | 無 |
| Unit Test | Service、Middleware、Validation、Utility、Domain rule | Mock / Stub dependencies |
| API System Test | Express HTTP flow、Middleware、Service、Repository、SQL、constraint、DB state | Backend + Dedicated Test DB |
| E2E | 少數核心前後端使用流程 | 後期 |

目前不建立獨立 Repository / DB Integration Test layer；Repository、migration、SQL、constraint 與完整 DB flow 先由 API System Test 搭配可重建的 Dedicated Test DB 驗證。若未來 transaction、併發或 SQL 除錯成本提高，再評估加入獨立 Repository Integration Test。

現階段不追求：

- 每層都建立 Integration suite。
- 重複 API Integration Test。
- exhaustive path testing。
- Enterprise 等級完整 Acceptance Test layer。

## 2. Unit Test

Unit Test 隔離一個可獨立驗證的單元，其他 dependency 使用 mock / stub。

Backend 與 Frontend 的具體工具鏈、Mock、命名與目錄規範分別見 `backend-unit-testing.md` 與 `frontend-unit-testing.md`。

優先測：

- Business Rule。
- Branch。
- Error Path。
- Boundary。
- Validation。
- Utility。
- Public / Observable Behavior。

可以使用白箱資訊找 branch，但 assertion 優先驗證黑箱 observable behavior。

通常不要以以下內容作主要 assertion：

- private function。
- local variable。
- 純 implementation detail。
- 無業務意義的 call order。

## 3. Repository / DB 驗證邊界

Repository 與 MySQL 不在 Unit Test 中直接驗證 SQL。

目前由 API System Test 搭配 Dedicated Test DB 驗證：

- migration。
- SQL syntax。
- table / column。
- mapping。
- UNIQUE / FK / NOT NULL。
- insertId / affected state。
- transaction 與 schema compatibility 中能由完整 API flow 驗證的部分。

核心原則：

> 不要 mock 正在驗證的 integration boundary。

Automated Test 使用可重建的 Dedicated Test DB，不修改 development / production data。

若未來 transaction、併發或 SQL 除錯成本提高，再評估建立獨立 Repository / DB Integration Test。

## 4. API System Test

API System Test 驗證：

```text
HTTP
→ Express
→ Middleware
→ Controller
→ Service
→ Repository
→ Dedicated Test DB
```

主要檢查：

- Request / Response。
- HTTP status。
- Authentication / Authorization。
- Middleware wiring。
- Business error mapping。
- DB state。

API 數量不等於 testcase 數量。

每個核心 API 優先：

- 至少一個 Happy Path。
- 一到數個高價值 Failure Case。
- 代表性的 invalid input。
- Auth / Permission。
- 重要 Business Error。
- 必要 DB state。

不要把所有 Unit Validation permutation 複製到 API System Test。

Postman CLI 細節見 `api-testing.md`。

## 5. Selective Test Case Design

不追求 Exhaustive Testing。

優先使用：

- Equivalence Partitioning。
- Boundary Value Analysis。
- Branch / Error Path。
- Risk-based Selection。
- Previously Buggy Behavior。

只有 cross-field rule 互相影響時，再補重要組合。

## 6. Coverage

Coverage 用來找未被測試執行的區域，不把 100% 當作品質目標。

優先關注：

- Line Coverage。
- Branch Coverage。

比起薄 Repository wrapper 的高 coverage，更優先保護 Service business branch 與 error path。

## 7. Setup / Cleanup

### `beforeAll`

只用於整組共用且昂貴的資源。

### `beforeEach`

適合：

- reset mock。
- clean baseline。
- 共用 service instance。
- 每個 testcase 都需要的最低 fixture。

不要在 `beforeEach` 隱藏特定 business scenario。

### `afterEach`

testcase cleanup。

### `afterAll`

關閉：

- DB pool。
- server。
- shared resource。

## 8. Development Workflow

### New Feature

```text
需求 / Business Rule
→ 高價值 Test Case
→ Validation equivalence + boundary
→ Service / Middleware Unit Test
→ 實作
→ API System Test（涉及核心 HTTP / Repository / DB flow 時）
→ Coverage 檢查高風險 branch
→ 必要 Refactor
```

不要求所有功能嚴格 TDD，但應在功能完成前思考測試案例。

### Bug Fix

```text
重現 Bug
→ Regression Test
→ 確認 Fail
→ 修 Production Code
→ 確認 Pass
→ 跑相關 API System Test
```

### Refactor

Refactor 前相關 tests 應為 green。

若缺少保護此次重構的關鍵案例，先補最小 regression safety net。

純 Refactor 不應改變 Observable Behavior。

## 9. Codex Testing Workflow

Codex 執行測試任務時：

```text
Read
→ Analyze
→ Generate / Modify
→ Run
→ Diagnose
→ Fix
→ Re-run
→ Report
```

應先讀：

- `AGENTS.md`。
- 相關 testing docs。
- `package.json`。
- test config。
- target production code。
- schema / repository / error definitions。
- nearby existing tests。

遵循既有 framework、Mock、命名、目錄與 fixture。

## 10. Priority When Time Is Limited

### Priority 1

- 核心 Service Unit Test。
- Business Rules。
- Auth。
- Permission。
- Error Paths。

### Priority 2

- 核心 API System Test。
- Happy Path。
- 重要 Business Error。
- Auth / Permission。
- Representative Invalid Input。
- 重要 SQL / Constraints / DB state。

### Priority 3

- Coverage 補高風險 Branch。

### Priority 4

- 若 transaction、併發或 SQL 除錯成本已明顯提高，再評估獨立 Repository / DB Integration Test。

後做：

- E2E。
- Performance Test。
- Security 專項測試。
- Contract Test（真正微服務化後）。

> 測試目標是在有限時間內建立最高價值的安全網，而不是追求最多測試。
