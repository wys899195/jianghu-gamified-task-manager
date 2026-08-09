// ========================================
// Backend MySQL Connector
// ========================================

import { createMysqlPool } from './MysqlPoolFactory.js';

export const backendMysqlPool = createMysqlPool({
  connectionLimit: 10,
});

