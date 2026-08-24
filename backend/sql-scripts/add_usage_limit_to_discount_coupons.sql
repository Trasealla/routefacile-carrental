-- ============================================================================
-- Add usage tracking to discount_coupons (single-use / limited-use coupons)
-- ============================================================================
-- usage_limit  NULL  -> unlimited (legacy / regular coupons)
-- usage_limit  1     -> single-use (becomes invalid after first booking)
-- usage_limit  N>1   -> limited-use (becomes invalid after N bookings)
-- usage_count        -> redemptions so far (incremented on booking confirm)
-- ============================================================================

ALTER TABLE `discount_coupons`
  ADD COLUMN `usage_limit` INT NULL DEFAULT NULL AFTER `status`,
  ADD COLUMN `usage_count` INT NOT NULL DEFAULT 0 AFTER `usage_limit`;

-- Helpful index for the atomic "consume" UPDATE used on booking confirm.
CREATE INDEX `idx_discount_coupons_code_usage`
  ON `discount_coupons` (`code`, `usage_limit`, `usage_count`);
