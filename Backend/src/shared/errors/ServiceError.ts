// ========================================
// 定義服務層可預期的錯誤，提供錯誤代碼與錯誤訊息供後續 ApiErrorHandler 處理。
// ========================================
export class ServiceError extends Error {
  constructor(
    // 供後端判斷錯誤類型，以及決定 HTTP status code。
    public readonly code: string,

    // API 回傳給前端的訊息。
    message: string,
  ) {
    super(message);

    this.name = 'ServiceError';
  }
}