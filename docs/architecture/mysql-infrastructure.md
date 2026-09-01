# MySQL 基礎設施與 Migration

本文件擁有 MySQL runtime 邊界、connection pool、migration lifecycle 與資料保存原則。Domain table ownership 見 [`data-ownership.md`](data-ownership.md)。

## 1. 現行 Runtime Boundary

目前 MySQL 由 Docker Compose 管理；Frontend 與 Express 仍在 host 執行。精確 service、image、port、environment、volume 與 healthcheck 由 repository 的 `docker-compose.yaml` 表達，本文件不複製設定值。

連線位置依 runtime 改變：

```text
Host runtime → loopback address
Compose      → MySQL service name
Kubernetes   → Service DNS
```

實際 `DB_HOST`、`DB_PORT` 與 credentials 由環境設定提供，不硬編碼在程式或文件。

## 2. MySQL 容器化原則

- 使用官方 MySQL image。
- 不為沒有額外需求的 MySQL 建立自訂 `Dockerfile`。
- 不以 host package installation 作為主要專案方案。
- Named volume 提供 persistence，但不等同備份。
- 不在沒有明確 service boundary 時建立多個 MySQL containers 模擬 database-per-service。

## 3. `Database/` 責任

`Database/` 保存可進版控的資料庫定義，不是 MySQL 實際 data directory：

```text
Database/
├── init/
└── migrations/
```

- `init/`：僅在初始化流程需要時保存可重建內容。
- `migrations/`：Schema 的可追蹤 source of truth。
- Seed data 只有在用途、環境與可重建方式明確時才加入。

## 4. Migration Lifecycle

已確認規則：

- Migration 使用有序檔名，例如 `001_xxx.sql`。
- 已執行的 migration 不修改。
- Schema 變更新增下一個 migration。
- 未確認需求不得先寫成 Schema。
- Migration 不包含密碼、Token 或其他敏感資訊。
- 部署或測試建立 Database 後，依序執行尚未套用的 migrations。

精確 table、column、index、foreign key 與 constraint 只由 `Database/migrations/` 表達；架構文件只描述語義與 ownership，不維護完整平行 Schema。

## 5. Connection Pool

Backend 使用整個 Express process 共用的 connection pool：

```text
databaseConfig
→ MysqlConnector
→ shared connection pool
→ Repository / infrastructure
```

不得：

- 每個 Request 建立 connection。
- 每個 Repository 重建 pool。
- 由 Controller 管理 MySQL connection lifecycle。

容器化只改變連線環境設定，不應因此重寫 Repository 或 connection layer。

## 6. Persistence、Backup 與 Transfer

跨環境／跨主機資料遷移優先使用：

```text
mysqldump
→ SQL dump
→ import
```

Adminer／phpMyAdmin 可作人工輔助，但不是主要自動化備份策略。不要把 Docker volume 內的 MySQL binary files 當作主要跨環境遷移方式。

刪除 named volume 會造成資料遺失；執行 `docker compose down -v` 前必須取得明確授權。

## 7. 未定問題

- 最終 migration tool 是否需要取代目前 runner。
- `Database/init/` 是否保留長期用途。
- Production 使用 self-hosted 或 managed MySQL。
