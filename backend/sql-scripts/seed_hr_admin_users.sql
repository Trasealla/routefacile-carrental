-- ============================================================================
-- Seed HR Admin Users with temporary password and must_reset_password = 1
-- Default temp password: Auto@2024
-- ============================================================================

-- Ensure must_reset_password column exists (MySQL 5.7 compatible)
DROP PROCEDURE IF EXISTS _add_must_reset_password;
DELIMITER //
CREATE PROCEDURE _add_must_reset_password()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'admins'
      AND COLUMN_NAME  = 'must_reset_password'
  ) THEN
    ALTER TABLE `admins`
      ADD COLUMN `must_reset_password` TINYINT NOT NULL DEFAULT 0 AFTER `status`;
  END IF;
END //
DELIMITER ;
CALL _add_must_reset_password();
DROP PROCEDURE IF EXISTS _add_must_reset_password;

-- ============================================================================
-- INSERT HR ADMIN USERS
-- Temp password: Auto@2024 (bcrypt hash below)
-- must_reset_password = 1 forces password change on first login
-- status = 1 (ACTIVE) so they can log in immediately
-- ============================================================================

INSERT INTO `admins` (
  `type`, `first_name`, `last_name`, `email`, `password`,
  `country_code`, `phone_number`, `status`, `must_reset_password`,
  `created_at`, `updated_at`
) VALUES
-- HR Manager (Group)
(
  'hr_manager',
  'Group',
  'HRM',
  'grouphrm@mwasalat.ae',
  '$2b$10$by.i806FTnYiOWhl5rBtvu4TT4CxswuGT4y1hicQA6Ri14zI0hhoW',
  '+968', '00000000', 1, 1, NOW(), NOW()
),
-- HR Manager (Osamah)
(
  'hr_manager',
  'Osamah',
  'Kenawy',
  'osamah.kenawy@mwasalat.ae',
  '$2b$10$by.i806FTnYiOWhl5rBtvu4TT4CxswuGT4y1hicQA6Ri14zI0hhoW',
  '+971', '00000000', 1, 1, NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `must_reset_password` = 1,
  `password` = '$2b$10$by.i806FTnYiOWhl5rBtvu4TT4CxswuGT4y1hicQA6Ri14zI0hhoW',
  `status` = 1,
  `updated_at` = NOW();

-- ============================================================================
-- VERIFICATION: Run after insert to confirm
-- ============================================================================
-- SELECT id, email, type, status, must_reset_password FROM admins
-- WHERE type IN ('hr_recruitment', 'hr_manager');
