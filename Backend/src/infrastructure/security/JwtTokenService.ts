// ========================================
// 負責 JWT Token 的產生與驗證，不處理帳號驗證與 Session 管理。
// ========================================
import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { jwtConfig } from '../../config/JwtConfig.js';


/**
 * JWT 驗證成功後所需要的 Payload (即Token的資料區塊)。
 */
export type AccessTokenPayload = {
    accountId: number;
    jti: string;
};


/**
 * 產生 JWT 唯一識別碼 jti。
 *
 * 每次登入都產生新的 jti，
 * 用來對應 auth_sessions 中的一筆登入 Session。
 */
export function generateJti(): string {
    return randomUUID();
}


/**
 * 建立登入用 JWT。
 *
 * Token 包含：
 *
 * - accountId：登入帳號 ID
 * - jti：此 Token 對應的 Session 唯一識別碼
 *
 * 目前依照系統需求不設定token過期機制（目前只有登出才會讓token失效），
 * Token 是否有效由 auth_sessions 控制。
 */
export function createAccessToken(
    accountId: number,
    jti: string,
): string {
    return jwt.sign(
        {
            accountId,
        },
        jwtConfig.secret,
        {
            jwtid: jti,
            algorithm: jwtConfig.algorithm,
        },
    );
}


/**
 * 驗證 JWT 並取得登入資訊。
 *
 * 此 function 只負責：
 *
 * - 驗證 JWT 簽章
 * - 驗證 Payload 格式
 *
 * 不負責確認 auth_sessions 中的 Session 是否存在。
 */
export function verifyAccessToken(
    token: string,
): AccessTokenPayload {

    // 驗證 JWT 簽章並解析 Payload
    // (token包含Header、Payload、Signature三個部分)
    const  payload = jwt.verify(
        token,
        jwtConfig.secret,
        {
            algorithms: [
                jwtConfig.algorithm,
            ],
        },
    );

    // 確認 Payload 是否包含必要欄位
    if (
        typeof  payload === 'string' ||
        typeof  payload.accountId !== 'number' ||
        typeof  payload.jti !== 'string'
    ) {
        throw new Error(
            'Invalid access token payload.',
        );
    }

    // 回傳驗證後的登入資訊
    return {
        accountId:  payload.accountId,
        jti:  payload.jti,
    };
}