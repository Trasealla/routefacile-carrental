-- =============================================================
-- KYC Phase 3 schema additions
--
-- Idempotent migration: safe to run multiple times.
-- Adds columns for:
--   * Status SMS notifications (B3)
--   * Digital signature capture  (B6)
-- =============================================================

-- ---- Status SMS notification ----
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'sms_status_sent_at'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN sms_status_sent_at DATETIME NULL AFTER rejection_reason',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'sms_status_error'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN sms_status_error VARCHAR(255) NULL AFTER sms_status_sent_at',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- Digital signature ----
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_image'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_image LONGTEXT NULL AFTER sms_status_error',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_method'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_method VARCHAR(20) NULL AFTER signature_image',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_typed_text'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_typed_text VARCHAR(255) NULL AFTER signature_method',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_signed_at'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_signed_at DATETIME NULL AFTER signature_typed_text',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_ip'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_ip VARCHAR(64) NULL AFTER signature_signed_at',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_user_agent'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_user_agent VARCHAR(512) NULL AFTER signature_ip',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'kyc_submissions'
      AND COLUMN_NAME = 'signature_hash'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE kyc_submissions ADD COLUMN signature_hash VARCHAR(128) NULL AFTER signature_user_agent',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
