# Project Documentation

`docs/` 保存專案的產品設計、架構決策、API 契約、測試策略、開發流程與程式碼慣例，包含已確認規則以及明確標示的提案、未定與延期內容。這些文件是 Agent 進行後續設計、實作與檢閱時的主要專案知識來源，亦供開發者查閱。

## 文件責任與權威邊界

不同資訊由不同來源負責：

| 資訊類型 | 權威來源 |
|---|---|
| 產品目標、Domain 行為與已確認規則 | `docs/product/` |
| 架構邊界與技術決策 | `docs/architecture/` |
| 對外 HTTP 契約 | `docs/api/` |
| 測試分工與測試實作規範 | `docs/testing/` |
| 需求、Git 與開發流程 | `docs/workflow/` |
| Repository、程式碼與檔案慣例 | `docs/conventions/` |
| 目前實際存在的程式流程、Schema、設定值與可執行命令 | 程式碼、`Database/migrations/`、設定檔與 `package.json` |
| Agent 的閱讀、搜尋、驗證與安全操作方式 | `AGENTS.md` |

`AGENTS.md` 是文件的使用者，不是產品、架構或開發規範的來源；`docs/` 不反向依賴 `AGENTS.md`。

文件與程式碼／設定不一致時，先指出具體差異並確認：不得自行把尚未確認的實作當成新規格，也不得為了符合舊文件而覆蓋已確認的新實作。

## 狀態用語

文件中的規則使用以下狀態：

- **已確認**：可作為設計、實作與測試依據。
- **提案**：已有偏好方向，但尚未取得實作授權，不可直接視為規格。
- **未定**：仍需補充需求或做出選擇。
- **延期**：已確認不屬於目前版本範圍。

「目前實作」只描述 repository 中可以直接驗證的狀態。若只代表設計偏好，必須標為「提案」，不得使用容易混淆的「目前方向」。

## Categories

### [`product/`](product/README.md)

產品定位、Domain／Feature 設計與版本範圍。閱讀順序及文件責任由 category README 管理。

### [`architecture/`](architecture/README.md)

現行架構、跨層責任、基礎設施與演進決策。精確 runtime 設定仍以實際設定檔為準。

### `api/`

對外 HTTP API 契約。目前包含：

- [`authentication.md`](api/authentication.md)：Auth routes、Request／Response、Cookie 與公開錯誤行為。

### [`testing/`](testing/README.md)

整體測試策略與 Backend Unit、Frontend Unit、API System Test 的實作規範。

### `workflow/`

- [`development-workflow.md`](workflow/development-workflow.md)：需求、Backlog、Issue、Branch、PR 與 Commit 流程。

### [`conventions/`](conventions/README.md)

Repository 結構、程式碼與專案檔案的撰寫慣例。

## Reading Rule

先讀本文件確認權威來源，再依任務讀取相關 category README 與詳細文件；不需要一次載入全部 docs。

詳細文件只維護自身責任。需要其他領域資訊時使用連結，不複製另一份規則；摘要只能說明依賴關係，不得建立第二份可獨立修改的規格。
