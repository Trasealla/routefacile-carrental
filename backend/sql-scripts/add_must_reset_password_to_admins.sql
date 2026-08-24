-- ============================================================================
-- Add must_reset_password column to admins table
-- ============================================================================

ALTER TABLE `admins`
  ADD COLUMN `must_reset_password` TINYINT NOT NULL DEFAULT 0 AFTER `status`;

-- Set must_reset_password = 1 for HR users so they change password on first login
UPDATE `admins` SET `must_reset_password` = 1 WHERE `id` IN (SELECT `id` FROM (SELECT `id` FROM `admins` WHERE `type` IN ('hr_recruitment', 'hr_manager')) AS tmp);
