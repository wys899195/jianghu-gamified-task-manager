# 系統架構

## 1. 現行技術棧

```text
Frontend
- React
- TypeScript
- Vite

Backend
- Node.js
- TypeScript
- Express

Database
- MySQL

Package Manager
- npm
```

NestJS、Spring Boot、Maven、Prisma 等舊討論方案不是目前開發方案。

## 2. Repository 型態

目前為單一 Git Repository 的前後端分離專案。

主要結構以 `AGENTS.md` 與實際 repository 為準。

## 3. Backend 架構

Backend 採：

> **垂直拆分模組 + 模組內水平分層。**

資料流：

```text
Request
→ Route
→ Middleware
→ Controller
→ Service
→ Repository
→ Database
```

典型模組：

```text
Backend/src/modules/<module_name>/
├── routes/
├── middleware/
├── controllers/
├── services/
└── repositories/
```

避免在全專案只依技術層建立大型 controllers / services / repositories 目錄。

## 4. 各層責任

- Schema：定義 Request 格式是否合法。
- Middleware：Request 驗證與前置處理。
- Controller：處理 HTTP Request / Response 並呼叫 Service。
- Service：業務規則與 application flow。
- Repository：Database 存取。
- Database：資料完整性的最後防線。

錯誤處理目前使用：

- `ServiceError`。
- `ErrorHttpStatusMap`。
- `ApiErrorHandler`。
- Controller `catch` 後交由 `next(error)`。
- Error Handler 位於所有 API Route 後方。

## 5. Schema Migration

Database schema 由 `Database/migrations/` 的有序 SQL migrations 管理。

規則：

- 已執行 migration 不修改。
- Schema 變更新增 migration。
- 不硬編碼敏感資訊。
- 不把未確認需求直接寫成 schema 規格。

## 6. Modular Monolith

現階段優先維持 Modular Monolith。

核心原則：

- 先建立清楚的業務模組邊界。
- 模組內維持既定分層。
- 跨模組依賴必須有明確責任。
- 模組邊界是候選 service boundary，不代表未來一定拆成 service。
- 不因未來可能微服務化而提前引入分散式系統成本。

目前不為未來微服務化提前建立：

- 每個模組獨立部署。
- Kafka / RabbitMQ。
- API Gateway。
- Service Discovery。
- 分散式 Transaction。
- 每個 domain 一個 service。

Database ownership 與未來拆分策略由 `data-ownership.md` 管理；部署演進由 `deployment-evolution.md` 管理。

## 7. AI Integration Direction

若加入外部 AI API：

- 由 Backend 串接。
- Frontend 不直接持有 API Key。
- Backend 負責 timeout、retry、rate limit、provider abstraction、logging 與 error handling。

AI 適合：

- 任務文字輔助。
- 回顧與摘要。
- 文案生成。
- 非關鍵建議。

AI 不應直接決定：

- 核心交易狀態。
- 關鍵資料一致性。
- 不可逆業務資料。
- 需要 deterministic 的核心計算。

## 8. Logging Direction

初期優先建立可搜尋、可分析的結構化 Log。

常見欄位：

- timestamp。
- level。
- module。
- request / trace identifier。
- 適當去識別的 user identifier。
- event type。
- duration。
- error code。

可依需求區分：

- System Log。
- Request Log。
- Business Log。
- AI Log。
- Audit Log。

Elasticsearch 屬後期集中式 Log 搜尋與分析工具，不取代 MySQL 業務資料庫。
