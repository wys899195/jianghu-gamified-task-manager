# 收藏、圖鑑與終局設計

本文件擁有 Collection／Codex 的瀏覽語義與長期 endgame，不擁有 Task Activity、武學進度或 acquisition provenance 的 canonical data。除「提案」「未定」與「延期」內容外，其餘規則為已確認。

## 1. 武學圖鑑

武學圖鑑是核心長期收藏層，但開發優先度低於 Task 核心流程。

低稀有度武學不應因為稀有度低而失去收藏價值。

固定 lore 只需要提供短篇 atmospheric context；真正可長期累積的新鮮感來自使用者自己的：

- 取得時間。
- 修煉歷史。
- 對應的現實 Task。
- 突破／大成時間。
- acquisition provenance。

## 2. Collection 與 Inventory Boundary

若未來出現一般物品，以下責任必須分離：

| 概念 | 責任 |
|---|---|
| Item Catalog | 定義物品是什麼 |
| Reward | 定義為什麼、何時、發放多少 |
| Inventory | 記錄目前持有哪些 |
| Collection | 記錄是否曾取得／解鎖 |
| Codex | 瀏覽與展示收藏資料 |

核心規則：

- `Inventory quantity = 0` 不代表 Collection 未解鎖。
- 曾取得過的內容即使已消耗或售出，仍可永久保留收藏紀錄。
- 武學靜態定義、使用者武學進度與圖鑑 UI 也應保持責任分離。

V1 沒有真正的持有／消耗／交易需求，因此不提前建立通用 Item / Inventory Domain。

## 3. 奇珍收藏（延期）

奇珍可以作為未來第二收藏軸，但不需要因此建立：

- 售賣。
- 銀幣。
- 市集。
- 價格系統。
- 一般 Inventory。

若未來加入奇珍圖鑑，可採「曾取得即永久解鎖」。

## 4. 武學秘籍 Boundary

若未來出現真正可持有／可消耗的秘籍：

```text
秘籍 = Item
武學 = Martial Art Domain
```

目前 V1 不採「閱讀秘籍才解鎖武學」流程。

目前偏好：

```text
取得傳承／殘章
→ 直接更新武學進度
```

只有當背包、市集、贈送、交易、可消耗秘籍等需求真的出現時，再考慮把秘籍建成 Item。

## 5. 個人修行史

個人修行史是組合既有資料的 read model：

- Task Activity facts 由 [`task-system.md`](task-system.md) 擁有。
- 武學修煉、突破與大成狀態由 [`martial-progression.md`](martial-progression.md) 擁有。
- 武學取得來源由 [`martial-acquisition-and-exploration.md`](martial-acquisition-and-exploration.md) 擁有。

Collection／Codex 可以組合並展示：

- 初習日期。
- 修煉次數。
- 常伴隨的真實活動。
- 突破與大成時間。
- task completion → cultivation allocation provenance。

本文件不建立另一套可獨立寫入的 History。主修自動分配可以記錄來源；手動修為池分配是否需要追溯到特定 Task Activity 尚未定案。

## 6. 圖鑑 UI 方向（提案）

桌面／平板橫屏可使用 Master–Detail：

- 左側圖鑑列表。
- 右側固定顯示目前武學詳細資訊。

手機不保留固定右欄，點擊後使用詳細頁、視窗或底部抽屜。

未取得武學曾傾向使用灰色問號秘笈表達，不使用「+」符號。

此 UI 方向應等武學資料模型與實際畫面需求穩定後再落地。

## 7. 自創武學 Endgame（延期）

自創武學是長期 endgame，不屬於 V1。

候選解鎖語義：

```text
傳世武學主要收藏完成
→ 開啟自創武學
```

自創武學應：

- 與傳世武學稀有度軸分離。
- 不作為新的最高 power tier。
- 允許自訂名稱、門類、描述、視覺／風格。
- 由系統控制進度需求、修煉成本與其他會影響平衡的規則。
- 不因使用者沒有建立自創武學而形成強迫完成感。

## 8. 未定問題

- 初始提供多少入門武學。
- 初始武學類別。
- 是否直接持有完整傳承。
- 手動修為池分配的 provenance 粒度。
- 奇珍圖鑑是否需要進入後續版本。
- 自創武學的實際解鎖條件與流程。
