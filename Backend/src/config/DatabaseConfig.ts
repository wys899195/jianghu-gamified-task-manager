// ========================================
// Backend Database Configuration
// ========================================

import { databaseEnv } from './Env.js';

const databaseUrl = new URL(
    `mysql://${databaseEnv.DB_HOST}:${databaseEnv.DB_PORT}/${databaseEnv.DB_NAME}`,
);

databaseUrl.username = databaseEnv.DB_USER;
databaseUrl.password = databaseEnv.DB_PASSWORD;

export const databaseConfig = {
    url: databaseUrl.toString(),
    host: databaseEnv.DB_HOST,
    port: databaseEnv.DB_PORT,
    name: databaseEnv.DB_NAME,
    user: databaseEnv.DB_USER,
    password: databaseEnv.DB_PASSWORD,
    charset: 'utf8mb4',         // 與根目錄.env的MYSQL_CHARACTER_SET值要相同！！
    timezone: '+00:00',         // 與根目錄.env的MYSQL_TIMEZONE值要相同！！

    // MySQL Pool 設定
    waitForConnections: true,   // Pool connection 全滿時是否等待可用 connection
    queueLimit: 0,              // 連線池等待queue的限制，0代表不設上限

    // BIGINT 處理方式
    supportBigNumbers: true,    // 支援 MySQL BIGINT 等大型數字
    bigNumberStrings: true,     // 將 BIGINT 轉為字串回傳，避免 JavaScript 精度問題
} as const;