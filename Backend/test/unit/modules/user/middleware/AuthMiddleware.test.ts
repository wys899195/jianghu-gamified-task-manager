import {
    afterEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals';

import type {
    Request,
    Response,
} from 'express';

import {
    UserErrorCode,
} from '../../../../../src/modules/user/apiErrors/UserErrors.js';

import {
    validAccessToken,
    validAccountId,
} from './AuthMiddlewareMockData.js';


// 模擬 JwtTokenService 驗證成功後的最小 payload。
type MockAccessTokenPayload = {
    accountId: number;
};

// 供 mocked JwtTokenService 與 AuthMiddleware 共用的預期 JWT 錯誤類別。
class MockJwtTokenError extends Error {}

// 模擬 JwtTokenService.verifyAccessToken 的驗證結果。
const verifyAccessTokenMock =
    jest.fn<(token: string) => MockAccessTokenPayload>();

// 建立最小化的 Express Request，並可選擇加入 Authorization Header。
const createRequest = (
    authorization?: string,
): Request => ({
    headers: authorization === undefined
        ? {}
        : {
            authorization,
        },
} as Request);

// 建立只包含 middleware 所需 locals 的 Express Response。
const createResponse = (): Response => ({
    locals: {},
} as Response);

// 記錄 middleware 傳遞的成功流程或錯誤。
// 使用單一可選錯誤參數，避免 Express NextFunction 的多載與 Jest Mock 型別衝突。
const nextMock =
    jest.fn<(error?: unknown) => void>();


// 將 JwtTokenService module 替換成受控的驗證結果與錯誤類別。
jest.unstable_mockModule(
    '../../../../../src/infrastructure/security/JwtTokenService.js',
    () => ({
        verifyAccessToken: verifyAccessTokenMock,
        JwtTokenError: MockJwtTokenError,
    }),
);

// 載入已接上 JwtTokenService mock 的真實 AuthMiddleware。
const {
    authenticateRequest,
} = await import(
    '../../../../../src/modules/user/middleware/AuthMiddleware.js'
);


// 目標函式：AuthMiddleware.authenticateRequest
describe('AuthMiddleware.authenticateRequest', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    /*
        測試目標：確認缺少 Authorization Header 時拒絕請求。
        預期結果：next 收到 USER_INVALID_ACCESS_TOKEN，且不驗證 Token。
    */
    test('rejects when the authorization header is missing', async () => {

        // 建立沒有 Authorization Header 的 Request。
        const request = createRequest();

        await authenticateRequest(
            request,
            createResponse(),
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                code: UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            }),
        );
        expect(verifyAccessTokenMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認非 Bearer 格式的 Authorization Header 會被拒絕。
        預期結果：next 收到 USER_INVALID_ACCESS_TOKEN，且不驗證 Token。
    */
    test('rejects when the authorization scheme is not Bearer', async () => {

        // 建立使用錯誤驗證 scheme 的 Request。
        const request = createRequest(
            `Basic ${validAccessToken}`,
        );

        await authenticateRequest(
            request,
            createResponse(),
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                code: UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            }),
        );
        expect(verifyAccessTokenMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認 Bearer Header 缺少 Token 時會被拒絕。
        預期結果：next 收到 USER_INVALID_ACCESS_TOKEN，且不驗證 Token。
    */
    test('rejects when the Bearer token is missing', async () => {

        // 建立沒有 Token 的 Bearer Header。
        const request = createRequest('Bearer');

        await authenticateRequest(
            request,
            createResponse(),
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                code: UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            }),
        );
        expect(verifyAccessTokenMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認預期 JWT 驗證錯誤會統一轉成身份驗證錯誤。
        預期結果：next 收到 USER_INVALID_ACCESS_TOKEN。
    */
    test('maps a JwtTokenError to an invalid access token error', async () => {

        // 模擬 JwtTokenService 回報預期的驗證錯誤。
        verifyAccessTokenMock.mockImplementation(() => {
            throw new MockJwtTokenError('Invalid access token.');
        });

        await authenticateRequest(
            createRequest(`Bearer ${validAccessToken}`),
            createResponse(),
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                code: UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            }),
        );
    });

    /*
        測試目標：確認非預期驗證錯誤不會被誤分類為身份驗證錯誤。
        預期結果：next 收到原始錯誤物件。
    */
    test('forwards an unexpected verification error', async () => {

        // 模擬 JwtTokenService 發生非預期錯誤。
        const unexpectedError = new Error('Unexpected verification error.');

        verifyAccessTokenMock.mockImplementation(() => {
            throw unexpectedError;
        });

        await authenticateRequest(
            createRequest(`Bearer ${validAccessToken}`),
            createResponse(),
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            unexpectedError,
        );
    });

    /*
        測試目標：確認有效 Access Token 可建立後續請求所需的身份資料。
        預期結果：res.locals.auth 寫入 accountId，並以無錯誤的 next 繼續流程。
    */
    test('stores the account id and continues for a valid access token', async () => {

        // 模擬 JwtTokenService 成功驗證 Token。
        verifyAccessTokenMock.mockReturnValue({
            accountId: validAccountId,
        });

        // 建立要驗證結果的 Response。
        const response = createResponse();

        await authenticateRequest(
            createRequest(`Bearer ${validAccessToken}`),
            response,
            nextMock,
        );

        expect(response.locals.auth).toEqual({
            accountId: validAccountId,
        });
        expect(nextMock).toHaveBeenCalledWith();
    });
});
