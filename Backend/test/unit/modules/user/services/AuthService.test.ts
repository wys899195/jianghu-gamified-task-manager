import {
    afterEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals';

import {
    passwordConfig,
} from '../../../../../src/config/PasswordConfig.js';

import {
    ServiceError,
} from '../../../../../src/shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../../../../../src/modules/user/apiErrors/UserErrors.js';

import {
    activeAuthSession,
    customNicknameRegisterRequest,
    defaultNickname,
    duplicateEmailRegisterRequest,
    expectedAccountId,
    generatedAccessToken,
    generatedRefreshToken,
    generatedRefreshTokenHash,
    fakePasswordHash,
    registerRequestWithoutNickname,
    validAccountAuth,
    validLoginRequest,
    validRegisterRequest,
} from './AuthServiceMockData.js';



// 模擬 AccountRepository.existsByEmail 的資料庫查詢結果。
const existsByEmailMock =
    jest.fn<(email: string) => Promise<boolean>>();

// 模擬 AccountRepository.createAccount 的建立帳號結果。
const createAccountMock =
    jest.fn<(
        email: string,
        passwordHash: string,
        nickname: string,
    ) => Promise<number>>();

// 模擬 AccountRepository.findAuthByEmail 的帳號查詢結果。
const findAuthByEmailMock =
    jest.fn<(email: string) => Promise<typeof validAccountAuth | null>>();

// 模擬 AccountRepository.updateLastLogin 的更新結果。
const updateLastLoginMock =
    jest.fn<(accountId: number) => Promise<void>>();

// 模擬 bcrypt.hash 的密碼雜湊結果。
const bcryptHashMock =
    jest.fn<(
        password: string,
        saltRounds: number,
    ) => Promise<string>>();

// 模擬 bcrypt.compare 的密碼比對結果。
const bcryptCompareMock =
    jest.fn<(
        password: string,
        passwordHash: string,
    ) => Promise<boolean>>();

// 模擬 AuthSessionRepository.createSession 的建立結果。
const createSessionMock =
    jest.fn<(
        accountId: number,
        refreshTokenHash: string,
        expiresAt: Date,
    ) => Promise<number>>();

// 模擬有效 Refresh Session 的查詢結果。
const findActiveSessionByRefreshTokenHashMock =
    jest.fn<(
        refreshTokenHash: string,
    ) => Promise<typeof activeAuthSession | null>>();

// 模擬 Refresh Session 最近使用時間的更新結果。
const updateSessionLastUsedAtMock =
    jest.fn<(sessionId: number) => Promise<void>>();

// 模擬 Refresh Session 撤銷結果。
const revokeSessionMock =
    jest.fn<(sessionId: number) => Promise<boolean>>();

// 模擬 JwtTokenService.createAccessToken 的結果。
const createAccessTokenMock =
    jest.fn<(accountId: number) => string>();

// 模擬 Refresh Token 的產生結果。
const generateRefreshTokenMock =
    jest.fn<() => string>();

// 模擬 Refresh Token 的 hash 結果。
const hashRefreshTokenMock =
    jest.fn<(refreshToken: string) => string>();


// 將 bcrypt module 替換成只提供測試用 hash mock 的 module。
jest.unstable_mockModule(
    'bcrypt',
    () => ({
        default: {
            hash: bcryptHashMock,
            compare: bcryptCompareMock,
        },
    }),
);

// 將 AccountRepository module 替換成測試用的 Repository functions。
jest.unstable_mockModule(
    '../../../../../src/modules/user/repositories/AccountRepository.js',
    () => ({
        findAuthByEmail: findAuthByEmailMock,
        existsByEmail: existsByEmailMock,
        createAccount: createAccountMock,
        updateLastLogin: updateLastLoginMock,
    }),
);

// 提供 AuthService 載入時需要的 AuthSessionRepository exports。
jest.unstable_mockModule(
    '../../../../../src/modules/user/repositories/AuthSessionRepository.js',
    () => ({
        createSession: createSessionMock,
        findActiveSessionByRefreshTokenHash:
            findActiveSessionByRefreshTokenHashMock,
        updateSessionLastUsedAt: updateSessionLastUsedAtMock,
        revokeSession: revokeSessionMock,
    }),
);

// 將 JwtTokenService module 替換成固定的 Access Token 建立結果。
jest.unstable_mockModule(
    '../../../../../src/infrastructure/security/JwtTokenService.js',
    () => ({
        createAccessToken: createAccessTokenMock,
    }),
);

// 將 RefreshTokenService module 替換成固定的 Token 與 hash 結果。
jest.unstable_mockModule(
    '../../../../../src/infrastructure/security/RefreshTokenService.js',
    () => ({
        generateRefreshToken: generateRefreshTokenMock,
        hashRefreshToken: hashRefreshTokenMock,
    }),
);

// 載入已接上上述 mock dependencies 的真實 AuthService。
const {
    register,
    login,
    refreshAccessToken,
    logout,
} = await import(
    '../../../../../src/modules/user/services/AuthService.js'
);

// 目標函式：AuthService.register
describe('AuthService.register', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    /*
        測試目標：確認重複 Email 會拒絕註冊並停止後續流程。
        預期結果：拋出 USER_EMAIL_ALREADY_EXISTS，且不 hash 密碼或建立帳號。
    */
    test('rejects when the email already exists', async () => {

        // 模擬資料庫確認 Email 已存在。
        existsByEmailMock.mockResolvedValue(true);

        await expect(
            register(duplicateEmailRegisterRequest),
        ).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_EMAIL_ALREADY_EXISTS,
            ),
        );

        expect(existsByEmailMock).toHaveBeenCalledWith(
            duplicateEmailRegisterRequest.email,
        );
        expect(bcryptHashMock).not.toHaveBeenCalled();
        expect(createAccountMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認 Email 不存在時會完成註冊流程。
        預期結果：依序檢查 Email、hash 密碼、建立帳號，並回傳 accountId。
    */
    test('creates an account and returns the account id', async () => {

        // 模擬註冊流程中的成功回傳值。
        existsByEmailMock.mockResolvedValue(false);
        bcryptHashMock.mockResolvedValue(fakePasswordHash);
        createAccountMock.mockResolvedValue(expectedAccountId);

        await expect(
            register(validRegisterRequest),
        ).resolves.toBe(expectedAccountId);

        expect(existsByEmailMock).toHaveBeenCalledWith(
            validRegisterRequest.email,
        );
        expect(bcryptHashMock).toHaveBeenCalledWith(
            validRegisterRequest.password,
            passwordConfig.bcryptSaltRounds,
        );
        expect(createAccountMock).toHaveBeenCalledWith(
            validRegisterRequest.email,
            fakePasswordHash,
            validRegisterRequest.nickname,
        );
    });


    /*
        測試目標：未提供 nickname 時，應使用預設 nickname。
        預期結果：createAccount 收到 defaultNickname。
    */
    test('uses the default nickname when nickname is omitted', async () => {

        // 模擬註冊流程中的成功回傳值。
        existsByEmailMock.mockResolvedValue(false);
        bcryptHashMock.mockResolvedValue(fakePasswordHash);
        createAccountMock.mockResolvedValue(expectedAccountId);

        await register(registerRequestWithoutNickname);

        expect(createAccountMock).toHaveBeenCalledWith(
            registerRequestWithoutNickname.email,
            fakePasswordHash,
            defaultNickname,
        );
    });

    /*
        測試目標：確認提供 nickname 時保留使用者輸入值。
        預期結果：createAccount 收到傳入的 nickname。
    */
    test('uses the provided nickname', async () => {

        // 模擬註冊流程中的成功回傳值。
        existsByEmailMock.mockResolvedValue(false);
        bcryptHashMock.mockResolvedValue(fakePasswordHash);
        createAccountMock.mockResolvedValue(expectedAccountId);

        await register(customNicknameRegisterRequest);

        expect(createAccountMock).toHaveBeenCalledWith(
            customNicknameRegisterRequest.email,
            fakePasswordHash,
            customNicknameRegisterRequest.nickname,
        );
    });

    /*
        測試目標：確認不存在的帳號無法登入。
        預期結果：拋出 USER_INVALID_CREDENTIALS，且不比對密碼或建立 Session。
    */
    test('rejects when the account does not exist', async () => {

        // 模擬找不到登入帳號。
        findAuthByEmailMock.mockResolvedValue(null);

        await expect(
            login(validLoginRequest),
        ).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_INVALID_CREDENTIALS,
            ),
        );

        expect(bcryptCompareMock).not.toHaveBeenCalled();
        expect(createSessionMock).not.toHaveBeenCalled();
        expect(createAccessTokenMock).not.toHaveBeenCalled();
        expect(updateLastLoginMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認密碼錯誤時不建立登入 Session。
        預期結果：拋出 USER_INVALID_CREDENTIALS，且不產生 Token 或更新最後登入時間。
    */
    test('rejects when the password is invalid', async () => {

        // 模擬找到帳號但密碼比對失敗。
        findAuthByEmailMock.mockResolvedValue(validAccountAuth);
        bcryptCompareMock.mockResolvedValue(false);

        await expect(
            login(validLoginRequest),
        ).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_INVALID_CREDENTIALS,
            ),
        );

        expect(bcryptCompareMock).toHaveBeenCalledWith(
            validLoginRequest.password,
            validAccountAuth.passwordHash,
        );
        expect(generateRefreshTokenMock).not.toHaveBeenCalled();
        expect(createSessionMock).not.toHaveBeenCalled();
        expect(createAccessTokenMock).not.toHaveBeenCalled();
        expect(updateLastLoginMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認有效帳密會建立登入 Session 並回傳兩種 Token。
        預期結果：Session 使用 Refresh Token hash，且更新最後登入時間。
    */
    test('creates a session and returns tokens for valid credentials', async () => {

        // 模擬登入流程中各外部依賴的成功結果。
        findAuthByEmailMock.mockResolvedValue(validAccountAuth);
        bcryptCompareMock.mockResolvedValue(true);
        generateRefreshTokenMock.mockReturnValue(generatedRefreshToken);
        hashRefreshTokenMock.mockReturnValue(generatedRefreshTokenHash);
        createSessionMock.mockResolvedValue(1);
        createAccessTokenMock.mockReturnValue(generatedAccessToken);
        updateLastLoginMock.mockResolvedValue();

        await expect(
            login(validLoginRequest),
        ).resolves.toEqual({
            accessToken: generatedAccessToken,
            refreshToken: generatedRefreshToken,
        });

        expect(createSessionMock).toHaveBeenCalledWith(
            expectedAccountId,
            generatedRefreshTokenHash,
            expect.any(Date),
        );
        expect(createAccessTokenMock).toHaveBeenCalledWith(
            expectedAccountId,
        );
        expect(updateLastLoginMock).toHaveBeenCalledWith(
            expectedAccountId,
        );
    });

    /*
        測試目標：確認無有效 Refresh Session 時不能取得新 Access Token。
        預期結果：拋出 USER_INVALID_REFRESH_TOKEN，且不更新 Session 或建立 Token。
    */
    test('rejects when the refresh session is invalid', async () => {

        // 模擬 Refresh Token 沒有對應的有效 Session。
        hashRefreshTokenMock.mockReturnValue(generatedRefreshTokenHash);
        findActiveSessionByRefreshTokenHashMock.mockResolvedValue(null);

        await expect(
            refreshAccessToken(generatedRefreshToken),
        ).rejects.toEqual(
            new ServiceError(
                UserErrorCode.USER_INVALID_REFRESH_TOKEN,
            ),
        );

        expect(updateSessionLastUsedAtMock).not.toHaveBeenCalled();
        expect(createAccessTokenMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認有效 Refresh Session 可更新使用時間並建立新 Access Token。
        預期結果：使用 Session 的 id 與 accountId，回傳新 Access Token。
    */
    test('updates the session and returns a new access token', async () => {

        // 模擬找到有效 Refresh Session。
        hashRefreshTokenMock.mockReturnValue(generatedRefreshTokenHash);
        findActiveSessionByRefreshTokenHashMock.mockResolvedValue(
            activeAuthSession,
        );
        updateSessionLastUsedAtMock.mockResolvedValue();
        createAccessTokenMock.mockReturnValue(generatedAccessToken);

        await expect(
            refreshAccessToken(generatedRefreshToken),
        ).resolves.toBe(generatedAccessToken);

        expect(updateSessionLastUsedAtMock).toHaveBeenCalledWith(
            activeAuthSession.id,
        );
        expect(createAccessTokenMock).toHaveBeenCalledWith(
            activeAuthSession.accountId,
        );
    });

    /*
        測試目標：確認沒有有效 Session 時登出保持冪等。
        預期結果：回傳 false，且不嘗試撤銷 Session。
    */
    test('returns false when no active session exists during logout', async () => {

        // 模擬找不到可撤銷的 Session。
        hashRefreshTokenMock.mockReturnValue(generatedRefreshTokenHash);
        findActiveSessionByRefreshTokenHashMock.mockResolvedValue(null);

        await expect(
            logout(generatedRefreshToken),
        ).resolves.toBe(false);

        expect(revokeSessionMock).not.toHaveBeenCalled();
    });

    /*
        測試目標：確認有效 Session 會在登出時被撤銷。
        預期結果：使用正確 Session id 呼叫撤銷，並回傳撤銷結果。
    */
    test('revokes the active session during logout', async () => {

        // 模擬找到並成功撤銷有效 Session。
        hashRefreshTokenMock.mockReturnValue(generatedRefreshTokenHash);
        findActiveSessionByRefreshTokenHashMock.mockResolvedValue(
            activeAuthSession,
        );
        revokeSessionMock.mockResolvedValue(true);

        await expect(
            logout(generatedRefreshToken),
        ).resolves.toBe(true);

        expect(revokeSessionMock).toHaveBeenCalledWith(
            activeAuthSession.id,
        );
    });
});
