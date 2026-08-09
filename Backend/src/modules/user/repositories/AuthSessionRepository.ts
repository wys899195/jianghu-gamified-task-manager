import type {
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';

import {
    backendMysqlPool,
} from '../../../infrastructure/database/MysqlConnector.js';


type SessionExistsRow =
    RowDataPacket & {
        exists: number;
    };


// 建立新的登入 Session。
export async function createSession(
    accountId: number,
    jti: string,
): Promise<number> {
    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
        `
            INSERT INTO auth_sessions (
                account_id,
                jti
            )
            VALUES (?, ?)
        `,
            [
                accountId,
                jti,
            ],
        );

    return result.insertId;
}


/**
 * 確認指定 jti 的 Session 是否存在。
 *
 * 用於 JWT 驗證後確認該 Token
 * 是否仍為有效的登入 Session。
 */
export async function existsByJti(
    jti: string,
): Promise<boolean> {
    const [rows] =
        await backendMysqlPool.query<SessionExistsRow[]>(
            `
            SELECT EXISTS(
                SELECT 1
                FROM auth_sessions
                WHERE jti = ?
            ) AS \`exists\`
            `,
            [jti],
        );

    return rows[0]?.exists === 1;
}


/**
 * 刪除指定 jti 的登入 Session。
 *
 * 通常用於單一裝置登出。
 *
 * @returns
 * true  - 成功刪除 Session
 * false - 找不到該 Session
 */
export async function deleteSessionByJti(
    jti: string,
): Promise<boolean> {
    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            DELETE FROM auth_sessions
            WHERE jti = ?
            `,
            [jti],
        );

    return result.affectedRows === 1;
}


/**
 * 刪除指定帳號的所有登入 Session。
 *
 * 可用於：
 * - 登出所有裝置
 * - 修改密碼後強制重新登入
 *
 * @returns 被刪除的 Session 數量。
 */
export async function deleteSessionsByAccountId(
    accountId: number,
): Promise<number> {
    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            DELETE FROM auth_sessions
            WHERE account_id = ?
            `,
            [accountId],
        );

    return result.affectedRows;
}