import {
    afterEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals';

import type {
    Request,
    Response,
} from 'express';

import {
    z,
    ZodError,
} from 'zod';

import {
    validateRequestBody,
} from '../../../../src/shared/middleware/ValidationMiddleware.js';


// 驗證並 trim name 欄位的測試 schema。
const trimmedNameSchema = z.object({
    name: z.string().trim().min(1),
});

// 建立只包含 body 的最小 Express Request。
const createRequest = (
    body: unknown,
): Request => ({
    body,
} as Request);

// 記錄 middleware 傳遞的成功流程或錯誤。
// 使用單一可選錯誤參數，避免 Express NextFunction 的多載與 Jest Mock 型別衝突。
const nextMock =
    jest.fn<(error?: unknown) => void>();


// 目標函式：ValidationMiddleware.validateRequestBody
describe('ValidationMiddleware.validateRequestBody', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    /*
        測試目標：確認 safeParse 成功時使用解析後的資料。
        預期結果：req.body 被覆寫為轉換結果，並以無錯誤的 next 繼續流程。
    */
    test('replaces the request body with parsed data', () => {

        // 建立包含前後空白的有效 Request Body。
        const request = createRequest({
            name: '  Jianghu  ',
        });

        // 取得使用測試 schema 的 middleware。
        const middleware = validateRequestBody(trimmedNameSchema);

        middleware(
            request,
            {} as Response,
            nextMock,
        );

        expect(request.body).toEqual({
            name: 'Jianghu',
        });
        expect(nextMock).toHaveBeenCalledWith();
    });

    /*
        測試目標：確認 safeParse 失敗時不進入後續 middleware。
        預期結果：next 收到 ZodError，且 req.body 保持原始資料。
    */
    test('forwards validation errors to next', () => {

        // 建立無法通過 trimmedNameSchema 的 Request Body。
        const request = createRequest({
            name: '   ',
        });

        // 取得使用測試 schema 的 middleware。
        const middleware = validateRequestBody(trimmedNameSchema);

        middleware(
            request,
            {} as Response,
            nextMock,
        );

        expect(nextMock).toHaveBeenCalledWith(
            expect.any(ZodError),
        );
        expect(request.body).toEqual({
            name: '   ',
        });
    });
});
