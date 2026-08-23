import type {
    LoginRequest,
    RegisterRequest,
} from '../../../../../src/modules/user/requestSchemas/AuthRequestSchema.js';

import type {
    AccountAuth,
} from '../../../../../src/modules/user/types/TAccount.js';


// Service mock 預期回傳的帳號 ID。
export const expectedAccountId = 123;

// AuthSession mock 使用的 Session ID。
export const expectedSessionId = 456;

// 預設 nickname 測試資料。
export const defaultNickname = '大俠';

// 一般成功註冊的 request 測試資料。
export const validRegisterRequest = {
    email: 'user@example.com',
    password: 'Abc123456',
    nickname: defaultNickname,
} satisfies RegisterRequest;

// Email 已存在情境的 request 測試資料。
export const duplicateEmailRegisterRequest: RegisterRequest = {
    ...validRegisterRequest,
    email: 'existing@example.com',
};

// 未提供 nickname 情境的 request 測試資料。
export const registerRequestWithoutNickname: RegisterRequest = {
    email: 'user@example.com',
    password: 'Abc123456',
};

// 自訂 nickname 情境的 request 測試資料。
export const customNicknameRegisterRequest = {
    ...validRegisterRequest,
    nickname: '哈哈哈',
} satisfies RegisterRequest;

// 一般成功登入的 request 測試資料。
export const validLoginRequest = {
    email: 'user@example.com',
    password: 'Abc123456',
} satisfies LoginRequest;

// findAuthByEmail mock 回傳的帳號認證資料。
export const validAccountAuth: AccountAuth = {
    id: expectedAccountId,
    email: validLoginRequest.email,
    passwordHash: 'stored-password-hash',
    nickname: defaultNickname,
    avatarUrl: null,
};

// bcrypt mock 使用的假 hash。
export const fakePasswordHash =
    'fake-bcrypt-hash';

// Refresh Token service mock 使用的固定結果。
export const generatedRefreshToken =
    'generated-refresh-token';

export const generatedRefreshTokenHash =
    'generated-refresh-token-hash';

// JwtTokenService mock 使用的固定 Access Token。
export const generatedAccessToken =
    'generated-access-token';

// 有效 Refresh Session 的最小測試資料。
export const activeAuthSession = {
    id: expectedSessionId,
    accountId: expectedAccountId,
};
