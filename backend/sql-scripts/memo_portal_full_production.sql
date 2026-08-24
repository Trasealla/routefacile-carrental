-- =============================================================================
-- MEMO PORTAL - FULL PRODUCTION DATABASE MIGRATION
-- =============================================================================
-- Combines Phase 1 (admin memo CRUD) + Phase 2 (public portal email+PIN auth)
-- in a single, idempotent script. Safe to run multiple times.
--
-- USAGE
--   mysql -h <host> -u <user> -p<password> <database> < memo_portal_full_production.sql
--
-- Example (production):
--   mysql -h prod-db.autostrad.com -u arc_admin -p arc_production \
--         < memo_portal_full_production.sql
--
-- PREREQUISITES
--   * The `admins` table already exists (FKs reference admins.id).
--   * MySQL 5.7+ / 8.0  (uses datetime(6), ENUM, prepared statements).
--   * The connecting user has CREATE, ALTER, INSERT privileges.
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- PHASE 1 - ADMIN MEMO CRUD
-- -----------------------------------------------------------------------------

-- 1. Categories ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `memo_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_memo_categories_slug` (`slug`),
  KEY `FK_memo_categories_created_by` (`created_by`),
  KEY `FK_memo_categories_updated_by` (`updated_by`),
  CONSTRAINT `FK_memo_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_memo_categories_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Documents ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `memo_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `current_version_id` int DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `tags` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT 0,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_memo_documents_title` (`title`),
  KEY `IDX_memo_documents_status` (`status`),
  KEY `FK_memo_documents_category` (`category_id`),
  KEY `FK_memo_documents_created_by` (`created_by`),
  KEY `FK_memo_documents_updated_by` (`updated_by`),
  CONSTRAINT `FK_memo_documents_category` FOREIGN KEY (`category_id`) REFERENCES `memo_categories` (`id`),
  CONSTRAINT `FK_memo_documents_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_memo_documents_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Document Versions --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `memo_document_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `version_no` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(150) DEFAULT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `change_notes` text DEFAULT NULL,
  `is_current` tinyint NOT NULL DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_versions_document` (`document_id`),
  KEY `FK_memo_document_versions_uploaded_by` (`uploaded_by`),
  CONSTRAINT `FK_memo_document_versions_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_memo_document_versions_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Document Access Control --------------------------------------------------
-- target_type ALL       -> target_value NULL                (everyone)
-- target_type USER_TYPE -> target_value = admins.type       (e.g. 'hr_manager')
-- target_type USER      -> target_value = admins.id (string) for admin tokens
--                         or the email (string) for portal users
CREATE TABLE IF NOT EXISTS `memo_document_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `target_type` enum('all','user_type','user') NOT NULL,
  `target_value` varchar(100) DEFAULT NULL,
  `granted_by` int DEFAULT NULL,
  `granted_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_access_lookup` (`document_id`,`target_type`,`target_value`),
  KEY `FK_memo_document_access_granted_by` (`granted_by`),
  CONSTRAINT `FK_memo_document_access_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_memo_document_access_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Document Views (audit trail of who opened the file) ----------------------
CREATE TABLE IF NOT EXISTS `memo_document_views` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `version_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `viewed_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_views_doc_user` (`document_id`,`user_id`),
  KEY `IDX_memo_document_views_user` (`user_id`),
  KEY `IDX_memo_document_views_viewed_at` (`viewed_at`),
  CONSTRAINT `FK_memo_document_views_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTE: no FK on user_id because the user can be either an admins.id OR a
-- memo_portal_users.id depending on the actor scope.

-- 6. Audit Log ---------------------------------------------------------------
-- actor_scope:
--   'admin'  -> actor_id refers to admins.id
--   'portal' -> actor_id refers to memo_portal_users.id
CREATE TABLE IF NOT EXISTS `memo_audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` int DEFAULT NULL,
  `actor_scope` enum('admin','portal') NOT NULL DEFAULT 'admin',
  `action` varchar(80) NOT NULL,
  `entity_type` varchar(80) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `metadata_json` text DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_audit_log_entity` (`entity_type`,`entity_id`),
  KEY `IDX_memo_audit_log_created_at` (`created_at`),
  KEY `IDX_memo_audit_log_actor` (`actor_scope`,`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PHASE 2 - PUBLIC PORTAL (email + PIN authentication)
-- -----------------------------------------------------------------------------

-- 7. Portal Users (auto-provisioned on first successful PIN verify) -----------
CREATE TABLE IF NOT EXISTS `memo_portal_users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `first_login_at` datetime NULL,
  `last_login_at` datetime NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_memo_portal_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Portal OTP / PIN records (hashed, single-use, expiring) -----------------
CREATE TABLE IF NOT EXISTS `memo_portal_otp` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `pin_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT 0,
  `used` tinyint NOT NULL DEFAULT 0,
  `ip` varchar(64) NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_memo_portal_otp_email_used` (`email`,`used`),
  KEY `idx_memo_portal_otp_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- BACKWARD-COMPATIBLE MIGRATION (only matters if the audit_log was created
-- by the old Phase-1 script that did NOT have actor_scope).
-- This block adds the column only if it is missing, so it is safe re-run.
-- -----------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'memo_audit_log'
    AND COLUMN_NAME  = 'actor_scope'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `memo_audit_log` ADD COLUMN `actor_scope` ENUM(''admin'',''portal'') NOT NULL DEFAULT ''admin'' AFTER `actor_id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop old FK on memo_audit_log.actor_id if it exists (it would block portal
-- audit rows whose actor_id points to memo_portal_users instead of admins).
SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME       = 'memo_audit_log'
    AND CONSTRAINT_NAME  = 'FK_memo_audit_log_actor'
);
SET @sql := IF(@fk_exists = 1,
  'ALTER TABLE `memo_audit_log` DROP FOREIGN KEY `FK_memo_audit_log_actor`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add view_count column to memo_documents if upgrading from an older script.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'memo_documents'
    AND COLUMN_NAME  = 'view_count'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `memo_documents` ADD COLUMN `view_count` INT NOT NULL DEFAULT 0 AFTER `published_at`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Back-fill view_count from existing view rows (safe to re-run).
-- Disable SQL_SAFE_UPDATES locally so MySQL Workbench allows the bulk update.
SET @old_safe_updates := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE `memo_documents` d
LEFT JOIN (
  SELECT `document_id`, COUNT(*) AS c
  FROM `memo_document_views`
  GROUP BY `document_id`
) v ON v.`document_id` = d.`id`
SET d.`view_count` = COALESCE(v.c, 0)
WHERE d.`id` > 0;

SET SQL_SAFE_UPDATES = @old_safe_updates;

-- -----------------------------------------------------------------------------
-- SEED DATA - sample categories (only inserted if not already there)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `memo_categories` (`name`, `slug`, `description`, `status`)
VALUES
  ('General',    'general',    'General organizational memos',  1),
  ('HR',         'hr',         'HR-related memos and notices',  1),
  ('Operations', 'operations', 'Operations memos',              1),
  ('Finance',    'finance',    'Finance & accounting memos',    1),
  ('IT',         'it',         'IT notices and policies',       1);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- VERIFICATION QUERIES (run these after the migration to confirm everything)
-- =============================================================================
-- Expected: 8 rows, one per memo_* table listed below.
SELECT TABLE_NAME, ENGINE, TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'memo_categories',
    'memo_documents',
    'memo_document_versions',
    'memo_document_access',
    'memo_document_views',
    'memo_audit_log',
    'memo_portal_users',
    'memo_portal_otp'
  )
ORDER BY TABLE_NAME;

-- Expected: shows actor_scope column with ENUM('admin','portal').
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'memo_audit_log'
  AND COLUMN_NAME  = 'actor_scope';

-- Expected: 5 seeded categories.
SELECT id, name, slug, status FROM memo_categories ORDER BY id;

-- =============================================================================
-- OPTIONAL ROLLBACK  (UNCOMMENT ONLY IF YOU NEED TO REVERT)
-- WARNING: this destroys all memo data. Make a backup first.
-- =============================================================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS `memo_portal_otp`;
-- DROP TABLE IF EXISTS `memo_portal_users`;
-- DROP TABLE IF EXISTS `memo_audit_log`;
-- DROP TABLE IF EXISTS `memo_document_views`;
-- DROP TABLE IF EXISTS `memo_document_access`;
-- DROP TABLE IF EXISTS `memo_document_versions`;
-- DROP TABLE IF EXISTS `memo_documents`;
-- DROP TABLE IF EXISTS `memo_categories`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- END OF SCRIPT
-- =============================================================================
