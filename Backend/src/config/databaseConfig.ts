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
    connectionLimit: databaseEnv.DB_CONNECTION_LIMIT,
} as const;