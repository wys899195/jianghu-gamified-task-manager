// ========================================
// Backend MySQL Pool Factory
// ========================================

import mysql, {
  type Pool,
  type PoolOptions,
} from 'mysql2/promise';

import { databaseConfig } from '../../config/DatabaseConfig.js';

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
    timezone: databaseConfig.timezone,
    
    ...overrides,
  });
}