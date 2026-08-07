// ========================================
// Backend MySQL Pool Factory
// ========================================

import mysql, {
  type Pool,
  type PoolOptions,
} from 'mysql2/promise';

import { databaseConfig } from '../../config/databaseConfig.js';

export function createMysqlPool(
  overrides: Partial<PoolOptions> = {},
): Pool {
  return mysql.createPool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.name,
    user: databaseConfig.user,
    password: databaseConfig.password,
    waitForConnections: databaseConfig.waitForConnections,
    queueLimit: databaseConfig.queueLimit,
    
    charset: databaseConfig.charset,
    supportBigNumbers: databaseConfig.supportBigNumbers,
    bigNumberStrings: databaseConfig.bigNumberStrings,

    ...overrides,
  });
}