// ========================================
// 統一處理 API 執行過程中的錯誤，將 ServiceError 轉換為 HTTP Response，並處理未預期的伺服器錯誤。
// ========================================
import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { ServiceError } from '../errors/ServiceError.js';

type ErrorHttpStatusMap =
  Record<string, number>;


export function createApiErrorHandler(
  errorHttpStatusMap: ErrorHttpStatusMap,
) {

  return function apiErrorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {

    // 預期錯誤 ServiceError
    if (error instanceof ServiceError) {

      const statusCode =
        errorHttpStatusMap[error.code];

      if (statusCode !== undefined) {

        res.status(statusCode).json({
          message: error.message,
        });

        return;
      }
    }


    // 非預期錯誤
    console.error(error);

    res.status(500).json({
      message: 'Internal server error.',
    });
  };
}