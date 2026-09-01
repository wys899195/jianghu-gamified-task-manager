# Request Validation 架構

本文件只定義共用 Request Validation 機制。Endpoint 欄位、Request／Response 與錯誤契約由 `docs/api/` 負責；Auth contract 見 [`../api/authentication.md`](../api/authentication.md)。

## 1. Responsibility

Request Validation 使用 Zod：

- 每個 API 擁有自己的 Request Schema。
- Schema 定義 transport input 格式與 transform。
- 共用 Middleware 執行 Schema。
- Service 處理業務規則。
- Database constraint 是資料完整性的最後防線。

不得把 email、password、nickname 等 endpoint-specific 規則硬寫進共用 Middleware。

## 2. Validation Middleware

核心流程：

```text
Request
→ schema.safeParse(req.body)
├─ result.success = true
│  → req.body = result.data
│  → next()
└─ result.success = false
   → next(result.error)
   → ApiErrorHandler
   → 400 Request Validation Error
```

成功後必須使用解析後的 `result.data` 覆寫 request body，因為 `.trim()` 等 Zod transform 不會修改原始 input。

Validation 失敗時，Middleware 將 `result.error` 傳給共用 Error Handler；Error Handler 對 `ZodError` 明確回應 400，不由 Middleware 直接送 Response。錯誤處理責任見 [`api-error-handling.md`](api-error-handling.md)。

## 3. Schema Ownership

- 每個 endpoint 的 Request Schema 使用獨立或責任清楚的檔案。
- Schema 數量少時可直接 import；數量增加且確實改善 import boundary 時再建立 barrel export。
- 使用 `z.infer<typeof schema>` 推導 TypeScript type，避免 Schema 與手寫 type 平行維護。
- Schema 只負責格式、型別與 transport-level transform，不查 Database、不執行 bcrypt、不判斷權限。
- Uniqueness 等業務條件由 Service 判斷，Database 保留 constraint 以處理 race condition。

## 4. Validation 與 Authentication 邊界

### Request Validation Error

例如欄位缺失、型別錯誤、空值、格式錯誤或 Schema 不合法。這些輸入尚未進入 Credential／Authorization 判斷。

### Authentication／Authorization Error

例如帳號或密碼不正確、Access Token 無效、Refresh Token 無效或權限不足。這些由相關 Domain 流程選擇穩定 error code。

兩種錯誤不得混在一起，也不得為了處理格式錯誤把大量 Request 規則移入 Service。

## 5. Frontend／Backend Boundary

- Frontend validation 提供快速 UX，不是安全邊界。
- Backend validation 才負責拒絕不合法的 API input。
- 像 confirm password 等純 UI 欄位是否進入 API，必須由該 endpoint contract 明確決定，不可自行加入。

## 6. 未定問題

- Email 等可共用 field schema 的最終放置位置。
- 是否需要欄位級 error details，以及公開內容的安全邊界。
- 多餘欄位與超大 Request 的最終拒絕策略。

這些問題確認前，不重構整套 Validation 或 Error 架構。
