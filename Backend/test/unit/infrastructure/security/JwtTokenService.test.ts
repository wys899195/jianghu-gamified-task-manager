import {
    describe,
    expect,
    test,
} from '@jest/globals';

import jwt from 'jsonwebtoken';

import {
    authConfig,
} from '../../../../src/config/AuthConfig.js';

import {
    createAccessToken,
    JwtTokenError,
    verifyAccessToken,
} from '../../../../src/infrastructure/security/JwtTokenService.js';


// 建立與驗證 Token 時使用的帳號 ID。
const validAccountId = 123;

// 用於產生簽章無效 Token 的不同 secret。
const invalidJwtSecret =
    'another-test-secret-that-does-not-match-the-configured-secret';


// 目標模組：JwtTokenService
describe('JwtTokenService', () => {

    /*
        測試目標：確認建立的 Access Token 可被同一服務驗證。
        預期結果：驗證後取得原始 accountId。
    */
    test('creates an access token with the account id payload', () => {

        // 產生要驗證的 Access Token。
        const token = createAccessToken(validAccountId);

        expect(verifyAccessToken(token)).toEqual({
            accountId: validAccountId,
        });
    });

    /*
        測試目標：確認簽章不正確的 Token 被視為無效。
        預期結果：verifyAccessToken 拋出 JwtTokenError。
    */
    test('rejects a token signed with a different secret', () => {

        // 使用不同 secret 產生簽章無效的 Token。
        const tokenWithInvalidSignature = jwt.sign(
            {
                accountId: validAccountId,
            },
            invalidJwtSecret,
            {
                algorithm: authConfig.jwtAlgorithm,
                expiresIn: authConfig.accessTokenExpiresIn,
            },
        );

        expect(() => {
            verifyAccessToken(tokenWithInvalidSignature);
        }).toThrow(JwtTokenError);
    });

    /*
        測試目標：確認已過期的 Token 被視為無效。
        預期結果：verifyAccessToken 拋出 JwtTokenError。
    */
    test('rejects an expired token', () => {

        // 產生已在目前時間之前過期的 Token。
        const expiredToken = jwt.sign(
            {
                accountId: validAccountId,
            },
            authConfig.jwtSecret,
            {
                algorithm: authConfig.jwtAlgorithm,
                expiresIn: -1,
            },
        );

        expect(() => {
            verifyAccessToken(expiredToken);
        }).toThrow(JwtTokenError);
    });

    /*
        測試目標：確認缺少數字 accountId 的 Token payload 被拒絕。
        預期結果：verifyAccessToken 拋出 JwtTokenError。
    */
    test('rejects a token with an invalid payload', () => {

        // 產生簽章正確但 payload 不符合服務契約的 Token。
        const tokenWithInvalidPayload = jwt.sign(
            {
                accountId: '123',
            },
            authConfig.jwtSecret,
            {
                algorithm: authConfig.jwtAlgorithm,
                expiresIn: authConfig.accessTokenExpiresIn,
            },
        );

        expect(() => {
            verifyAccessToken(tokenWithInvalidPayload);
        }).toThrow(JwtTokenError);
    });
});
