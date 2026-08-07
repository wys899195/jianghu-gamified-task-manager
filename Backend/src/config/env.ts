// ========================================
// Backend Environment Variables Configuration
// ========================================

import 'dotenv/config';
import { z } from 'zod';


const envBoolean = z
    .enum(['true', 'false'])
    .transform((value) => value === 'true');

const serverSchema = z.object({
    SERVER_HOST: z.string().trim().min(1, 'SERVER_HOST 不可為空'),
    SERVER_PORT: z.coerce
        .number('SERVER_PORT 必須是數字')
        .int('SERVER_PORT 必須是整數')
        .positive('SERVER_PORT 必須是正整數'),
});

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
    DB_WAIT_FOR_CONNECTIONS: envBoolean,
    DB_QUEUE_LIMIT: z.coerce
        .number('DB_QUEUE_LIMIT 必須是數字')
        .int('DB_QUEUE_LIMIT 必須是整數')
        .nonnegative('DB_QUEUE_LIMIT 不可小於 0'),


    DB_CHARSET: z.string().trim().min(1, 'DB_CHARSET 不可為空'),
    DB_SUPPORT_BIG_NUMBERS: envBoolean,
    DB_BIG_NUMBER_STRINGS: envBoolean,
});

export const serverEnv = serverSchema.parse(process.env);
export const databaseEnv = databaseSchema.parse(process.env);
