// ========================================
// Backend MySQL Connector
// ========================================

import { createMysqlPool } from './mysqlPoolFactory.js';

export const backendMysqlPool = createMysqlPool({
  connectionLimit: 10,
});

