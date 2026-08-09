CREATE TABLE auth_sessions (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Session 內部主鍵',
    `account_id` INT UNSIGNED NOT NULL COMMENT '此 Session 所屬帳號 ID',
    `jti` VARCHAR(64) NOT NULL COMMENT 'JWT 唯一識別碼',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Session 建立時間',

    PRIMARY KEY (`id`),

    UNIQUE KEY `uq_auth_sessions_jti` (`jti`),

    INDEX `idx_auth_sessions_account_id` (`account_id`),

    CONSTRAINT `fk_auth_sessions_account`
        FOREIGN KEY (`account_id`)
        REFERENCES `accounts` (`id`)
        ON DELETE CASCADE
);