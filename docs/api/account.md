# Account API Contract

本文件擁有 Account lifecycle 的 HTTP route、Request／Response、身份驗證與對外錯誤行為。Access Token 驗證方式見 [`../architecture/authentication.md`](../architecture/authentication.md)。

## Routes

| Method | Path | Authentication | Success |
|---|---|---|---|
| DELETE | `/account` | Access Token | `204 No Content`，並清除 Refresh Cookie |

## Delete Account

永久刪除目前登入者的帳號。

Request body：

| 欄位 | 已確認契約 |
|---|---|
| `password` | required、non-empty string，必須是目前密碼 |

執行流程：

```text
authenticateRequest
→ 取得 accountId
→ 驗證目前密碼
→ hard delete accounts row
→ Database foreign key cascade 刪除該帳號所有 auth_sessions
→ 清除 refreshToken Cookie
→ 204 No Content
```

錯誤語義：

- 缺少或無效 Access Token：Authentication Error。
- Request body 格式錯誤：`400 Request Validation Error`。
- 目前密碼錯誤：`401`。
- 帳號不存在：`404`。

成功 response 不包含 body。

Refresh Cookie 使用 Authentication API 已確認的名稱與安全屬性；Cookie contract 見 [`authentication.md`](authentication.md#refresh-token-cookie)。精確公開錯誤 message 由 Backend 的 User module response map 擁有。
