import {
    describe,
    expect,
    test,
} from '@jest/globals';

import {
    generateRefreshToken,
    hashRefreshToken,
} from '../../../../src/infrastructure/security/RefreshTokenService.js';

import {
    refreshTokenHexPattern,
    refreshTokenInput,
    refreshTokenLength,
} from './RefreshTokenServiceMockData.js';


// 目標函式：RefreshTokenService.generateRefreshToken、hashRefreshToken
describe('RefreshTokenService', () => {
    /*
        測試目標：確認產生的 Refresh Token 具備預期格式與長度。
        預期結果：回傳 64 個十六進位字元的字串。
    */
    test('generateRefreshToken creates a 64-character hex token', () => {

        // 儲存產生的新 Refresh Token。
        const token = generateRefreshToken();

        expect(token).toHaveLength(refreshTokenLength);
        expect(token).toMatch(refreshTokenHexPattern);
    });

    /*
        測試目標：確認相同 Refresh Token 會產生穩定且不可直接還原的 hash。
        預期結果：兩次 hash 相同、符合十六進位格式，且不等於原始 Token。
    */
    test('hashRefreshToken creates a deterministic SHA-256 hash', () => {

        // 使用相同輸入計算兩次 hash，以驗證結果一致。
        const firstHash = hashRefreshToken(refreshTokenInput);
        const secondHash = hashRefreshToken(refreshTokenInput);

        expect(firstHash).toBe(secondHash);
        expect(firstHash).toMatch(refreshTokenHexPattern);
        expect(firstHash).not.toBe(refreshTokenInput);
    });
});
