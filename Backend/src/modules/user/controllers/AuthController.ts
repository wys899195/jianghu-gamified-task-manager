// ========================================
// 處理使用者身份驗證相關 HTTP Request。
// 負責接收請求、呼叫 AuthService、管理 Refresh Token Cookie、回傳 Response。
// ========================================

import type {
    Request,
    Response,
    NextFunction,
} from 'express';

import {
    register,
    login,
    refreshAccessToken,
    logout,
} from '../services/AuthService.js';

import {
    ServiceError,
} from '../../../shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../apiErrors/UserErrors.js';

import {
    authConfig,
} from '../../../config/AuthConfig.js';


// ========================================
// Refresh Token Cookie
// ========================================

const REFRESH_TOKEN_COOKIE_NAME =
    'refreshToken';


const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
};


// ========================================
// Register
// ========================================

/**
 * 註冊新帳號。
 *
 * Request:
 * POST /auth/register
 *
 * Body:
 * {
 *   email,
 *   password,
 *   nickname (optional; defaults to the service-defined default nickname)
 * }
 */
export async function registerController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        const accountId =
            await register(
                req.body,
            );


        res.status(201).json({
            accountId,
        });


    } catch (error) {

        next(error);

    }
}


// ========================================
// Login
// ========================================

/**
 * 使用 Email 與密碼登入。
 *
 * Request:
 * POST /auth/login
 *
 * Body:
 * {
 *   email,
 *   password
 * }
 *
 * Response:
 * {
 *   accessToken
 * }
 *
 * Refresh Token 不放入 Response Body，
 * 而是儲存於 HttpOnly Cookie。
 */
export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        const {
            accessToken,
            refreshToken,
        } = await login(
            req.body,
        );


        // 將 Refresh Token 儲存於 HttpOnly Cookie。
        //
        // JavaScript 無法直接讀取此 Cookie。
        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            refreshToken,
            {
                ...REFRESH_TOKEN_COOKIE_OPTIONS,

                // Cookie 保存期限與
                // Refresh Session 保持一致。
                maxAge:
                    authConfig.refreshTokenExpiresInMs,
            },
        );


        // Access Token 回傳給前端，
        // 前端之後放入 Authorization Header。
        res.status(200).json({
            accessToken,
        });


    } catch (error) {

        next(error);

    }
}


// ========================================
// Refresh Access Token
// ========================================

/**
 * 使用 Refresh Token 取得新的 Access Token。
 *
 * Request:
 * POST /auth/refresh
 *
 * Refresh Token：
 * HttpOnly Cookie
 *
 * Response:
 * {
 *   accessToken
 * }
 *
 * V1 不使用 Refresh Token Rotation，
 * 因此 Refresh Token 不會改變。
 */
export async function refreshTokenController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        const refreshToken =
            req.cookies?.[
                REFRESH_TOKEN_COOKIE_NAME
            ];


        // Refresh Token 不存在。
        if (!refreshToken) {

            throw new ServiceError(
                UserErrorCode.USER_INVALID_REFRESH_TOKEN,
            );

        }


        const accessToken =
            await refreshAccessToken(
                refreshToken,
            );


        res.status(200).json({
            accessToken,
        });


    } catch (error) {

        next(error);

    }
}


// ========================================
// Logout
// ========================================

/**
 * 登出目前登入 Session。
 *
 * Request:
 * POST /auth/logout
 *
 * Refresh Token：
 * HttpOnly Cookie
 *
 * Logout 不依賴 Access Token。
 *
 * 即使 Access Token 已經過期，
 * 仍然可以使用 Refresh Token
 * 撤銷目前的登入 Session。
 *
 * 如果 Refresh Token 不存在，
 * Logout 仍視為成功。
 */
export async function logoutController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        const refreshToken =
            req.cookies?.[
                REFRESH_TOKEN_COOKIE_NAME
            ];


        // Refresh Token 存在時，
        // 撤銷對應的 Refresh Session。
        if (refreshToken) {

            await logout(
                refreshToken,
            );

        }


        // 無論 Session 是否存在，
        // 都清除瀏覽器中的 Refresh Token Cookie。
        res.clearCookie(
            REFRESH_TOKEN_COOKIE_NAME,
            REFRESH_TOKEN_COOKIE_OPTIONS,
        );


        // Logout 採冪等設計：
        // 已經登出也視為成功。
        res.status(204).send();


    } catch (error) {

        next(error);

    }
}
