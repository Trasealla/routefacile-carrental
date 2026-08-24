-- ============================================================================
-- Make discount_coupons.applicable_for nullable
-- ============================================================================
-- The column was created as NOT NULL with no default, which caused inserts
-- to fail with "Field 'applicable_for' doesn't have a default value" when
-- the admin form did not submit this field. The new admin pages (regular and
-- one-time coupons) treat NULL / empty as "applies to all booking sources".
-- ============================================================================

ALTER TABLE `discount_coupons`
  MODIFY COLUMN `applicable_for` JSON NULL;
