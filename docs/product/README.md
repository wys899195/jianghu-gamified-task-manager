# Product 文件導覽

`product/` 定義產品價值、Domain 行為與版本範圍，不定義 HTTP、Database 或程式分層細節。

## 閱讀順序

1. [`product-principles.md`](product-principles.md)：產品定位、最高層原則與 V1 Scope Guardrails。
2. [`task-system.md`](task-system.md)：現實任務、進度、歷史、Reflection 與 Reward 計算。
3. [`martial-progression.md`](martial-progression.md)：武學傳承、修為、境界與主修分配。
4. [`martial-acquisition-and-exploration.md`](martial-acquisition-and-exploration.md)：機緣、尋訪、取得來源與探索。
5. [`collection-and-endgame.md`](collection-and-endgame.md)：圖鑑 read model、Collection 邊界與長期 endgame。

## Domain 依賴方向

```text
Product Principles
→ Task result / Reward
→ Martial Progression
→ Collection read model

Martial Acquisition
→ 更新傳承取得狀態
→ Martial Progression
```

- Task 不為遊戲資源而存在；武學系統不得反向要求建立特定 Task。
- Task Activity 是現實行動事實的來源。
- Martial Progression 擁有武學進度；Martial Acquisition 擁有取得流程與 provenance。
- Collection 組合既有資料供瀏覽，不建立另一套 canonical history。

## 文件狀態

各文件以「已確認／提案／未定／延期」標示內容。Open Questions 不是實作規格，只有在取得確認後才可移入已確認規則。
