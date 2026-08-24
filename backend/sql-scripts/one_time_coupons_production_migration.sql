-- ============================================================================
-- ONE-TIME-USE DISCOUNT COUPONS — production migration (single file)
-- ============================================================================
-- Apply on production AFTER deploying the matching backend code.
-- Idempotent / safe to re-run: each statement checks before altering.
--
-- Schema changes:
--   1. Add  discount_coupons.usage_limit  INT NULL
--          (NULL  -> unlimited / regular coupon
--           1     -> single-use
--           N>1   -> limited-use; invalid after N redemptions)
--   2. Add  discount_coupons.usage_count  INT NOT NULL DEFAULT 0
--          (incremented atomically by the backend on booking confirm)
--   3. Make discount_coupons.applicable_for nullable
--          (it was NOT NULL with no default and the admin form does not
--           submit it, which broke inserts)
--   4. Add composite index on (code, usage_limit, usage_count)
--          (used by the atomic "consume" UPDATE)
--
-- Existing rows are unaffected: usage_limit stays NULL, usage_count = 0.
-- ============================================================================

-- ---- 1 & 2: add usage tracking columns (only if missing) -------------------

SET @schema := DATABASE();

SET @col_usage_limit_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema
    AND TABLE_NAME   = 'discount_coupons'
    AND COLUMN_NAME  = 'usage_limit'
);
SET @sql := IF(
  @col_usage_limit_exists = 0,
  'ALTER TABLE `discount_coupons` ADD COLUMN `usage_limit` INT NULL DEFAULT NULL AFTER `status`',
  'SELECT "skip: discount_coupons.usage_limit already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_usage_count_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema
    AND TABLE_NAME   = 'discount_coupons'
    AND COLUMN_NAME  = 'usage_count'
);
SET @sql := IF(
  @col_usage_count_exists = 0,
  'ALTER TABLE `discount_coupons` ADD COLUMN `usage_count` INT NOT NULL DEFAULT 0 AFTER `usage_limit`',
  'SELECT "skip: discount_coupons.usage_count already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- 3: make applicable_for nullable (only if currently NOT NULL) ----------

SET @applicable_for_is_nullable := (
  SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema
    AND TABLE_NAME   = 'discount_coupons'
    AND COLUMN_NAME  = 'applicable_for'
);
SET @sql := IF(
  @applicable_for_is_nullable = 'NO',
  'ALTER TABLE `discount_coupons` MODIFY COLUMN `applicable_for` JSON NULL',
  'SELECT "skip: discount_coupons.applicable_for already nullable" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- 4: composite index for the atomic consume UPDATE ----------------------

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema
    AND TABLE_NAME   = 'discount_coupons'
    AND INDEX_NAME   = 'idx_discount_coupons_code_usage'
);
SET @sql := IF(
  @idx_exists = 0,
  'CREATE INDEX `idx_discount_coupons_code_usage` ON `discount_coupons` (`code`, `usage_limit`, `usage_count`)',
  'SELECT "skip: idx_discount_coupons_code_usage already exists" AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================================
-- Verification queries (optional — run manually after the script)
-- ============================================================================
--   SHOW COLUMNS FROM `discount_coupons`
--     WHERE Field IN ('usage_limit','usage_count','applicable_for');
--   SHOW INDEX FROM `discount_coupons`
--     WHERE Key_name = 'idx_discount_coupons_code_usage';
-- ============================================================================
