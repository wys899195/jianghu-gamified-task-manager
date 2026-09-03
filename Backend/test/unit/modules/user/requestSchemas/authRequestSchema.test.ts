import {
    describe,
    expect,
    test,
} from '@jest/globals';

import {
    loginRequestSchema,
    registerRequestSchema,
} from '../../../../../src/modules/user/requestSchemas/AuthRequestSchema.js';


const validEmail = 'user@example.com';
const validPassword = 'Test12345';


describe('AuthRequestSchema', () => {

    /*
        測試目標：確認 Login 與 Register 使用相同的密碼強度規則。
        預期結果：有效密碼皆通過，過短或缺少英數組合的密碼皆被拒絕。
    */
    test('applies the same password rules to login and register', () => {

        // Arrange：準備兩個 Schema 都必須拒絕的密碼。
        const invalidPasswords = [
            'Test123',
            'OnlyLetters',
            '12345678',
        ];

        // Act：分別以 Login 與 Register Schema 解析有效與無效密碼。
        const validLoginResult = loginRequestSchema.safeParse({
            email: validEmail,
            password: validPassword,
        });

        const validRegisterResult = registerRequestSchema.safeParse({
            email: validEmail,
            password: validPassword,
        });

        const invalidResults = invalidPasswords.map(
            (password) => ({
                login: loginRequestSchema.safeParse({
                    email: validEmail,
                    password,
                }),
                register: registerRequestSchema.safeParse({
                    email: validEmail,
                    password,
                }),
            }),
        );

        // Assert：兩個 Schema 對相同密碼採用相同結果。
        expect(validLoginResult.success).toBe(true);
        expect(validRegisterResult.success).toBe(true);

        for (const result of invalidResults) {
            expect(result.login.success).toBe(false);
            expect(result.register.success).toBe(false);
        }
    });

    /*
        測試目標：確認 nickname 的 30 字元邊界。
        預期結果：30 字元通過，31 字元被拒絕。
    */
    test('accepts a 30-character nickname and rejects 31 characters', () => {

        // Arrange：準備除 nickname 外皆合法的註冊資料。
        const baseRequest = {
            email: validEmail,
            password: validPassword,
        };

        // Act：解析剛好 30 字元與超過上限的 nickname。
        const maximumLengthResult = registerRequestSchema.safeParse({
            ...baseRequest,
            nickname: 'a'.repeat(30),
        });

        const overLengthResult = registerRequestSchema.safeParse({
            ...baseRequest,
            nickname: 'a'.repeat(31),
        });

        // Assert：30 字元是有效上限，31 字元必須被拒絕。
        expect(maximumLengthResult.success).toBe(true);
        expect(overLengthResult.success).toBe(false);
    });
});
