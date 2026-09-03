// ========================================
// 處理 Account API 的 HTTP Request 與 Response。
// ========================================

import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import {
    deleteAccount,
} from '../services/accountService.js';

import type {
    DeleteAccountRequest,
} from '../requestSchemas/accountRequestSchema.js';


const REFRESH_TOKEN_COOKIE_NAME =
    'refreshToken';

const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
};


/**
 * 驗證目前密碼並永久刪除登入者帳號。
 *
 * Request:
 * DELETE /account
 *
 * Response:
 * 204 No Content
 */
export async function deleteAccountController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {

    try {

        const accountId =
            res.locals.auth.accountId;

        await deleteAccount(
            accountId,
            req.body as DeleteAccountRequest,
        );


        res.clearCookie(
            REFRESH_TOKEN_COOKIE_NAME,
            REFRESH_TOKEN_COOKIE_OPTIONS,
        );

        res.status(204).send();

    } catch (error) {

        next(error);

    }
}
