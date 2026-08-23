// hashRefreshToken 使用的測試輸入。
export const refreshTokenInput =
    'refresh-token';

// Refresh Token 與 hash 預期符合的十六進位格式。
export const refreshTokenHexPattern =
    /^[a-f0-9]{64}$/;

// Refresh Token 與 SHA-256 hash 的預期長度。
export const refreshTokenLength = 64;
