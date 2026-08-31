# Authentication 設計

## 1. V1 Scope

V1 Auth 包含：

- Register。
- Login。
- Logout。
- 短效 Access Token。
- 長效 Refresh Token。
- Refresh Token 放在 HttpOnly Cookie。
- Refresh Session 保存在 MySQL `auth_sessions`。
- Access Token 過期後以 Refresh Token 取得新的 Access Token。

V1 暫不實作：

- Refresh Token Rotation。
- Token Family。
- Reuse Detection。
- 多裝置 Session UI 管理。

## 2. 核心架構

- Access Token 驗證：Stateless。
- Refresh Session 管理：Stateful。
- 一般受保護 API 不需要每次查 Session DB。
- Refresh / Logout 保留 Server-side state。
- Refresh Token 建議使用高熵 random opaque token。
- Server-side 只保存 Refresh Token hash，不保存明文。

版本邊界：

- V1：基本 Register / Login / Refresh / Logout 與 Refresh Session。
- V2：Rotation、Token Family、Reuse Detection、Session security 強化。
- V3：多裝置 Session、指定 revoke、登出所有裝置與完整 Session 管理。

## 3. Login

每次成功 Login：

- 產生新的 Access Token。
- 產生新的 Refresh Token。
- 建立新的 `auth_session`。
- 更新 last login。
- Access Token 回傳 JSON。
- Refresh Token 設定 HttpOnly Cookie。

同一設備重複登入時，V1 允許每次建立新的 Session。

瀏覽器 Cookie 會被新的 Refresh Token 覆蓋，但舊 Session 可能仍存在直到 revoked / expired / cleanup。

V1 不要求「同設備只能一個 Session」。

帳號不存在與密碼錯誤統一回 `USER_INVALID_CREDENTIALS`，避免洩漏 Email 是否存在。

## 4. Refresh

Refresh：

- 從 HttpOnly Cookie 取得 Refresh Token。
- hash 後查詢 `auth_sessions`。
- Session 必須 `revoked_at IS NULL`。
- Session 必須 `expires_at > NOW()`。
- 可更新 `last_used_at`。
- 產生新的 Access Token。
- V1 不更換 Refresh Token。
- 不建立新的 Session。
- 不延長 `expires_at`。

## 5. Logout

Logout：

- 使用目前瀏覽器的 Refresh Token。
- 不依賴 Access Token。
- 不使用 `authenticateRequest`。
- 撤銷目前 Refresh Session。
- 清除 HttpOnly Cookie。
- 回 `204 No Content`。
- 沒有 Refresh Cookie 時仍視為成功，保持 idempotent。
- 只撤銷目前 Session，不撤銷其他 Session。

Logout 後：

- 目前 Refresh Token 不可再 Refresh。
- 其他有效 Session 不受影響。
- 已簽發且尚未過期的 Access Token 在 V1 仍可能有效到自身 `exp`。

這是刻意接受的 V1 trade-off，以維持一般 Access Token 驗證 Stateless。

## 6. Access Token

目前使用 `jsonwebtoken`。

Access Token：

- 短效。
- 驗證 signature、expiration、payload。
- Payload 主要包含 `accountId`。
- 不處理 Refresh Token。
- 不負責 Session 管理。
- 不查 `auth_sessions`。

即使未來加入 `jti`，V1 也不使用 `jti` 查 Session DB 作為每次 API 的身份驗證依據。

## 7. authenticateRequest

責任：

- 取得 Authorization Header。
- 驗證 Bearer Token 格式。
- 驗證 Access Token。
- 驗證失敗／過期轉為 `USER_INVALID_ACCESS_TOKEN`。
- 成功後只把 `accountId` 放入 `res.locals.auth`。

不負責：

- Refresh Token。
- Refresh Session。
- `auth_sessions` 查詢。
- `payload.jti` / `existsByJti()`。

`/auth/login`、`/auth/refresh`、`/auth/logout` 不使用 `authenticateRequest`。

## 8. Refresh Token Cookie

目前方向：

- `httpOnly: true`
- `secure: true`
- `sameSite: 'strict'`
- `maxAge` 與 Refresh Session 有效期限一致

Middleware 順序：

```text
express.json()
→ cookieParser()
→ Routes
→ Error Handler
```

Cookie 名稱目前規劃為：

```text
refreshToken
```

## 9. auth_sessions

`auth_sessions` 代表 Refresh Session，而不是 Access Token jti Session。

至少需要表達：

- `id`
- `account_id`
- `refresh_token_hash`
- `created_at`
- `last_used_at`
- `expires_at`
- `revoked_at`

核心規則：

```sql
revoked_at IS NULL
AND expires_at > NOW()
```

可清理：

```sql
DELETE FROM auth_sessions
WHERE revoked_at IS NOT NULL
   OR expires_at <= NOW();
```

如果實際 DB Schema 仍是舊版 `jti` 模型，實作前必須先確認並處理差異。

## 10. Application Flow

### Register

```text
檢查 Email 是否存在
→ bcrypt hash
→ createAccount()
→ 回傳 accountId
```

### Login

```text
findAuthByEmail()
→ bcrypt.compare()
→ 產生 Refresh Token
→ 建立 auth_session
→ 產生 Access Token
→ updateLastLogin()
→ 回傳 accessToken + refreshToken
```

### Refresh

```text
Refresh Cookie
→ hash token
→ 查 Session
→ 驗證 revoked / expired
→ 更新 last_used_at
→ 產生新 Access Token
```

### Logout

```text
Refresh Cookie（若有）
→ revoke Session
→ clearCookie()
→ 204
```

## 11. Routes

V1 路由責任：

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

- Register / Login 使用 Request Validation Middleware。
- Refresh / Logout 不使用 `authenticateRequest`。
- 其他需要登入身份的 API 才使用 `authenticateRequest`。

## 12. Frontend Concurrent Refresh

多個 API 同時因 Access Token 過期收到 401 時，不應各自呼叫 `/auth/refresh`。

Frontend 使用 `refreshPromise` / mutex / single-flight：

- 第一個 Request 發起 refresh。
- 其他 Request 等待同一 Promise。
- Refresh 成功後共同使用新的 Access Token retry。

V1 即可採此模式；V2 加入 Rotation 後更加重要。

## 13. Design Rationale

已選擇：

- Access Token + Refresh Token，而不是傳統每次 API 都查 Session Store。
- Stateful Refresh Session，而不是完全 Stateless Refresh Token。
- 不採 Access Token jti → `auth_sessions` → 每 Request 查 MySQL。
- V1 不做 Refresh Token Rotation，以降低 Token Family、Reuse Detection、atomic refresh 與 concurrent refresh 的實作複雜度。

V1 Rotation trade-off：同一 Refresh Token 在 revoke / expiry 前可重複使用，被竊時風險較高。

## 14. Implementation Status Rule

本文件描述設計目標，不代表對話中的程式碼片段已經存在於 repository。

實作前應以實際程式碼、DB schema 與測試結果確認目前狀態；若實作與本文件衝突，先指出差異，不自行推翻已收斂的設計。
