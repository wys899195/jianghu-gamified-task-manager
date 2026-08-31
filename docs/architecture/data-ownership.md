# Data Ownership 與資料庫拆分設計

## 1. Current Strategy

目前採用：

```text
Modular Monolith
+ Single MySQL
+ 明確 Data Ownership
```

單一 MySQL 是刻意的架構選擇，不是暫時錯誤架構。

## 2. Domain Boundary

目前不禁止跨表 JOIN，但避免跨 domain JOIN 成為核心依賴。

優先做到：

- Repository 跟著 domain module。
- 不建立全域巨大 Repository layer。
- Module 不直接修改其他 domain 的 tables。
- 跨 domain foreign key / JOIN 審慎使用。
- 保留可能的 service boundary。
- 先建立 data ownership，再決定是否需要 physical database separation。

同一 bounded context 內的 JOIN 可以合理存在。

真正需要審慎處理的是不同 domain 間的 JOIN。

## 3. Data Ownership != Physical Separation

必須區分：

```text
Data Ownership
≠
一定要物理分離 Database
```

- Data Ownership 是必要的。
- 物理 Database 拆分是可選的。

database-per-service 不是微服務化後必須立即採用的目標。

## 4. Database-per-Service Trade-offs

跨 Database JOIN 被拆開後，可能改用：

- API composition。
- event-driven projection。
- read model。

同時會引入：

- 服務間通訊與 latency。
- eventual consistency。
- distributed transaction。
- migration / backup / deployment 複雜度。

只有出現獨立 schema、部署、負載、權限或故障隔離需求時，database-per-service 才更有價值。

## 5. Migration Path

建議：

```text
階段 1
Modular Monolith
+ Single MySQL
+ Data Ownership

↓

階段 2
Multiple Services
+ 可暫時共用 MySQL instance
+ 每個 service 只管理自己的 tables / schema

↓

階段 3
有明確獨立需求時
→ database-per-service

↓

階段 4
真的有必要時
→ 不同 MySQL instance
```

不要一開始建立 `mysql-users`、`mysql-tasks`、`mysql-martial-arts` 等多個 MySQL containers 模擬尚未存在的 service boundary。

## 6. Open Questions

- 真正的微服務 domain boundary。
- 哪些 module 最終會拆成 service。
- 何時開始 database-per-service。
