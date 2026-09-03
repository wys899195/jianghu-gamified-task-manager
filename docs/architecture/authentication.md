# Authentication 架構

本文件擁有 Access Token、Refresh Session 與身份驗證 lifecycle 的安全設計。HTTP routes、Request／Response 與 Cookie contract 見 [`../api/authentication.md`](../api/authentication.md)。

## 1. V1 Scope

已確認包含：

- Register、Login、Refresh、Logout。
- 短效 Access Token。
- 長效 opaque Refresh Token。
- Refresh Token 放在 HttpOnly Cookie。
- Refresh Session 保存在 MySQL `auth_sessions`。
- Access Token 過期後以 Refresh Token 取得新 Access Token。

延期至後續版本：

- V2：Refresh Token Rotation、Token Family、Reuse Detection 與 Session security 強化。
- V3：多裝置 Session UI、指定 revoke、登出所有裝置與完整 Session 管理。

## 2. 核心安全模型

- Access Token 驗證是 Stateless；一般受保護 API 不在每次 Request 查 `auth_sessions`。
- Refresh／Logout 使用 Server-side Refresh Session state。
- Refresh Token 使用高熵 random opaque token；Server-side 只保存 hash，不保存明文。
- 已簽發且尚未過期的 Access Token 在 V1 Logout 後仍可能有效到自身 `exp`。

最後一項是刻意接受的 V1 trade-off，用來維持一般 Access Token 驗證 Stateless。

## 3. Lifecycle

### Register

```text
檢查 Email 是否存在
→ bcrypt hash
→ 建立 account
→ 回傳 accountId
```

### Login

每次成功 Login：

```text
查詢 account auth data
→ bcrypt.compare()
→ 產生 Refresh Token
→ 建立 auth_session
→ 產生 Access Token
→ 更新 last login
```

- 同一設備重複登入時，V1 允許每次建立新 Session。
- 瀏覽器 Cookie 會被新 Refresh Token 覆蓋，舊 Session 可存續到 revoked、expired 或 cleanup。
- 帳號不存在與密碼錯誤使用相同的 invalid credentials error，避免洩漏 Email 是否存在。

### Refresh

```text
Refresh Cookie
→ hash token
→ 查 Refresh Session
→ 驗證 revoked / expired
→ 更新 last_used_at
→ 產生新 Access Token
```

V1 不更換 Refresh Token、不建立新 Session、不延長 `expires_at`。

### Logout

```text
Refresh Cookie（若有）
→ revoke 對應 Session
→ clear Cookie
→ idempotent success
```

- Logout 不依賴 Access Token。
- 只撤銷目前 Refresh Session，不影響其他有效 Session。
- 沒有 Refresh Cookie 時仍成功清除 Cookie。

## 4. Access Token 與 authenticateRequest

Access Token：

- 使用 repository 目前設定的 JWT library 與 algorithm。
- 驗證 signature、expiration 與 payload。
- Payload 主要包含 `accountId`。
- 不承擔 Refresh Token 或 Session 管理，不查 `auth_sessions`。

`authenticateRequest`：

- 取得 Authorization Header 並驗證 Bearer Token 格式。
- 驗證 Access Token；失敗或過期轉為穩定的 invalid access token error。
- 成功後只把 `accountId` 放入 `res.locals.auth`。
- 不處理 Refresh Token、Refresh Session 或 Access Token `jti` lookup。

Login、Refresh 與 Logout 不使用 `authenticateRequest`。

## 5. Refresh Session Semantics

`auth_sessions` 代表 Refresh Session，不是 Access Token jti Session。

至少需要表達：

- account ownership。
- Refresh Token hash。
- created、last used、expires、revoked timestamps。

有效 Session 的語義：

```sql
revoked_at IS NULL
AND expires_at > NOW()
```

精確 table、column、index 與 foreign key 由 `Database/migrations/` 表達，不在本文件維護第二份 Schema。

## 6. Frontend Concurrent Refresh（提案／待實作）

Frontend 目前尚未實作 Auth API client 與 concurrent refresh。提案是在多個 API 同時因 Access Token 過期收到 401 時，使用 `refreshPromise`、mutex 或其他 single-flight 機制：

- 第一個 Request 發起 refresh。
- 其他 Request 等待同一 Promise。
- Refresh 成功後共同使用新 Access Token retry。

此模式尚未取得實作完成狀態；V2 若加入 Rotation，會成為更重要的 concurrency boundary。

## 7. Design Rationale

已確認選擇：

- Access Token + Refresh Token，而不是每個 API 都查 Session Store。
- Stateful Refresh Session，而不是完全 Stateless Refresh Token。
- 不採 Access Token jti → `auth_sessions` → 每 Request 查 MySQL。
- V1 不做 Refresh Token Rotation，以避免尚未需要的 Token Family、Reuse Detection、atomic refresh 與 concurrent rotation 複雜度。

V1 trade-off 是同一 Refresh Token 在 revoke／expiry 前可重複使用，被竊時風險較高；後續安全強化必須以 V2 設計變更處理，不得假設 V1 已具有 rotation protection。
