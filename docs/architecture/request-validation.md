# Request Validation 設計

## 1. Responsibility

Request Validation 使用 Zod。

目標：

- 建立通用 Validation Middleware。
- 每個 API 有自己的 Request Schema。
- Schema 定義 Request 格式。
- Middleware 執行 Schema。
- Service 處理業務規則。
- Database 保留最終資料完整性限制。

不把 email / password / nickname 等 endpoint-specific 規則硬寫進 Middleware。

## 2. Validation Middleware

核心流程：

```text
Request
→ schema.safeParse(req.body)
→ success：req.body = result.data
→ next()
→ failure：next(error)
→ ApiErrorHandler
```

成功後必須使用：

```ts
req.body = result.data;
```

原因是 `.trim()` 等 Zod transform 只反映在 `result.data`。

Validation 失敗交由 `ApiErrorHandler` 統一回應，不由 Middleware 直接送 Response。

每個 endpoint 的 Request Schema 使用獨立檔案。

Schemas 數量少時不需要先建立 `index.ts`；可直接 import，未來數量增加再評估 barrel export。

## 3. Register Request

### Email

- 必須是 string。
- `.trim()`。
- 使用目前指定的 Email regex 做格式驗證。

### Password

- 必須是 string。
- 至少 8 字元。
- 至少一個英文字母。
- 至少一個數字。
- 不使用 `.trim()`，避免修改密碼內容。

### Nickname

- 必須是 string。
- `.trim()`。
- min 1。
- max 50。
- max 50 與 DB `VARCHAR(50)` 對齊。
- 中英文皆可。
- Unicode / Emoji grapheme 特殊長度處理不屬 V1 必要範圍。

Schema 可用 `z.infer<typeof schema>` 推導 TypeScript type，避免 Schema 與手寫 type 重複維護。

Register Schema 不負責：

- Email 是否已存在。
- bcrypt。
- DB 存取。
- 權限。
- 其他業務規則。

Email uniqueness 由 Service 檢查，Database 仍需要 UNIQUE constraint 作為 race condition 的最後防線。

## 4. Login Request

### Email

- required。
- string。
- trim。
- 使用與 Register 相同的基本 Email 格式驗證。
- Email 是否存在由 Service 判斷。

### Password

- required。
- string。
- `.min(1)`。
- 不重複套用 Register 的 8 字元／英數混合政策。

原因：

Login 的責任是把輸入交給 `bcrypt.compare()` 驗證既有 hash；建立／修改密碼時的 policy 不應阻止舊合法帳號登入。

## 5. 400 / 401 Boundary

### 400 Bad Request

例如：

- Email 格式錯誤。
- Email 空字串。
- Password 空字串。
- 欄位缺失。
- 型別錯誤。
- Schema 不合法。

### 401 Unauthorized

例如：

- Email 不存在。
- Password 錯誤。
- Access Token 無效。
- Refresh Token 無效。

登入時 Email 不存在與 Password 錯誤統一為：

```text
USER_INVALID_CREDENTIALS
```

Validation Error 與 Credential Error 不應混在一起。

## 6. Frontend / Backend Boundary

Frontend Validation 主要提供快速 UX。

Backend Validation 才是安全與資料正確性的邊界。

Confirm Password 通常可由 Frontend 驗證；API 是否接收 `confirmPassword` 尚未要求，不能自行加入。

## 7. Open Questions

- `ServiceError` 是否適合直接承接 `CommonErrorCode`。
- `ErrorHttpStatusMap` 是否已包含 `INVALID_REQUEST: 400`。
- Email regex 最終共用位置。
- 是否需要欄位級錯誤 details；V1 不需要因此先重構整套錯誤架構。
- 多餘欄位與超大 request 的最終安全策略。
