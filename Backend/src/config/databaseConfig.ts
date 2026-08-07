// ========================================
// Backend Database Configuration
// ========================================

import { databaseEnv } from './env.js';

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
    waitForConnections: databaseEnv.DB_WAIT_FOR_CONNECTIONS,
    queueLimit: databaseEnv.DB_QUEUE_LIMIT,

    charset: databaseEnv.DB_CHARSET,
    supportBigNumbers: databaseEnv.DB_SUPPORT_BIG_NUMBERS,
    bigNumberStrings: databaseEnv.DB_BIG_NUMBER_STRINGS,
} as const;