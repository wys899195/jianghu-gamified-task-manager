# Project Documentation

`docs/` 保存目前專案的現行設計與規範。這些文件是 GPT 與 Codex 進行後續設計、實作與檢閱時的主要專案知識來源。

## Categories

### `product/`

產品定位與 Domain / Feature 設計。

- `product-principles.md`：產品定位、品牌、核心產品原則與 V1 Scope Guardrails。
- `task-system.md`：Task、Today、Progress、Activity History、Reflection 與 Reward。
- `martial-progression.md`：武學傳承、殘章、境界、修為與主修。
- `martial-acquisition-and-exploration.md`：機緣、尋訪、多來源武學取得、探索與師承。
- `collection-and-endgame.md`：圖鑑、Collection / Inventory 邊界、個人修行史與自創武學。

### `architecture/`

系統與技術架構。

- `system-architecture.md`：技術棧、Backend 分層、Modular Monolith、AI 與 Logging 方向。
- `authentication.md`：Access Token、Refresh Session、Auth API 與 Session lifecycle。
- `request-validation.md`：Zod Request Schema、Validation Middleware 與 400 / 401 邊界。
- `mysql-infrastructure.md`：MySQL 容器化、connection pool、backup 與 migration 相關方向。
- `data-ownership.md`：Domain Data Ownership、JOIN boundary 與 database-per-service 演進。
- `deployment-evolution.md`：Docker Compose、Kubernetes、微服務與 repository 演進。

### `testing/`

測試策略與各測試類型的實作規範。

- `testing-strategy.md`：整體測試分工、案例設計、Coverage 與測試工作流。
- `backend-unit-testing.md`：Backend Unit Test、Jest ESM、Mock、fixture 與目錄規範。
- `frontend-unit-testing.md`：Frontend Unit Test 原則與工具鏈建立前的限制。
- `api-testing.md`：Postman CLI、Data-Driven API Test、Repository / DB 驗證與完整 Backend HTTP flow。

### `workflow/`

需求與開發流程。

- `development-workflow.md`：User Story、Use Case、Acceptance Criteria、Backlog、Issue、Branch 與 PR。

## Reading Rule

依目前任務閱讀相關文件，不需要一次載入全部 docs。

若某個 category 未來增加多個子領域、文件數量明顯增加或需要特定閱讀順序，再在該 category 建立子目錄與 `README.md`。

文件與實際程式碼／設定不一致時，先指出差異並確認，不自行把未確認內容當成現行規格。
