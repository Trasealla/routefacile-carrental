-- =============================================================================
-- MEMO PORTAL — Phase 2 (Public website: email + PIN authentication)
-- =============================================================================
-- Adds the tables required for the @autostrad.com public Memo Portal:
--   * memo_portal_users : auto-provisioned on first PIN verification
--   * memo_portal_otp   : one-time PIN records (hashed)
-- And extends memo_audit_log with an actor_scope column so we can tell
-- whether the actor_id refers to admins.id or memo_portal_users.id.
-- Safe to re-run (uses IF NOT EXISTS / additive ALTERs).
-- =============================================================================

CREATE TABLE IF NOT EXISTS `memo_portal_users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `first_login_at` DATETIME NULL,
    `last_login_at` DATETIME NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_memo_portal_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `memo_portal_otp` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `pin_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `attempts` INT NOT NULL DEFAULT 0,
    `used` TINYINT NOT NULL DEFAULT 0,
    `ip` VARCHAR(64) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_memo_portal_otp_email_used` (`email`, `used`),
    KEY `idx_memo_portal_otp_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add actor_scope column (admin = admins.id, portal = memo_portal_users.id)
-- Use a guarded ALTER so re-runs do not fail.
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'memo_audit_log'
      AND COLUMN_NAME = 'actor_scope'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE `memo_audit_log` ADD COLUMN `actor_scope` ENUM(''admin'',''portal'') NOT NULL DEFAULT ''admin'' AFTER `actor_id`',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =============================================================================
-- END
-- =============================================================================
