CREATE TABLE accounts (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT '使用者電子郵件',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '使用者密碼hash',
    `nickname` VARCHAR(50) NOT NULL COMMENT '使用者暱稱',
    `avatar_url` VARCHAR(255) NULL COMMENT '使用者頭像 URL',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '帳號建立時間',
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '帳號更新時間',
    `password_updated_at` DATETIME(3) NULL COMMENT '密碼更新時間',
    `last_login_at` DATETIME(3) NULL COMMENT '最後登入時間',
    `email_verified_at` DATETIME(3) NULL COMMENT '電子郵件驗證完成時間',

    PRIMARY KEY (`id`)

);
