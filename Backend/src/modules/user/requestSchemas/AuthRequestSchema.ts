// ========================================
// 定義使用者身份驗證 API 的 Request schema，
// 負責驗證登入與註冊請求的欄位格式。
// ========================================

import { z } from 'zod';

const emailSchema = z
    .string()
    .trim()
    .regex(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        'Invalid email format',
    );

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

const nicknameSchema = z
    .string()
    .trim()
    .min(1, 'Nickname is required')
    .max(30, 'Nickname must be at most 30 characters');

export const loginRequestSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const registerRequestSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    nickname: nicknameSchema.optional(),
});

export type LoginRequest = z.infer<
    typeof loginRequestSchema
>;

export type RegisterRequest = z.infer<
    typeof registerRequestSchema
>;
