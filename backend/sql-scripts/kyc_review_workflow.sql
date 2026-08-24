-- ============================================================================
-- KYC review workflow migration
--   * Extend kyc_submissions.status enum: under_review, approved, rejected
--   * Add audit columns: reviewed_by_admin_id, reviewed_at, review_notes,
--     rejection_reason
-- CREATED: 2026-04-28
-- ============================================================================

-- 1) Extend status enum
ALTER TABLE `kyc_submissions`
  MODIFY COLUMN `status`
  ENUM('draft','submitted','under_review','approved','rejected')
  NOT NULL DEFAULT 'draft';

-- 2) Add audit / review columns (idempotent: drop+add pattern via IF NOT EXISTS not
--    universally supported; use information_schema check)
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'kyc_submissions'
               AND COLUMN_NAME = 'reviewed_by_admin_id');
SET @sql := IF(@col = 0,
  'ALTER TABLE `kyc_submissions` ADD COLUMN `reviewed_by_admin_id` INT NULL AFTER `submission_ip`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'kyc_submissions'
               AND COLUMN_NAME = 'reviewed_at');
SET @sql := IF(@col = 0,
  'ALTER TABLE `kyc_submissions` ADD COLUMN `reviewed_at` DATETIME NULL AFTER `reviewed_by_admin_id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'kyc_submissions'
               AND COLUMN_NAME = 'review_notes');
SET @sql := IF(@col = 0,
  'ALTER TABLE `kyc_submissions` ADD COLUMN `review_notes` TEXT NULL AFTER `reviewed_at`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'kyc_submissions'
               AND COLUMN_NAME = 'rejection_reason');
SET @sql := IF(@col = 0,
  'ALTER TABLE `kyc_submissions` ADD COLUMN `rejection_reason` TEXT NULL AFTER `review_notes`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
