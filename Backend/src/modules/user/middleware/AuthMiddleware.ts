// ========================================
// 驗證使用者 Access Token，
// 驗證成功後將登入資訊存入 res.locals.auth。
// ========================================

import type {
    Request,
    Response,
    NextFunction,
} from 'express';

import {
    verifyAccessToken,
    JwtTokenError,
} from '../../../infrastructure/security/JwtTokenService.js';

import {
    ServiceError,
} from '../../../shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../apiErrors/UserErrors.js';


/**
 * 驗證目前 Request 是否具有有效的登入身份。
 *
 * 驗證流程：
 *
 * 1. 取得 Authorization Header
 * 2. 驗證 Bearer Token 格式
 * 3. 驗證 Access Token 簽章、期限與 Payload
 * 4. 將驗證後的 accountId 存入 res.locals.auth
 *
 * Access Token 驗證失敗時，
 * 統一回傳 USER_INVALID_ACCESS_TOKEN。
 *
 * 此 Middleware 不負責：
 *
 * - Refresh Token
 * - Refresh Session
 * - Session 管理
 * - 帳號是否存在
 *
 * 其他非預期錯誤則交由 ApiErrorHandler 處理。
 */
export async function authenticateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        // ========================================
        // 取得 Authorization Header
        // ========================================

        const authorization =
            req.headers.authorization;


        // 確認 Header 存在。
        if (!authorization) {

            throw new ServiceError(
                UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            );

        }


        // ========================================
        // 驗證 Bearer Token 格式
        // ========================================

        const [scheme, token] =
            authorization.split(' ');


        if (
            scheme !== 'Bearer' ||
            !token
        ) {

            throw new ServiceError(
                UserErrorCode.USER_INVALID_ACCESS_TOKEN,
            );

        }


        // ========================================
        // 驗證 Access Token
        // ========================================

        let payload;

        try {

            payload =
                verifyAccessToken(token);

        } catch (error) {

            // JWT 本身驗證失敗、
            // Token 過期或 Payload 無效，
            // 都屬於預期的身份驗證錯誤。
            if (
                error instanceof JwtTokenError
            ) {

                throw new ServiceError(
                    UserErrorCode.USER_INVALID_ACCESS_TOKEN,
                );

            }


            // 其他非預期錯誤繼續往外拋，
            // 最終由 ApiErrorHandler 回傳 500。
            throw error;
        }


        // ========================================
        // 儲存登入資訊
        // ========================================

        // Access Token 驗證成功後，
        // 將 accountId 提供給後續 Controller。
        res.locals.auth = {
            accountId: payload.accountId,
        };


        // 驗證成功，
        // 繼續執行下一個 Middleware / Controller。
        next();

    } catch (error) {

        next(error);

    }
}
