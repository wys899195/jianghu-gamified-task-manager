# Task 系統設計

## 1. Responsibility

Task 系統負責現實行動的規劃、執行、進度、歷史與 Reflection。

遊戲層可以讀取 Task 結果產生 Reward，但 Task 不應為遊戲資源而存在。

## 2. Task 類型

V1 使用三種 metric type：

| 類型 | 適合情境 | 例子 |
|---|---|---|
| general / boolean | 無法自然量化或只需要完成與否 | 完成 Login API、整理履歷 |
| count | 有明確次數／數量 | 本週 LeetCode 5 題 |
| duration | 有明確投入時間 | 散步 30 分鐘 |

自由文字與結構資料分離：

- 任務名稱是人類語義。
- metric type、target 與 recurrence 是系統語義。
- 不使用 NLP 從標題推測 metric type。
- 標題含「30 分鐘」不代表系統必須使用 duration。
- 結構資料本身仍必須合法。

## 3. Recurrence

週期任務統一使用：

```text
週期內累積
→ 週期結算
→ 建立下一個 cycle
```

概念模型：

```text
metricType
+ recurrencePeriod
+ targetValue
```

例：

- 每日散步 30 分鐘：daily cycle 內累積至 30。
- 每週 LeetCode 5 題：weekly cycle 內累積至 5。
- 一次性任務：`recurrence = none`。
- Habit 不建立獨立 metric type，可表達為無限期 recurring task。

### Open Questions

- Custom recurrence 是否支援每 N 天。
- 是否支援每週特定日。
- 是否支援每月特殊日期規則。

基礎 daily / weekly / monthly / none 優先。

## 4. 建立與編輯 UX

快速建立與詳細設定分離。

快速建立應盡量只要求任務名稱，其他欄位使用合理預設；需要時再展開：

- metric type。
- target。
- recurrence。
- difficulty。
- importance。

### Difficulty

採五級：

| 數值 | 文字 |
|---:|---|
| 1 | 輕鬆 |
| 2 | 偏易 |
| 3 | 普通 |
| 4 | 困難 |
| 5 | 極難 |

### Importance

Importance 與 difficulty 是不同 dimension。

使用三級即可：

- 一般。
- 重要。
- 關鍵。

### Estimated Time

可作為 Planning、回顧與統計資訊，但不直接參與 Reward 公式，避免鼓勵高估工時。

## 5. Today List 與今日主線

首頁核心是「今天要做什麼」。

Today List 顯示今天應處理的任務；另外允許一天設定 0～1 個今日主線。

今日主線：

- 是今天的優先決定，不等同 Task 的 importance。
- 不強制每日設定。
- 昨日未完成主線不自動保留主線身份。
- 主要靠首頁層級、排序、開始按鈕與完成呈現建立存在感。
- 不使用巨大 Reward bonus，避免最佳化 exploit。

首頁資訊優先順序：

```text
今日主線（若有）
→ 今日任務
→ 快速開始／記錄進度
→ 輕量武學進展
```

### Open Questions

- 到期任務是否自動進 Today。
- recurring task 如何自動展開。
- 未完成任務是否 rollover。
- Today List 的最終自動產生規則。

## 6. 每日狀態

已確立需要讓系統適應每日精力波動，但規則與資料模型尚未完成。

候選狀態：

- 正常日：按一般計畫前進。
- 低精力日：降低最低要求，優先保留核心任務。
- 異常日：重大行程或突發事件時允許延後、暫停或重新安排。

每日狀態應調整「今日要求／最低完成標準」，不應直接提高單一任務 Reward。

### Open Questions

- 如何選擇／切換狀態。
- 是否每天手動設定。
- 是否影響完成率或連續紀錄。
- recurring task 如何處理。
- Schema 應使用獨立 entity 或欄位。

## 7. Progress 與 TaskCycle

### 7.1 General Task

主要操作「完成」預設為 100%。

需要時提供次要操作「記錄部分進度」，而不是每次完成都要求選擇 25 / 50 / 75 / 100。

### 7.2 Count / Duration Task

由實際數值直接計算 completion ratio，不要求人工選比例。

每次只對「本次新增進度」計算 Reward，避免重複發放。

### 7.3 Task → TaskCycle → TaskActivityRecord

目前採三層概念：

- `Task`：目前規則，例如名稱、metric type、target、recurrence、difficulty、importance。
- `TaskCycle`：一個具體執行週期。
- `TaskActivityRecord`：每次真實操作，例如 +2 題、+20 分鐘或完成。

週期結束後保留歷史，下一週期從新的 cycle 開始。

`CompletionRecord` 名稱過窄；目前較適合 `TaskActivityRecord` 或 `TaskProgressRecord`，最終命名仍待 Schema 階段確認。

## 8. Activity History

History 使用統一 Activity Timeline，不依 general / count / duration 分成三套歷史。

歷史 Activity 是已發生的事實，後續編輯 Task 不應重寫過去。

因此歷史資料必須保存足以還原當時語義的必要 snapshot，例如：

- 當時 Task 名稱。
- 必要目標資訊。
- difficulty / importance。
- Reward 計算結果。
- 發生時間。

實際 snapshot 欄位仍待 Schema 設計確認。

## 9. Execution Aid

Subtask 只作為降低啟動阻力的 execution aid。

可用 checklist 表達：

- 打開專案。
- 跑現有測試。
- 找第一個失敗案例。
- 先做 5 分鐘。

V1 建議只做一層 checklist，不做無限巢狀。

Subtask 不獨立產生 Reward。

## 10. Reflection

不建立獨立「失敗原因」機制。

完成與未完成都可以填中性 Reflection，例如：

- 今天感覺如何。
- 哪裡卡住。
- 下次如何調整。
- optional tags。

任務未完成不扣修為、不掉級，也不使用強烈清零懲罰。

Streak 暫不加入 V1。

## 11. Reward 計算邊界

目前 Reward 方向：

```text
rawReward = difficultyBase + importanceBonus
finalReward = rawReward × completionRatio
```

原則：

- difficulty 是 base。
- importance 是 bonus。
- completion ratio 是 multiplier。
- 不使用 difficulty × importance 的全乘法。
- AI 不作為核心 Reward 的唯一決策者。
- 核心 Reward 必須 deterministic、可測試、可重現。

一般 +0／重要 +1／關鍵 +2 等數字只是平衡示例，不是最終定案。

### Open Questions

- difficulty base 的精確數值。
- importance bonus 的精確數值。
- rounding。
- Undo / rollback 對已發 Reward、TaskCycle 與武學突破的 transaction semantics。
- 是否保留「基礎屬性」；目前傾向若保留則作為行為分布統計，而不是對真實能力的評價。
- `TaskCycle` / `TaskActivityRecord` 最終 Schema。
- Activity History / provenance 最低必要欄位。
