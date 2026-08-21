// ========================================
// 定義 User Service 可預期的錯誤代碼，供 Service 層判斷錯誤類型。
// ========================================
export const UserErrorCode = {
    USER_EMAIL_ALREADY_EXISTS: 'USER_EMAIL_ALREADY_EXISTS', // 註冊時 Email 已存在
    USER_INVALID_CREDENTIALS: 'USER_INVALID_CREDENTIALS', // 如：帳號密碼錯誤
    USER_INVALID_ACCESS_TOKEN: 'USER_INVALID_ACCESS_TOKEN', // Access Token 無效、過期或驗證失敗
    USER_INVALID_REFRESH_TOKEN: 'USER_INVALID_REFRESH_TOKEN', // Refresh Token 無效、過期、已撤銷或驗證失敗
    USER_ACCOUNT_NOT_FOUND: 'USER_ACCOUNT_NOT_FOUND', // 帳號不存在
} as const;

export type TUserErrorCode =
    typeof UserErrorCode[
    keyof typeof UserErrorCode
    ];