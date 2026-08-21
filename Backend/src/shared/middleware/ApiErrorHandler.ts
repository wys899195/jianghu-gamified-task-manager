// ========================================
// 統一處理 API 執行過程中的錯誤，將 ServiceError 轉換為 HTTP Response，並處理未預期的伺服器錯誤。
// ========================================
import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import { ServiceError } from '../errors/ServiceError.js';

import {
  ZodError,
} from 'zod';

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

    // Request Body 驗證失敗。
    if (error instanceof ZodError) {

      res.status(400).json({
        message: 'Request validation failed.',
        errors: error.issues,
      });

      return;
    }

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
