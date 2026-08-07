import express from 'express';
import { serverConfig } from './config/serverConfig.js';


const app = express();

// 解析 JSON request body。
app.use(express.json());

// 後端健康檢查 API。
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
  });
});

// 使用已通過驗證的環境變數啟動伺服器。
app.listen(serverConfig.port, serverConfig.host, () => {
  console.log(
    `Backend running at http://${serverConfig.host}:${serverConfig.port}`,
  );
});
