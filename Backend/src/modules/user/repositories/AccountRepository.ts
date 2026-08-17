// ========================================
// 負責使用者帳號相關的資料庫存取，包含帳號認證、密碼、個人檔案與帳號註銷等操作。
// ========================================
import type {
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';

import {
  backendMysqlPool,
} from '../../../infrastructure/database/MysqlConnector.js';


import type {
    AccountAuth,
    AccountProfile,
} from '../types/TAccount.js';



type AccountAuthRow =
    AccountAuth & RowDataPacket;

type AccountProfileRow =
    AccountProfile & RowDataPacket;

type ExistsByEmailRow =
    RowDataPacket & {
        exists: string | number;
    };

type PasswordHashRow =
    RowDataPacket & {
        passwordHash: string;
    };

type AvatarUrlRow =
    RowDataPacket & {
        avatarUrl: string | null;
    };

/**
 * 使用者認證、登入相關。
 */
// 使用 Email 尋找登入驗證資料。
export async function findAuthByEmail(
    email: string,
): Promise<AccountAuth | null> {
    const [rows] =
        await backendMysqlPool.query<AccountAuthRow[]>(
            `
            SELECT
                id,
                email,
                password_hash AS passwordHash,
                nickname,
            avatar_url AS avatarUrl
            FROM accounts
            WHERE email = ?
            `,
            [email],
        );

    return rows[0] ?? null;
}

// 建立帳號。
export async function createAccount(
    email: string,
    passwordHash: string,
    nickname: string, 
): Promise<number> {
    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
            INSERT INTO accounts (
                email,
                password_hash,
                nickname
            )
            VALUES (?, ?, ?)
            `,
            [
                email,
                passwordHash,
                nickname,
            ],
        );

    return result.insertId;
}

// 更新最後登入時間。
export async function updateLastLogin(
    accountId: number,
): Promise<void> {
    await backendMysqlPool.execute(
        `
        UPDATE accounts
        SET last_login_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
        `,
        [accountId],
    );
}

// 確認 Email 是否已存在。
export async function existsByEmail(
    email: string,
): Promise<boolean> {
    const [rows] =
        await backendMysqlPool.query<ExistsByEmailRow[]>(
            `
        SELECT EXISTS(
          SELECT 1
          FROM accounts
          WHERE email = ?
        ) AS \`exists\`
      `,
            [email],
        );

    return Number(rows[0]?.exists) === 1;
}



/**
 * 密碼相關。
 */
// 使用 accountId 取得密碼 Hash。
export async function findPasswordHashById(
    accountId: number,
): Promise<string | null> {
    const [rows] =
        await backendMysqlPool.query<PasswordHashRow[]>(
            `
        SELECT
          password_hash AS passwordHash
        FROM accounts
        WHERE id = ?
      `,
            [accountId],
        );

    return rows[0]?.passwordHash ?? null;
}

// 更改密碼。
export async function updatePassword(
    accountId: number,
    passwordHash: string,
): Promise<void> {
    await backendMysqlPool.execute(
        `
        UPDATE accounts
        SET
            password_hash = ?,
            password_updated_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
    `,
        [
            passwordHash,
            accountId,
        ],
    );
}



/**
 * 個人檔案相關。
 */
// 使用 accountId 取得公開的帳號資料。
export async function findProfileById(
    accountId: number,
): Promise<AccountProfile | null> {
    const [rows] =
        await backendMysqlPool.query<AccountProfileRow[]>(
            `
            SELECT
                id,
                email,
                nickname,
                avatar_url AS avatarUrl,
                created_at AS createdAt
            FROM accounts
            WHERE id = ?
            `,
            [accountId],
        );

    return rows[0] ?? null;
}

// 更改暱稱。
export async function updateNickname(
    accountId: number,
    nickname: string,
): Promise<void> {
    await backendMysqlPool.execute(
        `
        UPDATE accounts
        SET nickname = ?
        WHERE id = ?
    `,
        [
            nickname,
            accountId,
        ],
    );
}

// 使用 accountId 取得頭像 URL。
export async function findAvatarUrlById(
    accountId: number,
): Promise<string | null> {
    const [rows] =
        await backendMysqlPool.query<AvatarUrlRow[]>(
            `
        SELECT
          avatar_url AS avatarUrl
        FROM accounts
        WHERE id = ?
      `,
            [accountId],
        );

    return rows[0]?.avatarUrl ?? null;
}

// 更改頭像。
export async function updateAvatarUrl(
    accountId: number,
    avatarUrl: string | null,
): Promise<void> {
    await backendMysqlPool.execute(
        `
        UPDATE accounts
        SET avatar_url = ?
        WHERE id = ?
    `,
        [
            avatarUrl,
            accountId,
        ],
    );
}



/**
 * 註銷帳號相關。
 */
// 刪除帳號
export async function deleteAccount(
    accountId: number,
): Promise<boolean> {
    const [result] =
        await backendMysqlPool.execute<ResultSetHeader>(
            `
        DELETE FROM accounts
        WHERE id = ?
      `,
            [accountId],
        );

    // 成功刪除回傳 true，找不到該帳號則回傳 false。
    return result.affectedRows === 1;
}