// ========================================
// Backend Environment Variables Configuration
// ========================================

import 'dotenv/config';
import { z } from 'zod';
import type { StringValue } from 'ms';

const runtimeSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
});


// 驗證 Backend HTTP Server 啟動所需要的環境變數
const serverSchema = z.object({
    SERVER_HOST: z.string().trim().min(1, 'SERVER_HOST 不可為空'),
    SERVER_PORT: z.coerce
        .number('SERVER_PORT 必須是數字')
        .int('SERVER_PORT 必須是整數')
        .positive('SERVER_PORT 必須是正整數'),
});


// 驗證 Backend 連接 MySQL 所需要的環境變數。
const databaseSchema = z.object({
    DB_HOST: z.string().trim().min(1, 'DB_HOST 不可為空'),
    DB_PORT: z.coerce
        .number('DB_PORT 必須是數字')
        .int('DB_PORT 必須是整數')
        .positive('DB_PORT 必須是正整數')
        .max(65535, 'DB_PORT 不可大於 65535'),
    DB_NAME: z.string().trim().min(1, 'DB_NAME 不可為空'),
    DB_USER: z.string().trim().min(1, 'DB_USER 不可為空'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD 不可為空'),
});


// 驗證身分驗證機制所需要的環境變數。
const authSchema = z.object({

    JWT_SECRET: z
        .string()
        .length(
            64,
            'JWT_SECRET 必須剛好 64 個字元',
        ),

    ACCESS_TOKEN_EXPIRES_IN: z
        .string()
        .regex(
            /^\d+(s|m|h|d)$/,
            'ACCESS_TOKEN_EXPIRES_IN 格式錯誤，例如：15m、1h、7d',
        )
        .transform(
            (value) => value as StringValue,
        ),
    REFRESH_TOKEN_EXPIRES_IN: z
        .string()
        .regex(
            /^\d+(s|m|h|d)$/,
            'REFRESH_TOKEN_EXPIRES_IN 格式錯誤，例如：15m、1h、7d',
        )
        .transform(
            (value) => value as StringValue,
        ),

});

export const runtimeEnv = runtimeSchema.parse(process.env);
export const serverEnv = serverSchema.parse(process.env);

const rawDatabaseEnv = databaseSchema.parse(process.env);

export const databaseEnv = {
    ...rawDatabaseEnv,
    DB_NAME:
        runtimeEnv.NODE_ENV === 'development'
            ? `${rawDatabaseEnv.DB_NAME}_dev`
            : runtimeEnv.NODE_ENV === 'test'
                ? `${rawDatabaseEnv.DB_NAME}_test`
                : rawDatabaseEnv.DB_NAME,
};

export const authEnv = authSchema.parse(process.env);
