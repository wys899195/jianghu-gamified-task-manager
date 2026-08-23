import {
    describe,
    expect,
    test,
} from '@jest/globals';

import {
    generateRefreshToken,
    hashRefreshToken,
} from '../../../../src/infrastructure/security/RefreshTokenService.js';


describe('RefreshTokenService', () => {

    test('generateRefreshToken creates a 64-character hex token', () => {

        const token = generateRefreshToken();

        expect(token).toMatch(/^[a-f0-9]{64}$/);
    });


    test('hashRefreshToken creates a deterministic SHA-256 hash', () => {

        const refreshToken = 'refresh-token';

        const firstHash = hashRefreshToken(refreshToken);
        const secondHash = hashRefreshToken(refreshToken);

        expect(firstHash).toBe(secondHash);
        expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
        expect(firstHash).not.toBe(refreshToken);
    });
});
