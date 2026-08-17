// ========================================
// 負責使用者登入 Session 相關的資料庫存取，
// 包含 Session 建立、Refresh Session 查詢、
// Session 使用時間更新與撤銷等操作。
// ========================================

import type {
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';

import {
    backendMysqlPool,
} from '../../../infrastructure/database/MysqlConnector.js';


// ========================================
// Session Row
// ========================================

/**
 * Refresh Session 資料。
 *
 * 用於 Refresh Token 驗證成功後，
 * 提供 AuthService 取得 Session 所需資訊。
 */
export type AuthSession = RowDataPacket & {
    id: number;
    accountId: number;
    refreshTokenHash: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    expiresAt: Date;
    revokedAt: Date | null;
};


// ========================================
// Create Session
// ========================================

/**
 * 建立新的 Refresh Session。
 *
 * Database 只儲存 Refresh Token Hash，
 * 不儲存原始 Refresh Token。
 */
export async function createSession(
    accountId: number,
    refreshTokenHash: string,
    expiresAt: Date,
): Promise<number> {

    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            INSERT INTO auth_sessions (
                account_id,
                refresh_token_hash,
                expires_at
            )
            VALUES (?, ?, ?)
            `,
            [
                accountId,
                refreshTokenHash,
                expiresAt,
            ],
        );

    return result.insertId;
}


// ========================================
// Find Active Session
// ========================================

/**
 * 根據 Refresh Token Hash 查詢有效 Session。
 *
 * 只有同時符合以下條件才視為有效：
 *
 * - Refresh Token Hash 存在
 * - Session 尚未被撤銷
 * - Session 尚未過期
 *
 * 找不到有效 Session 時回傳 null。
 */
export async function findActiveSessionByRefreshTokenHash(
    refreshTokenHash: string,
): Promise<AuthSession | null> {

    const [rows] =
        await backendMysqlPool.execute<AuthSession[]>(
            `
            SELECT
                id,
                account_id AS accountId,
                refresh_token_hash AS refreshTokenHash,
                created_at AS createdAt,
                last_used_at AS lastUsedAt,
                expires_at AS expiresAt,
                revoked_at AS revokedAt
            FROM auth_sessions
            WHERE refresh_token_hash = ?
              AND revoked_at IS NULL
              AND expires_at > CURRENT_TIMESTAMP(3)
            LIMIT 1
            `,
            [
                refreshTokenHash,
            ],
        );

    return rows[0] ?? null;
}


// ========================================
// Update Session Last Used Time
// ========================================

/**
 * 更新 Session 最近一次使用 Refresh Token 的時間。
 *
 * V1 只記錄活動時間，
 * 不會因此延長 expires_at。
 */
export async function updateSessionLastUsedAt(
    sessionId: number,
): Promise<void> {

    await backendMysqlPool.execute<ResultSetHeader>(
        `
        UPDATE auth_sessions
        SET last_used_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
          AND revoked_at IS NULL
        `,
        [
            sessionId,
        ],
    );
}


// ========================================
// Revoke Session
// ========================================

/**
 * 撤銷指定登入 Session。
 *
 * 通常用於：
 *
 * - 使用者正常登出
 * - Session 被安全性機制撤銷
 *
 * 已經撤銷的 Session 不會再次更新 revoked_at。
 *
 * @returns
 * true  - 成功撤銷 Session
 * false - 找不到尚未撤銷的 Session
 */
export async function revokeSession(
    sessionId: number,
): Promise<boolean> {

    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            UPDATE auth_sessions
            SET revoked_at = CURRENT_TIMESTAMP(3)
            WHERE id = ?
              AND revoked_at IS NULL
            `,
            [
                sessionId,
            ],
        );

    return result.affectedRows === 1;
}


// ========================================
// Revoke Sessions By Account
// ========================================

/**
 * 撤銷指定帳號的所有登入 Session。
 *
 * 可用於：
 *
 * - 登出所有裝置
 * - 修改密碼後強制重新登入
 * - 安全事件處理
 *
 * @returns
 * 被撤銷的 Session 數量。
 */
export async function revokeSessionsByAccountId(
    accountId: number,
): Promise<number> {

    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            UPDATE auth_sessions
            SET revoked_at = CURRENT_TIMESTAMP(3)
            WHERE account_id = ?
              AND revoked_at IS NULL
            `,
            [
                accountId,
            ],
        );

    return result.affectedRows;
}