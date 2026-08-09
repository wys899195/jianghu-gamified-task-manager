import type { TApiErrorCode } from './ApiErrorCode.js';

export class ApiError extends Error {
  constructor(
    // HTTP 狀態碼，用於決定 API Response 的 HTTP status，例如 400、401、404、409。
    public readonly statusCode: number,

    // 應用程式錯誤代碼，提供前端或其他程式if else判斷具體錯誤類型，例如 EMAIL_ALREADY_EXISTS。
    public readonly code: TApiErrorCode,

    // 人類可閱讀的錯誤訊息，通常用於 API Response 顯示給使用者。
    message: string,
  ) {
    super(message);

    this.name = 'ApiError';
  }
}