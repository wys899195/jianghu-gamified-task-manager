// ========================================
// 定義身份驗證相關 API Route，
// 負責連接 Middleware 與 Controller。
// 不處理業務邏輯。
// ========================================

import {
    Router,
} from 'express';

import {
    registerController,
    loginController,
    refreshTokenController,
    logoutController,
} from '../controllers/AuthController.js';

import {
    loginRequestSchema,
    registerRequestSchema,
} from '../requestSchemas/AuthRequestSchema.js';

import {
    validateRequestBody,
} from '../../../shared/middleware/ValidationMiddleware.js';


const router = Router();


// ========================================
// Register
// ========================================

/**
 * 註冊。
 *
 * POST /auth/register
 */
router.post(
    '/register',
    validateRequestBody(registerRequestSchema),
    registerController,
);


// ========================================
// Login
// ========================================

/**
 * 登入。
 *
 * POST /auth/login
 *
 * 成功後：
 *
 * - Access Token → Response Body
 * - Refresh Token → HttpOnly Cookie
 */
router.post(
    '/login',
    validateRequestBody(loginRequestSchema),
    loginController,
);


// ========================================
// Refresh Access Token
// ========================================

/**
 * 更新 Access Token。
 *
 * POST /auth/refresh
 *
 * 使用 HttpOnly Cookie 中的 Refresh Token
 * 取得新的 Access Token。
 *
 * 不使用 authenticateRequest，
 * 因為 Access Token 可能已經過期。
 */
router.post(
    '/refresh',
    refreshTokenController,
);


// ========================================
// Logout
// ========================================

/**
 * 登出目前登入 Session。
 *
 * POST /auth/logout
 *
 * 使用 HttpOnly Cookie 中的 Refresh Token
 * 撤銷目前的 Refresh Session。
 *
 * 不使用 authenticateRequest。
 *
 * 原因：
 *
 * - Access Token 可能已經過期
 * - Logout 不應依賴 Access Token
 * - Refresh Token 才是目前 Session 的憑證
 *
 * Logout 即使沒有有效 Refresh Token，
 * 也應保持冪等並成功清除 Cookie。
 */
router.post(
    '/logout',
    logoutController,
);


export default router;
