# Frontend Unit Testing

本文件記錄 Frontend Unit Test 工具鏈建立前的限制，以及未來工具鏈必須支援的 frontend-specific 行為。整體案例選擇、Coverage 與測試分工見 [`testing-strategy.md`](testing-strategy.md)。

## 目前狀態

Frontend 目前沒有 test script、test config 或測試檔，因此尚未形成可執行的 Unit Test framework、Mock API、fixture、命名或目錄慣例。

- 新增元件測試前，先檢查 `Frontend/package.json`、既有測試檔與設定。
- 不在單一元件測試工作中順帶建立或切換整套 framework。
- 若功能工作需要 Frontend Unit Test，但工具鏈仍不存在，先提出獨立且明確的工具鏈需求。
- 建立工具鏈時，必須在同一變更更新本文件的執行、命名、目錄、Mock 與 cleanup 規範。

## Frontend-specific 測試對象

- 實際 render 被測元件，不 mock 元件本身。
- 驗證使用者可觀察的畫面狀態、輸入、事件、錯誤訊息與非同步結果。
- 高優先情境是表單驗證、登入狀態、權限、route protection 與 loading／success／error UI。
- Mock API client、router、browser API、時間與其他外部邊界；不依賴真實網路或 Backend。
- 純格式化、轉換與計算邏輯使用真實實作與 fixture。

## 尚未定案的實作慣例

- Test runner 與 component testing library。
- Test filename、directory 與 fixture naming。
- API Mock 方式與共用 render helper。
- Frontend 測試註解是否必要，以及其格式與位置。

在這些項目確認前，不套用 Backend 專屬的 block comment、ESM Mock 或 fixture 命名規則，也不自行推定新格式。
