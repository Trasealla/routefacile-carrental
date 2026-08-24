-- ============================================================================
-- DESCRIPTION: Add HR roles and insert HR admin users
-- ============================================================================
-- PURPOSE: Creates hr_recruitment and hr_manager roles for the recruiting module
-- CREATED: April 10, 2026
-- UPDATED: April 14, 2026 - Renamed hr → hr_recruitment
-- ============================================================================

-- Step 1: Add 'hr_recruitment' and 'hr_manager' to the admin type enum
ALTER TABLE `admins`
  MODIFY COLUMN `type` enum('admin','counter','accounts','hr_recruitment','hr_manager') NOT NULL DEFAULT 'admin';

-- Step 2: Insert HR users
-- hr@autostrad.com       → Password: Hr@1234       → Role: hr_recruitment
-- hr_manager@autostrad.com → Password: HrManager@1234 → Role: hr_manager

INSERT INTO `admins` (`first_name`, `last_name`, `email`, `password`, `type`, `country_code`, `phone_number`, `status`, `created_at`, `updated_at`)
VALUES
(
  'HR',
  'Recruitment',
  'hr@autostrad.com',
  '$2b$10$R/S9sD.ikMJOet6VXSEQy.nnnszvaggpssCEIZHrx0ZYCi4B95D6q',
  'hr_recruitment',
  '+968',
  '00000000',
  1,
  NOW(),
  NOW()
),
(
  'HR',
  'Manager',
  'hr_manager@autostrad.com',
  '$2b$10$LoUTLBaYf/affw4hjnIAEeVWXVZ5NjlUSdhxZWWDOeIk7G4.q1ige',
  'hr_manager',
  '+968',
  '00000000',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `type` = VALUES(`type`),
  `password` = VALUES(`password`),
  `status` = VALUES(`status`),
  `updated_at` = NOW();
