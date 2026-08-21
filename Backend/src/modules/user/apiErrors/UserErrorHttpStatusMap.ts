// ========================================
// 負責定義 User Service 可預期錯誤代碼與 HTTP Status Code 的對應關係。
// ========================================
import {
  UserErrorCode,
  type TUserErrorCode,
} from './UserErrorCode.js';

export const userErrorHttpStatusMap:
    Record<TUserErrorCode, number> = {
    [UserErrorCode.USER_EMAIL_ALREADY_EXISTS]: 409,
    [UserErrorCode.USER_INVALID_CREDENTIALS]: 401,
    [UserErrorCode.USER_INVALID_ACCESS_TOKEN]: 401,
    [UserErrorCode.USER_INVALID_REFRESH_TOKEN]: 401,
    [UserErrorCode.USER_ACCOUNT_NOT_FOUND]: 404,

};