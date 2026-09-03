// ========================================
// 定義 Account API 的 Request schema。
// ========================================

import { z } from 'zod';


export const deleteAccountRequestSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required'),
});

export type DeleteAccountRequest = z.infer<
    typeof deleteAccountRequestSchema
>;
