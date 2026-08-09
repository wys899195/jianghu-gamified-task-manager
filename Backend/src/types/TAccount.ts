/**
 * 登入驗證所需要的帳號資料。
 */
export type AccountAuth = {
  id: number;
  email: string;
  passwordHash: string; // 只存在 Backend，不回傳給Frontend
  nickname: string;
  avatarUrl: string | null;
};



/**
 * 顯示使用者個人資料所需要的欄位。
 */
export type AccountProfile = {
  email: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: Date;
};