# 測試策略

本文件擁有測試分層、案例選擇、Coverage 與 Unit／API／E2E 的責任分工；framework、Mock API、fixture、目錄與命名由各測試類型文件負責。

## 1. Current Testing Pyramid

```text
Static Checks
→ Unit Test
→ API System Test
→ E2E（前端穩定後再評估少數核心流程）
```

| Layer | 主要驗證 | 外部依賴 |
|---|---|---|
| Static Checks | TypeScript、Lint、Build | 無服務依賴 |
| Unit Test | Service、Middleware、Validation、Utility、Domain rule | Mock／Stub 邊界 |
| API System Test | Express HTTP flow、Repository、SQL、constraint、DB state | Backend + Dedicated Test DB |
| E2E | 少數核心前後端使用流程 | 後期 |

現階段不追求每層都有 Integration suite、重複 API integration tests、exhaustive path testing 或 Enterprise 等級的完整 Acceptance layer。

## 2. Unit Test Responsibility

Unit Test 隔離一個可獨立驗證的單元，外部 dependency 使用 mock／stub。

優先驗證：

- Business rule、branch 與 error path。
- Authentication、authorization 與資料隔離。
- Boundary、validation 與 utility。
- Public／observable behavior。

可使用白箱資訊找 branch，但 assertion 以黑箱可觀察行為為主；不以 private function、local variable、無業務意義的 call order 或純 implementation detail 作主要 assertion。

Backend 與 Frontend 的 framework-specific 規範分別見 [`backend-unit-testing.md`](backend-unit-testing.md) 與 [`frontend-unit-testing.md`](frontend-unit-testing.md)。

## 3. Repository／DB 驗證邊界

<a id="repository-db-boundary"></a>

Repository 與 MySQL 不在 Unit Test 中直接驗證 SQL。目前由 API System Test 搭配 Dedicated Test DB 驗證：

- migrations 與 schema compatibility。
- SQL syntax、table、column 與 mapping。
- UNIQUE／FK／NOT NULL。
- insertId、affected state 與必要 DB state。
- 可由完整 API flow 驗證的 transaction 行為。

核心原則：

> 不要 mock 正在驗證的 integration boundary。

Automated Test 使用可重建的 Dedicated Test DB，不修改 development／production data。若 transaction、併發或 SQL 除錯成本明顯提高，再評估獨立 Repository／DB Integration Test。

## 4. API System Test Responsibility

```text
HTTP
→ Express
→ Middleware
→ Controller
→ Service
→ Repository
→ Dedicated Test DB
```

主要驗證 Request／Response、HTTP status、auth／permission、middleware wiring、business error mapping 與 DB state。

每個核心 API 優先選擇：

- 至少一個 Happy Path。
- 一到數個高價值 Failure Case。
- 代表性的 invalid input。
- Auth／Permission。
- 重要 Business Error。
- 必要 DB state。

API 數量不等於 testcase 數量；不要把所有 Unit Validation permutation 複製到 API System Test。Postman 實作規範見 [`api-testing.md`](api-testing.md)。

## 5. Selective Test Case Design

不追求 Exhaustive Testing。優先使用：

- Equivalence Partitioning。
- Boundary Value Analysis。
- Branch／Error Path。
- Risk-based Selection。
- Previously Buggy Behavior 的 regression case。

只有 cross-field rules 互相影響時，再補重要組合。

## 6. Coverage

Coverage 用來找未被執行的區域，不把 100% 當作品質目標。優先關注 Line 與 Branch Coverage，並優先保護 Service business branches 與 error paths，而不是為薄 Repository wrapper 追求高數字。

## 7. Development Workflow

### New Feature

```text
已確認需求 / Business Rule
→ 選擇高價值案例
→ Service / Middleware Unit Test
→ 實作
→ 涉及 HTTP / Repository / DB 時補 API System Test
→ Coverage 檢查高風險 branch
→ 必要 Refactor
```

不要求所有功能嚴格 TDD，但功能完成前必須思考高風險案例。

### Bug Fix

```text
重現 Bug
→ Regression Test
→ 確認會 Fail
→ 修 Production Code
→ 確認 Pass
→ 跑相關 API System Test
```

### Refactor

Refactor 前相關 tests 應為 green。若缺少保護此次重構的案例，先補最小 regression safety net；純 Refactor 不改變 Observable Behavior。

## 8. Time-limited Priority

1. 核心 Service、Business Rule、Auth、Permission 與 Error Path Unit Test。
2. 核心 API Happy Path、重要 Business Error、Auth／Permission、代表性 invalid input 與必要 DB state。
3. 用 Coverage 補高風險 branch。
4. 只有 SQL／transaction／concurrency 風險升高時，再建立獨立 Repository／DB Integration Test。

E2E、Performance、Security 專項與真正微服務化後的 Contract Test 後做。

> 測試目標是在有限時間內建立最高價值的安全網，而不是追求最多測試。
