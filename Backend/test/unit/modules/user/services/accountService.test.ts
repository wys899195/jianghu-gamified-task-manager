import {
    afterEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals';

import {
    ServiceError,
} from '../../../../../src/shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../../../../../src/modules/user/apiErrors/UserErrors.js';

import {
    accountId,
    currentPassword,
    currentPasswordHash,
    wrongPasswordDeleteAccountRequest,
    validDeleteAccountRequest,
} from './accountServiceMockData.js';


// 模擬 AccountRepository.findPasswordHashById 的查詢結果。
const findPasswordHashByIdMock =
    jest.fn<(accountId: number) => Promise<string | null>>();

// 模擬 AccountRepository.deleteAccount 的刪除結果。
const deleteAccountByIdMock =
    jest.fn<(accountId: number) => Promise<boolean>>();

// 模擬 bcrypt.compare 的密碼比對結果。
const bcryptCompareMock =
    jest.fn<(
        password: string,
        passwordHash: string,
    ) => Promise<boolean>>();


// 將 bcrypt module 替換成受控的密碼比對結果。
jest.unstable_mockModule(
    'bcrypt',
    () => ({
        default: {
            compare: bcryptCompareMock,
        },
    }),
);

// 將 AccountRepository module 替換成測試用的 Repository functions。
jest.unstable_mockModule(
    '../../../../../src/modules/user/repositories/AccountRepository.js',
    () => ({
        findPasswordHashById: findPasswordHashByIdMock,
        deleteAccount: deleteAccountByIdMock,
    }),
);

// 載入已接上 mock dependencies 的真實 AccountService。
const {
    deleteAccount,
} = await import(
    '../../../../../src/modules/user/services/accountService.js'
);


describe('AccountService.deleteAccount', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    /*
        測試目標：確認帳號不存在時拒絕刪除並停止密碼驗證。
        預期結果：拋出 USER_ACCOUNT_NOT_FOUND，且不比對密碼或執行刪除。
    */
    test('rejects when the account does not exist', async () => {

        // Arrange：模擬找不到帳號的密碼 Hash。
        findPasswordHashByIdMock.mockResolvedValue(null);

        // Act：執行刪除帳號流程。
        const result = deleteAccount(
            accountId,
            validDeleteAccountRequest,
        );

        // Assert：確認錯誤分類與流程中止結果。
        await expect(result).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_ACCOUNT_NOT_FOUND,
            ),
        );
        expect(bcryptCompareMock).not.toHaveBeenCalled();
        expect(deleteAccountByIdMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認目前密碼錯誤時拒絕刪除帳號。
        預期結果：拋出 USER_INVALID_PASSWORD，且不執行刪除。
    */
    test('rejects when the current password is invalid', async () => {

        // Arrange：模擬帳號存在但密碼比對失敗。
        findPasswordHashByIdMock.mockResolvedValue(
            currentPasswordHash,
        );
        bcryptCompareMock.mockResolvedValue(false);

        // Act：執行刪除帳號流程。
        const result = deleteAccount(
            accountId,
            wrongPasswordDeleteAccountRequest,
        );

        // Assert：確認使用儲存的 Hash 驗證輸入，且不執行刪除。
        await expect(result).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_INVALID_PASSWORD,
            ),
        );
        expect(bcryptCompareMock).toHaveBeenCalledWith(
            wrongPasswordDeleteAccountRequest.password,
            currentPasswordHash,
        );
        expect(deleteAccountByIdMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認密碼正確時永久刪除登入者帳號。
        預期結果：使用 Access Token 對應的 accountId 刪除帳號並完成流程。
    */
    test('deletes the account when the current password is valid', async () => {

        // Arrange：模擬密碼驗證與刪除成功。
        findPasswordHashByIdMock.mockResolvedValue(
            currentPasswordHash,
        );
        bcryptCompareMock.mockResolvedValue(true);
        deleteAccountByIdMock.mockResolvedValue(true);

        // Act：執行刪除帳號流程。
        await expect(
            deleteAccount(
                accountId,
                validDeleteAccountRequest,
            ),
        ).resolves.toBeUndefined();

        // Assert：確認驗證目前密碼並刪除正確帳號。
        expect(bcryptCompareMock).toHaveBeenCalledWith(
            currentPassword,
            currentPasswordHash,
        );
        expect(deleteAccountByIdMock).toHaveBeenCalledWith(
            accountId,
        );
    });

    /*
        測試目標：確認密碼驗證後帳號已不存在時回傳一致的錯誤。
        預期結果：Repository 回傳 false 時拋出 USER_ACCOUNT_NOT_FOUND。
    */
    test('rejects when the account disappears before deletion', async () => {

        // Arrange：模擬密碼驗證成功但刪除時找不到帳號。
        findPasswordHashByIdMock.mockResolvedValue(
            currentPasswordHash,
        );
        bcryptCompareMock.mockResolvedValue(true);
        deleteAccountByIdMock.mockResolvedValue(false);

        // Act：執行刪除帳號流程。
        const result = deleteAccount(
            accountId,
            validDeleteAccountRequest,
        );

        // Assert：確認刪除競態仍使用帳號不存在錯誤。
        await expect(result).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_ACCOUNT_NOT_FOUND,
            ),
        );
    });
});
