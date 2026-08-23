# Backend Unit Testing

本文件規範 Backend 的單元測試。以目前可正常執行的 Jest + TypeScript ESM 實作為準：`Backend/test/unit/`、`@jest/globals`、`jest.unstable_mockModule`、dynamic import 與相鄰的 `*MockData.ts` fixture。不得在單一測試工作中自行更換框架、mock 寫法、命名或目錄結構。

## 執行與驗證

- 在 `Backend/` 執行 `npm test`。
- 修改 TypeScript 測試或 fixture 後，執行 `npm run typecheck`。
- 需要完整後端檢查時執行 `npm run check`。
- 測試失敗時，先確認規格、實作與測試期待何者不一致；不要只為了通過測試而改預期結果。

## 案例設計

- 優先測試明確業務規則、身份驗證、授權、Session、狀態轉換、資料隔離與安全相關行為；目前優先是 Service 與 Middleware。
- 每個案例只驗證一個情境與可觀察結果，涵蓋正常結果、已定義錯誤與關鍵邊界，不追求任意層級的全面覆蓋率。
- 寫案例前先確認：目標函式的責任、輸入情境、需控制的外部依賴、預期回傳／錯誤／流程中止結果。
- 未確認需求、未知資料庫錯誤或推測錯誤碼，不可先寫成測試規格。只有函式明確負責轉換、重試或補償的錯誤才寫 unit test。

## Arrange / Act / Assert

每個測試維持 Arrange / Act / Assert 順序與空行分隔：

```ts
/*
    測試目標：確認 Email 不存在時會完成註冊流程。
    預期結果：回傳 accountId，並以 hash 後的密碼建立帳號。
*/
test('creates an account and returns the account id', async () => {

    // Arrange：設定外部依賴的成功回傳值。
    existsByEmailMock.mockResolvedValue(false);
    bcryptHashMock.mockResolvedValue(fakePasswordHash);
    createAccountMock.mockResolvedValue(expectedAccountId);

    // Act：執行真實的目標函式。
    await expect(
        register(validRegisterRequest),
    ).resolves.toBe(expectedAccountId);

    // Assert：驗證必要的結果與安全規則。
    expect(createAccountMock).toHaveBeenCalledWith(
        validRegisterRequest.email,
        fakePasswordHash,
        validRegisterRequest.nickname,
    );
});
```

- Arrange：準備 fixture 與 `mockResolvedValue`、`mockRejectedValue` 等受控依賴行為。
- Act：實際執行目標函式；非同步成功使用 `await expect(...).resolves`，已定義錯誤使用 `await expect(...).rejects`。
- Assert：以對外結果為主。只對安全、流程中止或重要資料傳遞驗證 mock 呼叫；不要為內部呼叫次數或順序建立不必要耦合。

## Mock 與 ESM 實作

- 實際執行被測函式，不 mock `AuthService.register` 等目標函式。
- mock Repository、網路、檔案系統、時間與其他有副作用或成本高的邊界；Service unit test 不連 MySQL。
- 純函式與無外部副作用的資料轉換優先使用真實實作與 fixture，不為隔離增加 mock。
- 不重複測第三方套件本身。例如 Service 測試 bcrypt 的 hash 結果是否被使用；實際密碼驗證交由 API 測試確認。

Backend 為 ESM，依目前模式實作 module mock：

1. 從 `@jest/globals` 匯入 Jest API。
2. 用帶有明確函式型別的 `jest.fn<...>()` 建立 mock。
3. 先以 `jest.unstable_mockModule(...)` 註冊外部 module mock。
4. 再以 `await import(...)` 動態載入真實目標模組。
5. 有共用 mock 時，在每個案例後以 `jest.resetAllMocks()` 清除設定與呼叫狀態。

```ts
// 模擬 Repository 的非同步查詢結果。
const existsByEmailMock =
    jest.fn<(email: string) => Promise<boolean>>();

// 替換 Repository module。
jest.unstable_mockModule(
    '../../../../../src/modules/user/repositories/AccountRepository.js',
    () => ({
        findAuthByEmail: jest.fn(),
        existsByEmail: existsByEmailMock,
        createAccount: createAccountMock,
        updateLastLogin: jest.fn(),
    }),
);

// 在 mock 註冊後載入真實目標函式。
const {
    register,
} = await import(
    '../../../../../src/modules/user/services/AuthService.js'
);
```

- mock module 必須提供目標模組靜態匯入的全部 named exports，即使此案例未使用，否則 ESM 載入會失敗。
- mock 結構必須符合正式 import；例如 `import bcrypt from 'bcrypt'` 對應 `{ default: { hash: bcryptHashMock } }`。
- 不把實際 bcrypt hash 寫死為 fixture；bcrypt 使用隨機 salt，unit test 應以固定 fake hash 驗證 Service 傳遞行為。

## 名稱、註解、fixture 與目錄

- 測試檔命名為 `<目標模組>.test.ts`；可重用 fixture 命名為 `<目標模組>MockData.ts`，放在對應測試檔旁。
- `describe` 使用目標模組或函式名稱；`test` 使用英文且描述可觀察行為，例如 `rejects when the email already exists`。
- 每個 `test(...)` 上方必須使用以下 block comment，測試目標與預期結果不寫在函式內：

```ts
/*
    測試目標：...
    預期結果：...
*/
test('describes observable behavior', async () => {
```

- 對測試中的 `const`、`jest.unstable_mockModule` 與不直觀 mock 設定，使用簡短單行註解說明用途。
- 遵循 strict 型別且不使用 `any`。fixture 的 optional 欄位若會在 Assert 視為必填，使用 `satisfies` 保留精確型別。
- 只在同一測試檔重複使用的 request、預期值或假資料才抽到 `*MockData.ts`；fixture 放資料、不放測試流程。
- 保持案例獨立，不依賴執行順序；每個案例自行設定所需 mock。
- `Backend/test/unit/` 依 `Backend/src/` 的責任區域安排目錄，例如 `src/modules/user/services/AuthService.ts` 對應 `test/unit/modules/user/services/AuthService.test.ts`。

## Express 與 API 測試分工

- Service：測業務結果、已定義錯誤、權限與狀態規則，mock Repository 與外部服務。
- Middleware：以最小 `req`、`res`、`next` 測缺少／無效／有效輸入、錯誤分類與 `res.locals`。
- 薄型 Controller 與 Route：優先由 API 測試驗證 Request、Response、Cookie、validation middleware 與 error handler，不建立大量 mock-heavy unit test。
- Repository 與 MySQL：不在 unit test 直接驗證 SQL。以啟動後端並連接專用測試資料庫的 Postman/API 測試驗證 migration、SQL、constraint 與完整 HTTP 流程。

本專案目前可維持「Unit test + Postman/API test」兩層。API 測試須使用可重建的專用測試資料庫、先執行 migration，且不得連接正式資料庫；日後若 transaction、併發或 SQL 除錯成本提高，再評估獨立 Repository integration test。
