# Project Structure 規範

## Repository 結構

```text
repo/
├── Backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   ├── infrastructure/
│   │   ├── modules/
│   │   ├── shared/
│   │   └── server.ts
│   ├── test/unit/
│   └── package.json
├── Frontend/             # React + Vite Frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── Database/
│   ├── init/
│   └── migrations/
├── API-Tests/
├── docs/
├── sh/
└── docker-compose.yaml
```

實際存在的檔案與可執行入口以 repository 為準；本文件定義新增內容應遵循的責任位置，不逐一列出所有檔案。

## Backend Module 結構

Backend 採垂直拆分模組、模組內水平分層：

```text
Request
→ Route
→ Middleware
→ Controller
→ Service
→ Repository
→ Database
```

典型 module：

```text
Backend/src/modules/<module_name>/
├── routes/
├── middleware/
├── controllers/
├── services/
└── repositories/
```

- `routes/`：定義 API route 與 middleware wiring。
- `middleware/`：處理 Request 驗證、身份驗證與前置處理。
- `controllers/`：處理 HTTP Request／Response 並呼叫 Service。
- `services/`：實作業務規則與 application flow。
- `repositories/`：負責該 module 擁有資料的 Database 存取。
- `infrastructure/`：Database、Security 等不屬於單一 Domain 的基礎設施。
- `shared/`：經確認需要跨 module 共用的程式碼；不得作為無明確 owner 的預設放置區。

不在全 Backend 只按技術層建立巨大 controllers／services／repositories 目錄。

## 搜尋與新增位置

- Backend 功能先從 `Backend/src/modules/<module_name>/` 依資料流追蹤。
- Frontend 功能先從 `Frontend/src/` 查找。
- Schema 與 migration 先從 `Database/migrations/` 查找。
- API System Test 資產位於 `API-Tests/`。
- 只有既有責任區無法容納新內容時，才新增頂層或共用目錄。
