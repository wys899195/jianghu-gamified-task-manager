import {
    describe,
    expect,
    test,
} from '@jest/globals';

import {
    deleteAccountRequestSchema,
} from '../../../../../src/modules/user/requestSchemas/accountRequestSchema.js';


describe('AccountRequestSchema', () => {

    /*
        測試目標：確認刪除帳號接受包含目前密碼的 Request body。
        預期結果：non-empty string password 通過驗證。
    */
    test('accepts a non-empty password', () => {

        // Arrange：準備符合契約的 Request body。
        const request = {
            password: 'Current123',
        };

        // Act：解析刪除帳號 Request body。
        const result =
            deleteAccountRequestSchema.safeParse(
                request,
            );

        // Assert：確認輸入通過驗證。
        expect(result.success).toBe(true);
    });

    /*
        測試目標：確認刪除帳號拒絕缺少或空白的 password。
        預期結果：缺少欄位或空字串時驗證失敗。
    */
    test('rejects a missing or empty password', () => {

        // Arrange：準備兩種不符合契約的 Request body。
        const invalidRequests = [
            {},
            {
                password: '',
            },
        ];

        // Act：解析所有無效 Request body。
        const results = invalidRequests.map(
            (request) =>
                deleteAccountRequestSchema.safeParse(
                    request,
                ),
        );

        // Assert：確認每種無效輸入都被拒絕。
        for (const result of results) {
            expect(result.success).toBe(false);
        }
    });
});
