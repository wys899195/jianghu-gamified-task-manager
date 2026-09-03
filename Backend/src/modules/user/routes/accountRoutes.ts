// ========================================
// 定義 Account API Route 與 Middleware wiring。
// ========================================

import {
    Router,
} from 'express';

import {
    deleteAccountController,
} from '../controllers/accountController.js';

import {
    deleteAccountRequestSchema,
} from '../requestSchemas/accountRequestSchema.js';

import {
    authenticateRequest,
} from '../middleware/AuthMiddleware.js';

import {
    validateRequestBody,
} from '../../../shared/middleware/ValidationMiddleware.js';


const router = Router();


/**
 * 永久刪除登入者帳號。
 *
 * DELETE /account
 *
 * 必須先驗證 Access Token，再驗證目前密碼。
 */
router.delete(
    '/',
    authenticateRequest,
    validateRequestBody(
        deleteAccountRequestSchema,
    ),
    deleteAccountController,
);


export default router;
