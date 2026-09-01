// ========================================
// 定義服務層可預期的錯誤，提供錯誤代碼供後續 ApiErrorHandler 處理。
// ========================================
export class ServiceError extends Error {
  constructor(
    // 供後端判斷錯誤類型、Logger 分類與決定 API response。
    public readonly code: string,
  ) {
    super(code);

    this.name = 'ServiceError';
  }
}
