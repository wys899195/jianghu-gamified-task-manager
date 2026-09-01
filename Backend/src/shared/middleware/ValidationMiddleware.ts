// ========================================
// 負責以指定的 Zod schema 驗證 Request Body，
// 並將驗證與轉換後的資料交給後續 Controller 使用。
// ========================================

import type { RequestHandler } from 'express';

import type { ZodType } from 'zod';


export function validateRequestBody(
    schema: ZodType,
): RequestHandler {
    return (req, _res, next): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            next(result.error);
            return;
        }

        // 使用 schema 的輸出結果，確保 Controller 不會再讀取未驗證的原始資料。
        req.body = result.data;
        next();
    };
}
