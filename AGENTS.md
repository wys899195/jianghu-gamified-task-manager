# AGENTS.md

本文件只規範 Agent 如何讀取、搜尋、修改與驗證本 repository。產品、架構、API、測試、工作流與程式碼規範由 `docs/` 擁有，本文件不建立平行規格。

## Documentation

- 任務涉及設計決策、行為規則、架構、API、測試或開發規範時，先讀 `docs/README.md`，再依其中的 category 入口讀取相關文件。
- 純檔案搜尋、程式碼定位或目錄查看，不需要載入無關 docs。
- 若 docs 與程式碼／設定不一致，指出具體差異；未經確認不得自行判定哪一方為準，也不得只為消除差異而修改其中一方。
- 使用者已確認規格變更時，實作與相關 docs 必須在同一工作中保持一致。
- `docs/README.md` 定義文件狀態、責任與權威邊界；不得把本文件當成產品或架構 source of truth。

## File Search Strategy

- 先依 `docs/conventions/project-structure.md` 判斷可能位置。
- Backend 功能先從 `Backend/src/modules/<module_name>/` 開始，依 routes → middleware → controllers → services → repositories 的資料流追蹤。
- Frontend 功能先從 `Frontend/src/` 開始。
- Schema／migration 先從 `Database/migrations/` 開始。
- 只有上述路徑無法定位時才擴大全專案搜尋。
- 優先使用 `rg`、`rg --files`，並限制搜尋範圍。

## Change Rules

- 檔案放置、命名與 TypeScript 規則遵循 `docs/conventions/`。
- 不把未確認需求或推測當成規格。
- Schema／migration 變更遵循 `docs/architecture/mysql-infrastructure.md`，本文件不重複其 lifecycle 規則。
- 不重構與目前任務無關的程式碼。
- 不忽略既有型別、測試或資料一致性檢查。
- 不硬編碼敏感資訊。
- 工作樹已有修改時，保留無關內容，不覆蓋或還原不屬於目前任務的變更。

## Testing

- 先讀 `docs/testing/README.md` 與 `docs/testing/testing-strategy.md`。
- Backend Unit Test 另讀 `docs/testing/backend-unit-testing.md`。
- Frontend Unit Test 另讀 `docs/testing/frontend-unit-testing.md`。
- API System Test 另讀 `docs/testing/api-testing.md` 與 `API-Tests/README.md`。
- 沿用既有 framework、Mock、命名、目錄與 fixture；文件與實作衝突時先指出差異。
- Backend 修改後，在 `Backend/` 執行 `npm run check`。
- Frontend 修改後，執行 `Frontend/package.json` 已定義的相關 check；不得臆測未建立的 test command。
- 文件-only 修改至少檢查 Markdown links、`git diff --check` 與本任務涉及的重複／反向引用。

## Workflow

- 需求、Backlog、Branch、PR 與 Commit 規範只由 `docs/workflow/development-workflow.md` 定義。
- 產生 staged commit message 時只分析 staged diff。
