# Coding Style 規範

## TypeScript 命名

本專案主要參考 Microsoft TypeScript Coding Guidelines，React 前端另依 React 官方與主流專案慣例補充 Component 與 Hook 命名規則。

| 對象 | 規則 | 範例 |
|---|---|---|
| class / interface / type / enum | PascalCase | `UserService`、`UserProfile` |
| enum member | PascalCase | `Active`、`Disabled` |
| function / method | camelCase | `createUser`、`findByEmail` |
| property / variable / parameter | camelCase | `accessToken`、`userId` |
| 一般 `.ts` 檔名 | camelCase | `authService.ts`、`passwordValidator.ts` |
| 單字檔名 | lowercase | `app.ts`、`main.ts`、`index.ts` |
| React Component | PascalCase | `UserProfile` |
| React Component 檔名 | PascalCase | `UserProfile.tsx` |
| Custom Hook | `use` 開頭的 camelCase | `useAuth`、`useTaskList` |
| Custom Hook 檔名 | camelCase | `useAuth.ts`、`useTaskList.ts` |

共用規則：

- Interface 名稱與其檔名皆不使用 `I` 前綴，例如 `UserRepository`／`userRepository.ts`。
- Type 名稱與其檔名皆不使用 `T` 前綴，例如 `UserProfile`／`userProfile.ts`。
- Private property 不使用 `_` 前綴。
- 優先使用完整且具語意的名稱；`id`、`url`、`api` 等通用縮寫除外。
- 一個檔案原則上負責一個邏輯 component 或 module。
- 共用型別可集中於 `types.ts`、`authTypes.ts` 等檔案。
- 自動產生的檔案不得手動修改。

### Frontend／React

- React Component 與其檔名使用 PascalCase，例如 `UserProfile`／`UserProfile.tsx`。
- Custom Hook 必須以 `use` 開頭，名稱與檔名使用 camelCase，例如 `useAuth`／`useAuth.ts`。
- 非 Component 的 `.ts`／`.tsx` 檔案沿用一般 camelCase 規則，例如 `authContext.tsx`、`formatDate.ts`、`apiClient.ts`。
- 不因副檔名為 `.tsx` 就一律使用 PascalCase；僅 Component 檔案使用 PascalCase。

### Backend／Express

- Backend `.ts` 檔案沿用一般 camelCase 規則，例如 `authController.ts`、`authService.ts`、`userRepository.ts`。
- Controller、Service、Repository 等 class 名稱使用 PascalCase，例如 `AuthController`、`AuthService`、`UserRepository`。

### 特殊檔名與用途後綴

- 框架、工具或特定用途已有固定檔名慣例時，優先沿用官方名稱，例如 `vite.config.ts`、`eslint.config.ts`、`vitest.config.ts`、`vite-env.d.ts`。
- `.test`、`.spec`、`.stories`、`.generated`、`.d` 等用途後綴可保留，其主檔名仍遵循上述 casing 規則。
- 測試檔沿用被測試檔案的主名稱，例如 `authService.test.ts`、`UserProfile.test.tsx`。
- Storybook Component 檔案沿用 Component 名稱，例如 `UserProfile.stories.tsx`。
- Generated file 可使用例如 `apiClient.generated.ts`。
- TypeScript declaration file 保留 `.d.ts` 格式，例如 `global.d.ts`、`express.d.ts`。

本次只更新規範，不批次重新命名目前已存在的 TypeScript／TSX 檔案。既有檔名與本規範的差異應由獨立工作處理，並同步更新 import、測試、設定與相關文件；新增檔案應直接遵循本規範。

## 其他檔案命名

- `docs/` 下的 Markdown 詳細文件使用 kebab-case；category 入口使用固定名稱 `README.md`。
- Shell script 與目前已採 snake_case 的資產沿用 snake_case；工具或框架要求的固定檔名不改名。
- 其他檔案類型沒有全域單一命名法時，先沿用相同目錄與責任的既有慣例。

## TypeScript 型別

- 不使用 `any`；不確定輸入使用 `unknown`，並在縮小型別後操作。
- 優先由 Schema 或既有物件推導型別，避免手寫平行型別造成漂移。
- 不忽略既有型別檢查；修改後執行對應 package 已定義的 typecheck／check 命令。

## 共通規則

- 不硬編碼密碼、Token、API key 或其他敏感資訊。
- 不把未確認需求或推測寫成實作規格。
- 不在目前工作外重構無關程式碼。
- 不用註解掩蓋不清楚的命名或責任；TypeScript 註解規則見 [`comments/typescript.md`](comments/typescript.md)。
