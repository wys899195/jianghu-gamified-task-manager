// ========================================
// 負責 Refresh Token 的產生與雜湊，
// 不處理 Access Token、帳號驗證與 Session 管理。
// ========================================

import {
    randomBytes,
    createHash,
} from 'node:crypto';


// ========================================
// Refresh Token Config
// ========================================

/**
 * Refresh Token 的隨機位元組長度。
 *
 * 32 bytes = 256 bits。
 *
 * 產生後會轉換為 hexadecimal string，
 * 因此最終 Token 長度為 64 個字元。
 */
const REFRESH_TOKEN_BYTE_LENGTH = 32;


// ========================================
// Generate Refresh Token
// ========================================

/**
 * 產生新的 Refresh Token。
 *
 * Refresh Token 不使用 JWT，
 * 而是使用 cryptographically secure random bytes
 * 產生不可預測的隨機 Token。
 *
 * 此 function 只負責產生 Token，
 * 不負責：
 *
 * - Session 建立
 * - Token 儲存
 * - Token 驗證
 * - Cookie 管理
 */
export function generateRefreshToken(): string {

    return randomBytes(
        REFRESH_TOKEN_BYTE_LENGTH,
    ).toString('hex');
}


// ========================================
// Hash Refresh Token
// ========================================

/**
 * 將 Refresh Token 轉換為 SHA-256 Hash。
 *
 * 原始 Refresh Token：
 *
 * - 只存在於 Client 的 HttpOnly Cookie
 * - Server 在產生 Token 時取得
 * - 不應直接儲存在 Database
 *
 * Database 只儲存 Hash。
 *
 * 此 function 不負責：
 *
 * - Session 查詢
 * - Token 是否有效的判斷
 * - Token Rotation
 */
export function hashRefreshToken(
    refreshToken: string,
): string {

    return createHash('sha256')
        .update(refreshToken)
        .digest('hex');
}