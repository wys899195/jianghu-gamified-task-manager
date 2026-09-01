# Architecture 文件導覽

`architecture/` 定義系統結構、跨層責任、基礎設施邊界及已接受的技術決策；精確程式名稱、設定值與 Schema 仍由 repository 中的實作檔案表達。

## 閱讀順序

1. [`system-architecture.md`](system-architecture.md)：現行技術棧、Backend 分層與 Modular Monolith 總覽。
2. 依任務選讀：
   - [`authentication.md`](authentication.md)：Token／Refresh Session 安全模型與 lifecycle。
   - [`request-validation.md`](request-validation.md)：Zod 與 Validation Middleware 責任。
   - [`api-error-handling.md`](api-error-handling.md)：可預期錯誤到公開 API response 的責任流。
   - [`mysql-infrastructure.md`](mysql-infrastructure.md)：MySQL、connection pool、migration 與資料保存。
   - [`data-ownership.md`](data-ownership.md)：Domain table ownership 與資料庫拆分條件。
   - [`deployment-evolution.md`](deployment-evolution.md)：容器、Kubernetes 與 service 演進順序。

## 責任邊界

- `system-architecture.md` 只描述現行架構與跨領域 guardrails。
- `deployment-evolution.md` 擁有未來部署與 service 演進。
- `data-ownership.md` 擁有跨 Domain 資料存取與 physical database separation 的條件。
- `mysql-infrastructure.md` 擁有 database lifecycle；實際 schema 由 `Database/migrations/` 表達。
- 對外 Route、Request、Response、Cookie 與 status 屬於 `docs/api/`。
