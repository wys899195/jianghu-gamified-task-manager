// ========================================
// 負責「已登入使用者」的帳號操作
// 包含修改密碼、暱稱、頭像、註銷帳號等。
// ========================================
import bcrypt from 'bcrypt';

import {
    findAuthByEmail,
    createAccount,
    updateLastLogin,
    existsByEmail,
} from '../repositories/AccountRepository.js';

import {
    createSession,
    deleteSessionByJti,
} from '../repositories/AuthSessionRepository.js';

import {
    generateJti,
    createAccessToken,
} from '../../../infrastructure/security/JwtTokenService.js';

import { passwordConfig } from '../../../config/PasswordConfig.js';
import { ApiError } from '../../../errors/ApiError.js';
import { ApiErrorCode } from '../../../errors/ApiErrorCode.js';

/**
 * 註冊新帳號。
 *
 * 流程：
 * 1. 檢查 Email 是否已存在
 * 2. 使用 bcrypt hash 密碼
 * 3. 建立帳號
 */
export async function register(
    email: string,
    password: string,
    nickname: string,
): Promise<number> {

    const emailExists =
        await existsByEmail(email);


    if (emailExists) {
        throw new ApiError(
            409,
            ApiErrorCode.EMAIL_ALREADY_EXISTS,
            'Email already exists.',
        );
    }


    const passwordHash =
        await bcrypt.hash(
            password,
            passwordConfig.bcryptSaltRounds,
        );


    const accountId =
        await createAccount(
            email,
            passwordHash,
            nickname,
        );


    return accountId;
}


/**
 * 登入。
 *
 * 流程：
 *
 * 1. 使用 Email 查詢登入資料
 * 2. 驗證密碼
 * 3. 建立 Session
 * 4. 建立 JWT Token
 * 5. 更新最後登入時間
 */
export async function login(
    email: string,
    password: string,
): Promise<string> {


    const account =
        await findAuthByEmail(email);

    // 帳號不存在
    if (!account) {
        throw new ApiError(
            401,
            ApiErrorCode.INVALID_CREDENTIALS,
            'Invalid email or password.',
        );
    }


    const isPasswordValid =
        await bcrypt.compare(
            password,
            account.passwordHash,
        );

    // 密碼錯誤
    if (!isPasswordValid) {
        throw new ApiError(
            401,
            ApiErrorCode.INVALID_CREDENTIALS,
            'Invalid email or password.',
        );
    }


    // 每次登入建立新的 Session
    const jti =
        generateJti();


    await createSession(
        account.id,
        jti,
    );


    // 建立 JWT Token
    const token =
        createAccessToken(
            account.id,
            jti,
        );


    await updateLastLogin(
        account.id,
    );


    return token;
}


/**
 * 登出目前 Session。
 *
 * 存在前端的Token本身不會被刪除，
 * 但是一登出就會失效(即移除 auth_sessions 資料庫中對應的 jti)，
 * 需要重新登入取得新的有效Token
 * 
 */
export async function logout(
    jti: string,
): Promise<boolean> {

    return deleteSessionByJti(
        jti,
    );
}