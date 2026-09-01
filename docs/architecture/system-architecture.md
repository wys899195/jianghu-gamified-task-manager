# 系統架構

本文件是現行系統架構總覽。Repository 放置與命名規範見 [`../conventions/project-structure.md`](../conventions/project-structure.md)；未來部署演進另見 [`deployment-evolution.md`](deployment-evolution.md)。

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

## 2. Repository 與 Backend 架構

目前是單一 Git Repository 的前後端分離 Modular Monolith。

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

模組目錄與各層檔案放置由 [`Project Structure 規範`](../conventions/project-structure.md) 統一維護，本文件不複製完整 repository tree。

## 3. 各層責任

- Request Schema：定義 transport input 格式是否合法。
- Middleware：執行 Request 驗證、身份驗證與其他前置處理。
- Controller：處理 HTTP Request／Response 並呼叫 Service。
- Service：業務規則與 application flow。
- Repository：該 Domain 擁有資料的 Database 存取。
- Database：透過 schema 與 constraint 提供資料完整性的最後防線。

延伸規範：

- Request Validation：[`request-validation.md`](request-validation.md)。
- API Error Handling：[`api-error-handling.md`](api-error-handling.md)。
- Data Ownership：[`data-ownership.md`](data-ownership.md)。
- MySQL 與 Migration：[`mysql-infrastructure.md`](mysql-infrastructure.md)。

## 4. Modular Monolith Guardrails

已確認原則：

- 先建立清楚的業務模組邊界。
- 模組內維持既定分層。
- 跨模組依賴必須有明確 owner。
- 模組邊界是候選 service boundary，不代表未來一定拆成 service。
- 不因未來可能微服務化而提前引入分散式系統成本。

目前不建立：

- 每個模組獨立部署。
- Kafka／RabbitMQ。
- API Gateway／Service Discovery。
- 分散式 Transaction。
- 每個 Domain 一個 service 或 database。

未來 service 與 database 拆分條件分別由 [`deployment-evolution.md`](deployment-evolution.md) 與 [`data-ownership.md`](data-ownership.md) 管理。

## 5. AI Integration Guardrails

這些是已接受的安全邊界，不代表外部 AI API 已完成：

- 外部 AI API 由 Backend 串接；Frontend 不持有 API key。
- Backend 負責 timeout、retry、rate limit、provider abstraction、logging 與 error handling。
- AI 可協助任務文字、回顧、摘要、文案與非關鍵建議。
- AI 不參與核心交易狀態、不可逆資料、資料一致性或 deterministic Reward 計算。

Provider、資料保留與實際功能仍屬未定，確認前不得從本節推導實作。

## 6. Logging Guardrails

已確認方向是先建立可搜尋、可分析並適當去識別的結構化 Log。依事件可包含 timestamp、level、module、request／trace identifier、user identifier、event type、duration 與 error code。

System、Request、Business、AI、Audit Log 是可依需求區分的類型，不代表目前全部存在。Elasticsearch 只屬後期集中式搜尋提案，不取代 MySQL 業務資料庫。
