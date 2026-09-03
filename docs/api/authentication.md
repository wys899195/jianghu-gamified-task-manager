# Authentication API Contract

本文件擁有 Authentication 的 HTTP route、Request／Response、Cookie 與對外錯誤行為。Token 與 Refresh Session 的安全模型見 [`../architecture/authentication.md`](../architecture/authentication.md)。

## Routes

| Method | Path | Authentication | Success |
|---|---|---|---|
| POST | `/auth/register` | 不需要 | `201` + `{ accountId }` |
| POST | `/auth/login` | 不需要 | `200` + `{ accessToken }`，並設定 Refresh Cookie |
| POST | `/auth/refresh` | Refresh Cookie | `200` + `{ accessToken }` |
| POST | `/auth/logout` | Refresh Cookie 可選 | `204 No Content`，並清除 Refresh Cookie |

Refresh 與 Logout 不使用 Access Token，也不使用 `authenticateRequest`。

## Register

Request body：

| 欄位 | 已確認契約 |
|---|---|
| `email` | required string、trim、符合 Email 格式 |
| `password` | required string、至少 8 字元、至少一個英文字母與一個數字；不 trim |
| `nickname` | optional string、trim、非空、最多 30 字元 |

成功回傳：

```json
{
  "accountId": 1
}
```

Email 已存在是可預期 User error；精確 status 與 public message 由 Backend 的 `userErrorResponseMap` 擁有。

## Login

Request body：

| 欄位 | 已確認契約 |
|---|---|
| `email` | required string、trim、符合 Email 格式 |
| `password` | required string、至少 8 字元、至少一個英文字母與一個數字；不 trim，與 Register 使用相同定義 |

成功回傳：

```json
{
  "accessToken": "<token>"
}
```

帳號不存在與密碼錯誤使用相同的 invalid credentials 語義，避免洩漏 Email 是否存在。精確公開 response 由 Backend error response map 擁有。

## Refresh

- 從 `refreshToken` HttpOnly Cookie 取得 Refresh Token。
- 有效 Refresh Session 回傳新的 Access Token。
- V1 不更換 Refresh Token、不建立新 Session、不延長 Session expiry。
- 缺少、revoked、expired 或無效的 Refresh Token 使用相同的 invalid refresh token 語義。

## Logout

- 使用目前瀏覽器的 Refresh Cookie 撤銷對應 Session。
- 不依賴 Access Token。
- 無 Refresh Cookie 時仍回 `204`，保持 idempotent。
- 只撤銷目前 Session，其他有效 Session 不受影響。
- 無論 Session 是否存在，都清除 `refreshToken` Cookie。

## Refresh Token Cookie

已確認屬性：

```text
name: refreshToken
httpOnly: true
secure: true
sameSite: strict
maxAge: 與 Refresh Session 有效期限一致
```

精確設定由 Backend Controller 與 Auth config 表達；修改 Cookie contract 時需同步檢查前端 credentials／CORS 設定。

## Validation 與 Error Boundary

- Schema／欄位缺失／型別／格式錯誤：400 Request Validation Error。
- 帳號或密碼不正確、Access Token 無效、Refresh Token 無效：Authentication Error。
- 公開 status 與 message 由 Backend module response map 統一維護，流程見 [`../architecture/api-error-handling.md`](../architecture/api-error-handling.md)。
