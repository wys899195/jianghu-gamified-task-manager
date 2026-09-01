# Coding Style 規範

## 檔案命名

- `.ts` 檔案預設使用 PascalCase。
- 主要用於 Type 定義的 `.ts` 檔案加上 `T` 前綴。
- `docs/` 下的 Markdown 詳細文件使用 kebab-case；category 入口使用固定名稱 `README.md`。
- Shell script 與目前已採 snake_case 的資產沿用 snake_case；工具或框架要求的固定檔名不改名。
- 其他檔案類型沒有全域單一命名法時，先沿用相同目錄與責任的既有慣例。
- 新檔案應沿用鄰近相同責任檔案的既有慣例；若既有慣例與本文件衝突，先指出差異，不自行建立第三種規則。

## TypeScript 型別

- 不使用 `any`；不確定輸入使用 `unknown`，並在縮小型別後操作。
- 優先由 Schema 或既有物件推導型別，避免手寫平行型別造成漂移。
- 不忽略既有型別檢查；修改後執行對應 package 已定義的 typecheck／check 命令。

## 共通規則

- 不硬編碼密碼、Token、API key 或其他敏感資訊。
- 不把未確認需求或推測寫成實作規格。
- 不在目前工作外重構無關程式碼。
- 不用註解掩蓋不清楚的命名或責任；TypeScript 註解規則見 [`comments/typescript.md`](comments/typescript.md)。
