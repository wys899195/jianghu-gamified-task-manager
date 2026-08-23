import {
    afterEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals';

import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import {
    ZodError,
} from 'zod';

import {
    ServiceError,
} from '../../../../src/shared/errors/ServiceError.js';

import {
    createApiErrorHandler,
} from '../../../../src/shared/middleware/ApiErrorHandler.js';


// 已映射 ServiceError 使用的測試 error code。
const mappedErrorCode = 'TEST_MAPPED_ERROR';

// 已映射 ServiceError 預期回傳的 HTTP status。
const mappedErrorStatus = 409;

// 建立可驗證 status 與 json 呼叫的最小 Express Response。
const createResponse = (): {
    response: Response;
    statusMock: jest.Mock<(statusCode: number) => Response>;
    jsonMock: jest.Mock<(body: unknown) => Response>;
} => {

    // 提供 status 與 json chain 所需的 Response 實例。
    const response = {} as Response;

    // 記錄 Error Handler 設定的 HTTP status。
    const statusMock =
        jest.fn<(statusCode: number) => Response>();

    // 記錄 Error Handler 回傳的 JSON body。
    const jsonMock =
        jest.fn<(body: unknown) => Response>();

    statusMock.mockReturnValue(response);
    jsonMock.mockReturnValue(response);

    response.status = statusMock;
    response.json = jsonMock;

    return {
        response,
        statusMock,
        jsonMock,
    };
};


// 目標函式：ApiErrorHandler.createApiErrorHandler
describe('ApiErrorHandler.createApiErrorHandler', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /*
        測試目標：確認 Zod 驗證錯誤會轉成統一的 400 回應。
        預期結果：回傳固定 validation message 與 Zod issues。
    */
    test('returns a validation response for a ZodError', () => {

        // 建立供 Error Handler 查詢的空 error code map。
        const errorHandler = createApiErrorHandler({});

        // 建立 Zod validation error。
        const validationError = new ZodError([]);

        // 建立可驗證的 Response mock。
        const {
            response,
            statusMock,
            jsonMock,
        } = createResponse();

        errorHandler(
            validationError,
            {} as Request,
            response,
            jest.fn<NextFunction>(),
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'Request validation failed.',
            errors: validationError.issues,
        });
    });

    /*
        測試目標：確認已映射的 ServiceError 使用指定 HTTP status。
        預期結果：回傳 map 中的 status 與 ServiceError message。
    */
    test('returns the mapped response for a ServiceError', () => {

        // 建立已知 ServiceError code 的 HTTP status map。
        const errorHandler = createApiErrorHandler({
            [mappedErrorCode]: mappedErrorStatus,
        });

        // 建立已映射的預期錯誤。
        const serviceError = new ServiceError(
            mappedErrorCode,
            'Mapped service error.',
        );

        // 建立可驗證的 Response mock。
        const {
            response,
            statusMock,
            jsonMock,
        } = createResponse();

        errorHandler(
            serviceError,
            {} as Request,
            response,
            jest.fn<NextFunction>(),
        );

        expect(statusMock).toHaveBeenCalledWith(
            mappedErrorStatus,
        );
        expect(jsonMock).toHaveBeenCalledWith({
            message: serviceError.message,
        });
    });

    /*
        測試目標：確認未映射的 ServiceError 不會洩漏其內容。
        預期結果：回傳 500 與固定的 Internal server error. message。
    */
    test('returns a generic response for an unmapped ServiceError', () => {

        // 關閉預期 500 分支的 console.error 輸出。
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        // 建立不含該 ServiceError code 的 HTTP status map。
        const errorHandler = createApiErrorHandler({});

        // 建立未映射的 ServiceError。
        const serviceError = new ServiceError(
            'TEST_UNMAPPED_ERROR',
            'Sensitive internal error.',
        );

        // 建立可驗證的 Response mock。
        const {
            response,
            statusMock,
            jsonMock,
        } = createResponse();

        errorHandler(
            serviceError,
            {} as Request,
            response,
            jest.fn<NextFunction>(),
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'Internal server error.',
        });
    });

    /*
        測試目標：確認非預期錯誤不會洩漏內部內容。
        預期結果：回傳 500 與固定的 Internal server error. message。
    */
    test('returns a generic response for an unexpected error', () => {

        // 關閉預期 500 分支的 console.error 輸出。
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        // 建立供 Error Handler 查詢的空 error code map。
        const errorHandler = createApiErrorHandler({});

        // 建立不應回傳給 Client 的內部錯誤。
        const unexpectedError = new Error('Database connection failed.');

        // 建立可驗證的 Response mock。
        const {
            response,
            statusMock,
            jsonMock,
        } = createResponse();

        errorHandler(
            unexpectedError,
            {} as Request,
            response,
            jest.fn<NextFunction>(),
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'Internal server error.',
        });
    });
});
