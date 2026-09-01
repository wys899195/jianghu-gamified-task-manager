# API Error Handling 架構

## Responsibility

本文件定義可預期業務錯誤如何跨越 Service 與 HTTP 邊界，不保存各模組公開訊息的平行副本。

已確認的資料流：

```text
Service / Middleware / Controller
→ throw ServiceError(stableCode)
→ module-owned error response map
→ app 組裝所有 module maps
→ createApiErrorHandler(errorResponseMap)
→ HTTP status + public message
```

## Ownership

- `ServiceError`：攜帶穩定 error code，不攜帶可直接公開的 status 或 message。
- Module error definitions：擁有該 Domain 的 error code，以及 code 對應的 `{ statusCode, message }`。
- App composition root：組裝各 module 的 response map，注入共用 Error Handler。
- `ApiErrorHandler`：依 map 轉換已知錯誤；未映射或非預期錯誤回傳通用 500，不洩漏內部內容。
- Domain Service／Middleware：只選擇穩定 code，不自行撰寫公開 message。

目前 User module 的實作來源是 `Backend/src/modules/user/apiErrors/UserErrors.ts`；精確 status 與 message 只在該 Backend map 維護，本文件不複製其內容。

## Request Validation Error

Zod 驗證錯誤由共用 Error Handler 處理並回傳 400。Validation Middleware 只執行 Schema、以解析後資料覆寫 request body，失敗時呼叫 `next(error)`，不直接送出 Response。

Request 格式錯誤與 Credential／Authorization 錯誤是不同邊界：前者由 Request Schema 判定，後者由業務或身份驗證流程轉成穩定 Domain error code。

## Guardrails

- 不建立 status-only map 與 message map 的平行資料來源。
- 不在 Service、Middleware 或 Controller 重複公開訊息。
- 新增 module error 時，由該 module 定義 code 與 public response，再加入 app composition。
- API 文件可列出對外 status 與穩定錯誤語義，但不得複製容易漂移的公開 message；精確 message 以 Backend response map 為準。
- 測試分別驗證 Domain 選擇的 code，以及 Error Handler 對 map 的轉換，不把兩層責任混成單一 mock-heavy 測試。
