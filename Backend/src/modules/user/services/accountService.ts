// ========================================
// 負責使用者帳號生命週期的業務流程。
// ========================================

import bcrypt from 'bcrypt';

import {
    deleteAccount as deleteAccountById,
    findPasswordHashById,
} from '../repositories/AccountRepository.js';

import {
    ServiceError,
} from '../../../shared/errors/ServiceError.js';

import {
    UserErrorCode,
} from '../apiErrors/UserErrors.js';

import type {
    DeleteAccountRequest,
} from '../requestSchemas/accountRequestSchema.js';


/**
 * 驗證目前密碼後永久刪除帳號。
 *
 * 流程：
 *
 * 1. 取得帳號目前的密碼 Hash
 * 2. 驗證使用者提供的目前密碼
 * 3. 永久刪除帳號
 *
 * `auth_sessions` 由 Database foreign key cascade 一併刪除。
 */
export async function deleteAccount(
    accountId: number,
    request: DeleteAccountRequest,
): Promise<void> {

    const passwordHash =
        await findPasswordHashById(
            accountId,
        );


    if (passwordHash === null) {

        throw new ServiceError(
            UserErrorCode.USER_ACCOUNT_NOT_FOUND,
        );

    }


    const isPasswordValid =
        await bcrypt.compare(
            request.password,
            passwordHash,
        );


    if (!isPasswordValid) {

        throw new ServiceError(
            UserErrorCode.USER_INVALID_PASSWORD,
        );

    }


    const isDeleted =
        await deleteAccountById(
            accountId,
        );


    if (!isDeleted) {

        throw new ServiceError(
            UserErrorCode.USER_ACCOUNT_NOT_FOUND,
        );

    }
}
