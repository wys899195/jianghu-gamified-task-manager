import express from 'express';
import { serverConfig } from './config/serverConfig.js';
import type { RowDataPacket } from 'mysql2';
import { mysqlPool } from './infrastructure/mysqlConnector.js';

const app = express();

// 解析 JSON request body。
app.use(express.json());

// ========================================
// (API) Backend Health Check 
// ========================================
app.get('/api/health', (_req, res) => {
    res.status(200).json({ message: 'Backend is running' });
});



// ========================================
// (API) Database Health Check
// ========================================
interface DatabaseHealthRow extends RowDataPacket {
  connected: number;
  databaseName: string;
  databaseTime: Date;
}

// 確認 Express 是否能成功連線至 MySQL。
app.get('/api/health/database', async (_req, res) => {
  try {
    const [rows] = await mysqlPool.execute<DatabaseHealthRow[]>(`
      SELECT
        1 AS connected,
        DATABASE() AS databaseName,
        NOW() AS databaseTime
    `);

    res.status(200).json({
      status: 'ok',
      message: 'Database is connected',
      database: rows[0],
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});




// ========================================
// Start Server
// ========================================
app.listen(serverConfig.port, serverConfig.host, () => {
  console.log(
    `Backend running at http://${serverConfig.host}:${serverConfig.port}`,
  );
});


