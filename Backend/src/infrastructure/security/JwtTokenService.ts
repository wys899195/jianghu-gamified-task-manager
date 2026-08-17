// ========================================
// 負責 Access Token 的產生與驗證，
// 不處理帳號驗證、Refresh Token 與 Session 管理。
// ========================================

import jwt from 'jsonwebtoken';

import { authConfig } from '../../config/AuthConfig.js';


// ========================================
// Access Token Error
// ========================================

/**
 * Access Token 驗證失敗時使用的錯誤。
 *
 * AuthMiddleware 會將此類錯誤轉換為
 * USER_INVALID_ACCESS_TOKEN。
 */
export class JwtTokenError extends Error {

    constructor(
        message: string,
    ) {
        super(message);

        this.name = 'AccessTokenError';
    }
}


// ========================================
// Access Token Payload
// ========================================

/**
 * Access Token 驗證成功後所需要的 Payload。
 *
 * Access Token 只攜帶 API 驗證所需要的基本登入資訊。
 */
export type AccessTokenPayload = {
    accountId: number;
};


// ========================================
// Create Access Token
// ========================================

/**
 * 建立短效 Access Token。
 *
 * Token 包含：
 *
 * - accountId：登入帳號 ID
 *
 * Token 具有 expiration，
 * 過期後需要透過 Refresh Token 取得新的 Access Token。
 *
 * 此 function 不負責：
 *
 * - 帳號驗證
 * - Refresh Token
 * - Session 管理
 */
export function createAccessToken(
    accountId: number,
): string {

    return jwt.sign(
        {
            accountId,
        },
        authConfig.jwtSecret,
        {
            algorithm: authConfig.jwtAlgorithm,

            // Access Token 短期有效。
            expiresIn:
                authConfig.accessTokenExpiresIn,
        },
    );
}


// ========================================
// Verify Access Token
// ========================================

/**
 * 驗證 Access Token 並取得登入資訊。
 *
 * 此 function 只負責：
 *
 * - 驗證 JWT 簽章
 * - 驗證 Token 是否過期
 * - 驗證 JWT Payload 格式
 *
 * 不負責：
 *
 * - 確認 Access Token 對應的 Session 是否存在
 * - 確認帳號是否存在
 * - Session 管理
 * - 決定 HTTP Status Code
 *
 * JWT 本身驗證失敗或過期時，
 * 會拋出 AccessTokenError。
 *
 * 其他非預期錯誤則原樣往外拋，
 * 由上層 ApiErrorHandler 統一處理。
 */
export function verifyAccessToken(
    token: string,
): AccessTokenPayload {

    try {

        // 驗證 JWT 簽章、有效期限，
        // 並解析 Token Payload。
        const payload = jwt.verify(
            token,
            authConfig.jwtSecret,
            {
                algorithms: [
                    authConfig.jwtAlgorithm,
                ],
            },
        );


        // 確認 Payload 是否包含必要欄位。
        if (
            typeof payload === 'string' ||
            typeof payload.accountId !== 'number'
        ) {
            throw new JwtTokenError(
                'Invalid access token payload.',
            );
        }


        // 回傳驗證後的登入資訊。
        return {
            accountId: payload.accountId,
        };

    } catch (error) {

        // JWT 本身驗證失敗、
        // Token 過期等情況，
        // 都屬於 Access Token 無效。
        if (
            error instanceof jwt.JsonWebTokenError
        ) {
            throw new JwtTokenError(
                'Invalid access token.',
            );
        }


        // 其他非預期錯誤原樣往外拋。
        throw error;
    }
}