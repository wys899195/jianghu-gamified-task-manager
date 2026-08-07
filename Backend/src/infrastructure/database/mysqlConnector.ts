import mysql from 'mysql2/promise';
import { databaseConfig } from '../../config/databaseConfig.js';


export const pool = mysql.createPool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.name,
  user: databaseConfig.user,
  password: databaseConfig.password,

  waitForConnections: true,
  connectionLimit: databaseConfig.connectionLimit,
  queueLimit: 0,

  charset: 'utf8mb4',

  supportBigNumbers: true,
  bigNumberStrings: true,
});

