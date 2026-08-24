-- ============================================================================
-- DESCRIPTION: Insert admin user with 'accounts' role
-- ============================================================================
-- PURPOSE: Creates an accounts-type admin for financial/accounting access
-- CREATED: March 25, 2026
-- ============================================================================

-- First, add 'accounts' to the enum if not already present
ALTER TABLE `admins`
  MODIFY COLUMN `type` enum('admin','counter','accounts') NOT NULL DEFAULT 'admin';

-- Update existing users to 'accounts' role, or insert if they don't exist
-- Password: Auto@2026 (bcrypt-hashed)
INSERT INTO `admins` (`first_name`, `last_name`, `email`, `password`, `type`, `country_code`, `phone_number`, `status`, `created_at`, `updated_at`)
VALUES
(
  'Asmaa',
  'Bayoumy',
  'asmaa.bayoumy@autostrad.com',
  '$2b$10$Ns//8Q5UDiuqluNrZVUEzOyf/tGvdPjKyglRvN5oBGRk57fNSd7jy',
  'accounts',
  '+971',
  '00000000',
  1,
  NOW(),
  NOW()
),
(
  'Tom',
  'Jose',
  'tom.jose@autostrad.com',
  '$2b$10$Ns//8Q5UDiuqluNrZVUEzOyf/tGvdPjKyglRvN5oBGRk57fNSd7jy',
  'accounts',
  '+971',
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
