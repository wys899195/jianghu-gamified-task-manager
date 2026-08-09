// ========================================
// Backend API Error Codes
// ========================================

export const ApiErrorCode = {
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS', // 註冊時 Email 已存在
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', // 如：帳號密碼錯誤
    INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN', // 如：無效的存取權杖
    ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND', // 帳號不存在
} as const;

export type TApiErrorCode =
    typeof ApiErrorCode[
        keyof typeof ApiErrorCode
    ];