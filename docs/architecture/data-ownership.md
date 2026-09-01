# Data Ownership 與資料庫拆分

本文件擁有 Domain table ownership、跨 Domain 存取與 physical database separation 的判斷條件，不負責 runtime deployment。

## 1. 現行策略

```text
Modular Monolith
+ Single MySQL
+ 明確 Data Ownership
```

單一 MySQL 是刻意選擇，不是必須盡快修正的過渡錯誤。

## 2. Domain Boundary

已確認原則：

- Repository 跟著擁有資料的 Domain module。
- Module 不直接修改其他 Domain 擁有的 tables。
- 不建立沒有明確 owner 的全域巨大 Repository layer。
- 同一 bounded context 內的 JOIN 可以合理存在。
- 跨 Domain foreign key／JOIN 必須審慎，避免成為無法拆解的核心依賴。
- 先定義 data ownership，再決定是否需要 physical separation。

目前不全面禁止跨表 JOIN；需要審查的是跨 Domain 的 ownership 與 coupling，而不是 JOIN 語法本身。

## 3. Ownership 不等於 Physical Separation

```text
Data Ownership
≠
每個 Domain 立即擁有獨立 Database
```

- Data Ownership 是必要的。
- 物理 Database 拆分是可選的。
- database-per-service 不是微服務化後必須立刻完成的目標。

## 4. Physical Split 的採用條件

只有出現以下一項或多項真實需求時，database-per-service 才更有價值：

- 獨立 schema lifecycle。
- 獨立部署與擴縮。
- 權限或法規隔離。
- 負載或故障隔離。
- 不同資料技術確實解決 Domain 問題。

拆開跨 Database JOIN 後可能需要 API composition、event-driven projection 或 read model，並引入 latency、eventual consistency、distributed transaction、migration、backup 與 deployment 成本。

## 5. Data Evolution Path

```text
階段 1
Modular Monolith + Single MySQL + Data Ownership

階段 2
若拆 service，可暫時共用 MySQL instance
但每個 service 只管理自己的 tables / schema

階段 3
有明確隔離需求時採 database-per-service

階段 4
真的需要 instance-level isolation 時才拆 MySQL instance
```

不建立 `mysql-users`、`mysql-tasks`、`mysql-martial-arts` 等 containers 模擬尚未存在的 service boundary。

## 6. 未定問題

- 各業務 module 最終 table ownership。
- 哪些 module 可能形成正式 service boundary。
- 何種量化訊號代表 physical split 的收益已超過成本。
