import 'dotenv/config';
import { z } from 'zod';

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
    .positive('DB_PORT 必須是正整數'),
  DB_NAME: z.string().trim().min(1, 'DB_NAME 不可為空'),
  DB_USER: z.string().trim().min(1, 'DB_USER 不可為空'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD 不可為空'),
  DB_CONNECTION_LIMIT: z.coerce
    .number('DB_CONNECTION_LIMIT 必須是數字')
    .int('DB_CONNECTION_LIMIT 必須是整數')
    .positive('DB_CONNECTION_LIMIT 必須是正整數'),
});


export const serverEnv = serverSchema.parse(process.env);
export const databaseEnv = databaseSchema.parse(process.env);
