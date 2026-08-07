// ========================================
// MySQL Migration Storage for Umzug
// ========================================

import type { UmzugStorage } from 'umzug';
import type { Pool, RowDataPacket } from 'mysql2/promise';


// 定義查詢 schema_migrations 時，每一列資料的型別。
interface MigrationRow extends RowDataPacket {
    migration_name: string;
}


// 使用 MySQL 保存 Umzug 的 migration 執行紀錄。
export class MySqlMigrationStorage implements UmzugStorage {

    // 由外部注入 migration 專用的 MySQL connection pool。
    constructor(private readonly pool: Pool) {}


    // 確保 migration 紀錄表存在。
    private async ensureTable(): Promise<void> {
        await this.pool.execute(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

                migration_name VARCHAR(255) NOT NULL,

                executed_at DATETIME(3)
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP(3),

                PRIMARY KEY (id),

                UNIQUE KEY uq_schema_migrations_name (migration_name)
            )
        `);
    }


    // 回傳已成功執行的 migration 名稱。
    async executed(): Promise<string[]> {
        await this.ensureTable();

        const [rows] =
            await this.pool.execute<MigrationRow[]>(`
                SELECT migration_name
                FROM schema_migrations
                ORDER BY id
            `);

        return rows.map((row) => row.migration_name);
    }


    // migration 成功後，記錄其名稱。
    async logMigration({
        name,
    }: {
        name: string;
    }): Promise<void> {
        await this.ensureTable();

        await this.pool.execute(
            `
                INSERT INTO schema_migrations (migration_name)
                VALUES (?)
            `,
            [name],
        );
    }


    // migration rollback 成功後，移除其執行紀錄。
    async unlogMigration({
        name,
    }: {
        name: string;
    }): Promise<void> {
        await this.ensureTable();

        await this.pool.execute(
            `
                DELETE FROM schema_migrations
                WHERE migration_name = ?
            `,
            [name],
        );
    }
}