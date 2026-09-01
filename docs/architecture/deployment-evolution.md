# 部署與 Service 演進

本文件只定義未來 runtime、deployment 與 service 邊界的演進順序。Database ownership 與 physical database separation 由 [`data-ownership.md`](data-ownership.md) 負責。

## 1. 已確認策略

```text
Host 上的 Modular Monolith
→ Backend / Frontend images
→ Docker Compose 整合
→ 視需求導入 Kubernetes
→ 只有在邊界與維運需求成立時拆 service
```

- 目前不直接拆微服務。
- 容器化、Database 拆分與 Kubernetes 不在同一階段同時進行。
- 是否拆 service 由實際 ownership、部署、負載或故障隔離需求決定，不把演進圖當成必然時程。

## 2. Docker Compose 階段

Compose 用來驗證：

- network 與 service name resolution。
- environment injection。
- persistent storage。
- image runtime。
- healthcheck 與 service startup dependency。
- Backend、Frontend、MySQL 的完整整合。

精確 service、port、volume、environment 與 healthcheck 由 `docker-compose.yaml` 表達，本文件不建立第二份設定。

## 3. Kubernetes 採用條件

只有在 deployment、scaling、recovery 或 environment 管理複雜度足以支持其成本時才導入 Kubernetes。屆時再依實際需求設計：

- `Deployment`／`Service`。
- `ConfigMap`／`Secret`。
- `Ingress`。
- readiness／liveness probe。
- stateful workload 或 managed database 的連線方式。

上述資源是候選能力，不代表 manifests 已存在。

## 4. Repository Strategy

目前維持 monorepo。未來即使出現多個 service，也優先在同一 repository 管理，除非出現：

- 不同團隊 ownership。
- 權限隔離需求。
- 完全不同的 release cycle。
- monorepo 已造成明確維運問題。

`apps/`、`services/`、`packages/` 等未來 tree 只可在正式 service boundary 確認後設計；不在本文件預先固定 `user-service`、`task-service` 等名稱。

## 5. 建議執行順序

```text
1. 穩定 MySQL Compose、volume 與 migration
2. 確認 Domain table ownership
3. 減少跨 module Repository / SQL coupling
4. 容器化 Backend / Frontend
5. 用 Compose 驗證完整整合
6. 評估 Kubernetes 是否解決真實問題
7. 最後依明確需求拆 service
```

## 6. 延期／未定

目前尚未完成或尚未決定：

- Backend／Frontend images。
- Kubernetes manifests。
- 正式 service boundary。
- Production topology。
- Kubernetes 上 Database 採 self-hosted 或 managed service。
