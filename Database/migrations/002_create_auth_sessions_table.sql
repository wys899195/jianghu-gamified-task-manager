CREATE TABLE auth_sessions (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT
        COMMENT 'Session 內部主鍵',

    `account_id` INT UNSIGNED NOT NULL
        COMMENT '此 Session 所屬帳號 ID',

    `refresh_token_hash` CHAR(64) NOT NULL
        COMMENT 'Refresh Token 的 SHA-256 Hash',

    `created_at` DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3)
        COMMENT 'Session 建立時間',

    `last_used_at` DATETIME(3) NULL
        COMMENT '最近一次使用 Refresh Token 的時間',

    `expires_at` DATETIME(3) NOT NULL
        COMMENT 'Refresh Session 過期時間',

    `revoked_at` DATETIME(3) NULL
        COMMENT 'Session 撤銷時間',

    PRIMARY KEY (`id`),

    UNIQUE KEY `uq_auth_sessions_refresh_token_hash`
        (`refresh_token_hash`),

    INDEX `idx_auth_sessions_account_id`
        (`account_id`),

    INDEX `idx_auth_sessions_expires_at`
        (`expires_at`),

    CONSTRAINT `fk_auth_sessions_account`
        FOREIGN KEY (`account_id`)
        REFERENCES `accounts` (`id`)
        ON DELETE CASCADE
);