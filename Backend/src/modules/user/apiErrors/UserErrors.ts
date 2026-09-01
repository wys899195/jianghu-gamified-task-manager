// ========================================
// 定義 User module 可預期的錯誤代碼與
// 對外 API Error Response。
// ========================================

export const UserErrorCode = {
    USER_EMAIL_ALREADY_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
    USER_INVALID_CREDENTIALS: 'USER_INVALID_CREDENTIALS',
    USER_INVALID_ACCESS_TOKEN: 'USER_INVALID_ACCESS_TOKEN',
    USER_INVALID_REFRESH_TOKEN: 'USER_INVALID_REFRESH_TOKEN',
    USER_ACCOUNT_NOT_FOUND: 'USER_ACCOUNT_NOT_FOUND',
} as const;

export type TUserErrorCode =
    typeof UserErrorCode[
    keyof typeof UserErrorCode
    ];

export const userErrorResponseMap:
    Record<
        TUserErrorCode,
        {
            statusCode: number;
            message: string;
        }
    > = {
    [UserErrorCode.USER_EMAIL_ALREADY_EXISTS]: {
        statusCode: 409,
        message: 'Email already exists.',
    },
    [UserErrorCode.USER_INVALID_CREDENTIALS]: {
        statusCode: 401,
        message: 'Invalid email or password.',
    },
    [UserErrorCode.USER_INVALID_ACCESS_TOKEN]: {
        statusCode: 401,
        message: 'Authentication required.',
    },
    [UserErrorCode.USER_INVALID_REFRESH_TOKEN]: {
        statusCode: 401,
        message: 'Authentication required.',
    },
    [UserErrorCode.USER_ACCOUNT_NOT_FOUND]: {
        statusCode: 404,
        message: 'Account not found.',
    },
};
