// ========================================
// 負責使用者身份驗證與登入 Session 操作，
// 包含註冊、登入、Refresh Token 更新與登出。
// ========================================

import bcrypt from 'bcrypt';

import {
    findAuthByEmail,
    createAccount,
    updateLastLogin,
    existsByEmail,
} from '../repositories/AccountRepository.js';

import {
    createSession,
    findActiveSessionByRefreshTokenHash,
    updateSessionLastUsedAt,
    revokeSession,
} from '../repositories/AuthSessionRepository.js';

import {
    createAccessToken,
} from '../../../infrastructure/security/JwtTokenService.js';

import {
    generateRefreshToken,
    hashRefreshToken,
} from '../../../infrastructure/security/RefreshTokenService.js';

import {
    authConfig,
} from '../../../config/AuthConfig.js';

import {
    passwordConfig,
} from '../../../config/PasswordConfig.js';

import {
    ServiceError,
} from '../../../shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../apiErrors/UserErrors.js';

import type {
    LoginRequest,
    RegisterRequest,
} from '../requestSchemas/AuthRequestSchema.js';



// ========================================
// Register
// ========================================

const DEFAULT_NICKNAME = '大俠';

/**
 * 註冊新帳號。
 *
 * 流程：
 *
 * 1. 檢查 Email 是否已存在
 * 2. 使用 bcrypt hash 密碼
 * 3. 建立帳號
 */
export async function register(
    request: RegisterRequest,
): Promise<number> {

    const {
        email,
        password,
        nickname = DEFAULT_NICKNAME,
    } = request;

    const emailExists = await existsByEmail(email);


    if (emailExists) {

        throw new ServiceError(
            UserErrorCode.USER_EMAIL_ALREADY_EXISTS,
        );

    }

    const passwordHash =
        await bcrypt.hash(
            password,
            passwordConfig.bcryptSaltRounds,
        );


    const accountId =
        await createAccount(
            email,
            passwordHash,
            nickname,
        );


    return accountId;
}


// ========================================
// Login
// ========================================

/**
 * 登入。
 *
 * 流程：
 *
 * 1. 使用 Email 查詢登入資料
 * 2. 驗證密碼
 * 3. 建立 Refresh Token
 * 4. 建立 Refresh Session
 * 5. 建立短效 Access Token
 * 6. 更新最後登入時間
 *
 * Refresh Token：
 *
 * - 使用 cryptographically secure random value
 * - 不使用 JWT
 * - 不直接儲存於 Database
 * - Database 只儲存其 SHA-256 Hash
 *
 * V1 不使用 Refresh Token Rotation，
 * 因此同一個 Session 的 Refresh Token
 * 在 Session 有效期間維持固定值。
 */
export async function login(
    request: LoginRequest,
): Promise<{
    accessToken: string;
    refreshToken: string;
}> {

    const {
        email,
        password,
    } = request;

    const account =
        await findAuthByEmail(email);


    // 帳號不存在
    if (!account) {

        throw new ServiceError(
            UserErrorCode.USER_INVALID_CREDENTIALS,
        );

    }


    const isPasswordValid =
        await bcrypt.compare(
            password,
            account.passwordHash,
        );


    // 密碼錯誤
    if (!isPasswordValid) {

        throw new ServiceError(
            UserErrorCode.USER_INVALID_CREDENTIALS,
        );

    }


    // ========================================
    // 建立 Refresh Session
    // ========================================

    // 產生新的 Refresh Token。
    const refreshToken =
        generateRefreshToken();


    // Database 不儲存原始 Refresh Token，
    // 只儲存 SHA-256 Hash。
    const refreshTokenHash =
        hashRefreshToken(
            refreshToken,
        );


    // 計算 Refresh Session 過期時間。
    const expiresAt =
        new Date(
            Date.now() +
            authConfig.refreshTokenExpiresInMs,
        );


    await createSession(
        account.id,
        refreshTokenHash,
        expiresAt,
    );


    // ========================================
    // 建立 Access Token
    // ========================================

    const accessToken =
        createAccessToken(
            account.id,
        );


    // 更新最後登入時間。
    await updateLastLogin(
        account.id,
    );


    return {
        accessToken,
        refreshToken,
    };
}


// ========================================
// Refresh Access Token
// ========================================

/**
 * 使用 Refresh Token 取得新的 Access Token。
 *
 * V1：
 *
 * - Refresh Token 不 Rotation
 * - Refresh Token 本身不改變
 * - 只重新產生 Access Token
 *
 * 流程：
 *
 * 1. Hash Refresh Token
 * 2. 查詢有效 Session
 * 3. 取得 Session 對應的 accountId
 * 4. 更新 Session 最近使用時間
 * 5. 建立新的 Access Token
 */
export async function refreshAccessToken(
    refreshToken: string,
): Promise<string> {

    const refreshTokenHash =
        hashRefreshToken(
            refreshToken,
        );


    const session =
        await findActiveSessionByRefreshTokenHash(
            refreshTokenHash,
        );


    // Refresh Token 不存在、
    // Session 已撤銷、
    // Session 已過期，
    // 都視為 Refresh Token 無效。
    if (!session) {

        throw new ServiceError(
            UserErrorCode.USER_INVALID_REFRESH_TOKEN,
        );

    }


    // 更新 Session 最近使用時間。
    //
    // V1 只記錄活動時間，
    // 不會因此延長 expires_at。
    await updateSessionLastUsedAt(
        session.id,
    );


    // 建立新的短效 Access Token。
    const accessToken =
        createAccessToken(
            session.accountId,
        );


    return accessToken;
}


// ========================================
// Logout
// ========================================

/**
 * 登出目前 Refresh Session。
 *
 * V1 不依賴 Access Token，
 * 而是使用 HttpOnly Cookie 中的 Refresh Token
 * 找到對應 Session 後將其撤銷。
 *
 * 因此即使 Access Token 已經過期，
 * 使用者仍然可以正常登出。
 *
 * Refresh Token 本身不需要從 Database 中刪除，
 * 只需要將 Session 設為 revoked。
 */
export async function logout(
    refreshToken: string,
): Promise<boolean> {

    const refreshTokenHash =
        hashRefreshToken(
            refreshToken,
        );


    const session =
        await findActiveSessionByRefreshTokenHash(
            refreshTokenHash,
        );


    // 找不到有效 Session。
    //
    // Logout 可以由 Controller 視為冪等操作，
    // 因此這裡直接回傳 false。
    if (!session) {
        return false;
    }


    return revokeSession(
        session.id,
    );
}
