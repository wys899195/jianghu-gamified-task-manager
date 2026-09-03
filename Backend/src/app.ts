// ========================================
// 負責組裝 Express App，
// 包含 Middleware、Health Check、API Routes 與 Error Handler。
// ========================================

import express from 'express';
import cookieParser from 'cookie-parser';
import type { RowDataPacket } from 'mysql2';

import { backendMysqlPool } from './infrastructure/database/MysqlConnector.js';

import authRoutes from './modules/user/routes/AuthRoutes.js';
import accountRoutes from './modules/user/routes/accountRoutes.js';

import {
    userErrorResponseMap,
} from './modules/user/apiErrors/UserErrors.js';

import {
    createApiErrorHandler,
} from './shared/middleware/ApiErrorHandler.js';

const app = express();


// 組裝各功能模組的 ServiceError 對外 API response。
const errorResponseMap = {
    ...userErrorResponseMap,
};


// ========================================
// Global Middleware
// ========================================

// 解析 JSON request body。
app.use(express.json());

// 解析 Cookie。
// Refresh Token 儲存在 HttpOnly Cookie，
// Controller 需要透過 req.cookies 取得。
app.use(cookieParser());


// ========================================
// Health Check
// ========================================

// Backend Health Check
app.get('/api/health', (_req, res) => {

    res.status(200).json({
        status: 'ok',
        message: 'Backend is running',
    });

});


// Database Health Check
interface DatabaseHealthRow extends RowDataPacket {
    connected: number;
    databaseName: string;
    databaseTime: Date;
}

app.get('/api/health/database', async (_req, res) => {

    try {

        const [rows] =
            await backendMysqlPool.execute<
                DatabaseHealthRow[]
            >(`
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

        console.error(
            'Database health check failed:',
            error,
        );


        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
        });

    }

});


// ========================================
// API Routes
// ========================================

// Authentication APIs
app.use(
    '/auth',
    authRoutes,
);

// Account APIs
app.use(
    '/account',
    accountRoutes,
);


// ========================================
// Error Handler
// 統一處理 API 錯誤回應。
// 必須放在所有 Route 後面。
// ========================================

app.use(
    createApiErrorHandler(
        errorResponseMap,
    ),
);


export default app;
