# AGENTS.md

## Project Overview

本專案為前後端分離的全端 Web 應用。
- Frontend：React + TypeScript + Vite
- Backend：Node.js + TypeScript + Express
- Database：MySQL
- 套件管理器：npm


## Project Structure

```text
repo/
├── Backend/              # 後端根目錄
│   ├── src/
│   │   ├── config/       # 環境、伺服器、資料庫與驗證設定
│   │   ├── infrastructure/ # 後端基礎設施，包含 Database、Security、logger
│   │   ├── modules/      # 包含後端各功能模組
│   │   │   └── module_name/       # 單一功能模組目錄
│   │   │       ├── routes/        # 定義模組的 API 路由與 HTTP endpoint
│   │   │       ├── middleware/    # 處理模組相關的 Request 驗證與前置處理
│   │   │       ├── controllers/   # 處理 HTTP Request/Response 並呼叫 Service
│   │   │       ├── services/      # 實作模組的業務邏輯與應用流程
│   │   │       └── repositories/  # 負責模組的資料庫存取
│   │   ├── shared/       # 包含跨模組共用代碼
│   │   └── server.ts     # 後端入口點
│   └── package.json      
├── Frontend/             # 前端根目錄
│   ├── public/          
│   └── src/              
├── Database/
│   └── migrations/       # SQL migrations，用於管理資料庫 Schema 變更，命名是有序的，如001_xxx.sql
└── sh/                   # 專案部署、開發、測試腳本
```

Backend 採垂直拆分模組、模組內水平分層：Request → Route → Middleware → Controller → Service → Repository → Database。

## Coding Style

- 新增檔案時，`.ts` 檔案預設使用 PascalCase 命名；主要用於 Type 定義的 `.ts` 檔案則額外加上 `T` 前綴；其他檔案類型使用 snake_case 命名。
- Never 使用 `any` 型別。

## Never 規則
- Never 把未確認的需求或推測當成規格。
- Never 修改已執行的 migration；Schema 變更應建立新的 migration。
- Never 未經確認重構與當前任務無關的程式碼。
- Never 忽略既有的型別、測試或資料一致性檢查。
- Never 硬編碼敏感資訊

## Commit 規範

格式：`type(scope): description`
類型：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `pref`

description 應簡潔描述實際變更，不混入無關修改。
