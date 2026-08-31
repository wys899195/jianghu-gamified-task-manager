# MySQL 基礎設施設計

## 1. 現行狀態

目前：

- Frontend、Express 仍在 Ubuntu host 執行。
- MySQL 使用 Docker / Docker Compose。
- Express 尚未容器化時連線使用：

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
```

未來 Express 進入同一 Compose network 後：

```dotenv
DB_HOST=mysql
DB_PORT=3306
```

`mysql` 是 Compose service name。

與 `compose.yaml` 的 service、image、port、environment、volume、healthcheck、container name 等具體設定有關時，以實際 `compose.yaml` 為準，不以本文件重建 Compose。

## 2. MySQL 容器化原則

- 使用官方 MySQL image。
- 不另外建立自訂 MySQL `Dockerfile`。
- MySQL 主要由 Docker / Docker Compose 管理。
- 不以 host `apt install mysql-server` 作為主要方案。

## 3. `Database/` 目錄

`Database/` 不是 MySQL 實際資料儲存位置。

只保存可進版控的資料庫定義，例如：

```text
Database/
├── init/
└── migrations/
```

可能包含：

- 初始化 SQL。
- schema 定義。
- seed data。
- migration。

## 4. Connection Pool

後端目前方向使用 `mysql.createPool(...)`，建立整個 Express process 共用的 connection pool。

責任：

```text
databaseConfig
→ mysqlConnector
→ shared connection pool
→ repository / infrastructure
```

不要：

- 每個 Request 建立 connection。
- 每個 Repository 重建 pool。
- Controller 管理 MySQL connection lifecycle。

容器化後主要改變連線環境設定，而不是重寫連線層：

```text
Host runtime：127.0.0.1
Compose：mysql
Kubernetes：Service DNS
```

## 5. Persistence、Backup 與 Transfer

named volume 解決資料持久化，不是完整備份。

跨環境／跨主機資料遷移優先使用：

```text
mysqldump
→ SQL dump
→ import
```

Adminer / phpMyAdmin 等 UI 可作人工輔助，但不作主要自動化備份策略。

不使用 Docker volume 內 MySQL binary files 作為主要跨環境遷移方式。

## 6. Open Questions

- 最終 migration tool。
- `Database/init/` 是否保留長期用途。
- Production 使用 self-hosted MySQL 或 managed MySQL。
