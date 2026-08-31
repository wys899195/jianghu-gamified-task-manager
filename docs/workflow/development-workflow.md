# 需求分析與開發工作流

## 1. Design Flow

UI 不應早於核心需求與流程定義。

建議順序：

```text
產品目標
→ User Story
→ Acceptance Criteria
→ Feature / Epic
→ 重要 Use Case
→ 流程圖
→ Domain / Module 邊界
→ Database / API
→ 低保真 UI
→ 實作與測試
```

流程可以迭代回頭修正，不需要僵化為瀑布式流程。

## 2. User Story

User Story 回答：

> 使用者為什麼需要這項能力，以及它提供什麼價值？

格式：

```text
身為 <某類使用者>
我希望 <完成某件事情>
因此 <取得某種價值>
```

User Story 不直接描述：

- API。
- Database。
- Controller。
- Repository。
- Transaction。
- 具體 UI 元件。

## 3. Use Case

Use Case 回答：

> 使用者觸發功能後，系統如何完成它？

典型內容：

- Actor。
- 前置條件。
- 主要流程。
- Alternative Flow。
- Error / Exception Flow。
- 後置條件。

```text
User Story = Why / Value
Use Case   = How / System Behavior
```

## 4. Acceptance Criteria

重要 User Story 應補上可驗收條件，使需求可以直接轉成實作與測試依據。

Acceptance Criteria 描述 observable behavior，不指定不必要的內部實作細節。

## 5. Backlog / Scope

開發期間出現的新點子先進 Backlog，不立即中斷目前 Sprint。

若某個設計仍未確認，不應直接當成實作規格。

## 6. GitHub Issue

個人專案使用 Issue，但保持輕量。

適合：

- 完整 Feature。
- Bug。
- 技術工作。
- 明確待辦。

不需要為每個 typo 或微小修改建立 Issue。

## 7. Branch / PR

小型工作可：

```text
Issue
→ main 開發
→ Commit
→ Close Issue
```

較大 Feature：

```text
Issue
→ Feature Branch
→ 多次 Commit
→ Merge
→ Close Issue
```

需要保留 review / change discussion 時：

```text
Issue
→ Feature Branch
→ Commits
→ PR
→ Merge
→ Close Issue
```

PR 不是 Commit 的前置步驟。

## 8. Commit

Commit 格式與允許 type 以 `AGENTS.md` 為準。

Commit description 應描述實際變更，不混入無關修改。
