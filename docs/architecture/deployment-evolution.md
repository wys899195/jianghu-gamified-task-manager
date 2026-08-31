# 部署與服務演進

## 1. Target Evolution

目前演進方向：

```text
單體
→ 前後端容器化
→ Docker Compose 整合
→ Kubernetes
→ 後端逐步微服務化
→ 視需求 database-per-service
```

目前不直接拆微服務，也不提前建立多個 MySQL instance。

## 2. Docker → Compose → Kubernetes

採用：

```text
Local modular monolith
→ Docker image
→ Docker Compose
→ Kubernetes
```

Compose 階段用來先驗證：

- network。
- environment。
- persistent storage。
- service discovery。
- image runtime。

具體 Compose service、port、volume、healthcheck 等設定以實際 `compose.yaml` 為準。

未來同一批 image 可由：

```text
Local / integration → Docker Compose
Production          → Kubernetes
```

管理。

Kubernetes 階段再引入：

- `Deployment`
- `Service`
- `ConfigMap`
- `Secret`
- `PersistentVolumeClaim`
- `Ingress`
- readiness / liveness probe

不要同時進行：

```text
單體拆微服務
+ Docker 化
+ DB 拆分
+ Kubernetes
```

## 3. Repository Strategy

即使未來拆成多個 service，目前仍適合 monorepo。

未來可能演進成：

```text
repo/
├── apps/
│   └── frontend/
├── services/
│   ├── user-service/
│   ├── task-service/
│   └── martial-service/
├── packages/
└── infrastructure/
```

service names 目前只是示意，不代表正式 service boundary。

只有出現以下實際需求時才考慮 polyrepo：

- 不同團隊 ownership。
- 權限隔離。
- release cycle 完全不同。
- monorepo 已造成維運問題。

## 4. Current Non-Goals

以下不能視為已完成：

- Backend / Frontend 已容器化。
- 已建立 Kubernetes manifests。
- 已拆微服務。
- 已拆多個 database。
- 已決定正式 service boundary。
- 已決定 migration framework。
- 已建立 production DB topology。

## 5. Recommended Order

```text
1. 確認 MySQL Compose / volume 穩定
2. 確認 schema migration source of truth
3. 檢查各 domain table ownership
4. 減少跨 module repository / SQL coupling
5. 容器化 Backend / Frontend
6. 使用 Compose 做完整整合
7. 再設計 Kubernetes
8. 最後依實際需求拆 service 與 database
```

## 6. Open Questions

- Kubernetes 上 Database 是否實際自建。
- 正式 service boundary。
- Production DB topology。
