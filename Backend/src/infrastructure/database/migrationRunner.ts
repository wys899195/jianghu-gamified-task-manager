import fs from 'node:fs/promises';
import path from 'node:path';

import { Umzug } from 'umzug';

import { createMysqlPool } from './mysqlPoolFactory.js';
import { MySqlMigrationStorage } from './migrationStorage.js';


// ========================================
// Migration MySQL Connection Pool
// ========================================

// Migration 是一次性的資料庫結構更新流程，
// 不需要像 Backend 一樣維持多條並行連線。
// 因此固定只允許 1 條 MySQL connection。
const migrationMysqlPool = createMysqlPool({
    connectionLimit: 1,
});


// ========================================
// Migration Directory
// ========================================

// process.cwd() 預期為 Backend/。
// 因此 ../Database/migrations 指向專案根目錄下的 migration 資料夾。
const migrationsDirectory = path.resolve(
    process.cwd(),
    '../Database/migrations',
);


// ========================================
// Umzug Configuration
// ========================================

const migrator = new Umzug({
    migrations: {
        glob: path.join(
            migrationsDirectory,
            '*.sql',
        ),

        resolve: ({ name, path: migrationPath }) => {
            // Umzug 的 path 型別可能為 undefined；
            // SQL migration 必須有實體檔案路徑，因此先進行檢查。
            if (!migrationPath) {
                throw new Error(`Migration path is missing: ${name}`);
            }

            return {
                // 用migration SQL檔名，方便對照檔案。
                name,

                // 以 UTF-8 讀取 migration SQL 檔案，並交由 MySQL 執行。
                up: async () => {
                    const sql = await fs.readFile(
                        migrationPath,
                        'utf8',
                    );
                    await migrationMysqlPool.query(sql);
                },

                // TODO: 目前只支援向前 migration，不提供 rollback。
                down: async () => {
                    throw new Error(
                        `Rollback is not supported for migration: ${name}`,
                    );
                },
            };
        },
    },

    // Umzug 的 migration 執行紀錄也跟migration時使用同一個 connection pool。
    storage: new MySqlMigrationStorage(
        migrationMysqlPool,
    ),

    logger: console,
});


// ========================================
// Run Migrations
// ========================================

async function runMigrations(): Promise<void> {
    try {
        // 找出尚未執行的 migration。
        const pendingMigrations = await migrator.pending();

        if (pendingMigrations.length === 0) {
            console.log('No pending migrations.');
            return;
        }

        console.log('Pending migrations:');

        for (const migration of pendingMigrations) {
            console.log(`- ${migration.name}`);
        }

        // 依順序執行所有尚未執行的 migration。
        await migrator.up();

        console.log('Database migrations completed.');
    } catch (error) {
        console.error('Database migration failed:', error);

        // migration 失敗了，就不讓sh繼續啟動後端。
        process.exitCode = 1;
    } finally {
        // Migration process 執行完畢後不再需要資料庫連線，
        // 因此關閉 migration 專用 connection pool。
        await migrationMysqlPool.end();
    }
}

await runMigrations();