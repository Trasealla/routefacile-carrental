-- ============================================================================
-- KYC Form module migration
--   * Adds 'kyc_officer' role to admins.type enum
--   * Creates kyc_submissions and kyc_submission_attachments tables
-- CREATED: 2026-04-27
-- ============================================================================

-- 1) Extend admins.type enum to include kyc_officer
ALTER TABLE `admins`
  MODIFY COLUMN `type`
  ENUM('admin','counter','accounts','hr_recruitment','hr_manager','kyc_officer')
  NOT NULL DEFAULT 'admin';

-- 2) KYC submissions table
CREATE TABLE IF NOT EXISTS `kyc_submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference_token` VARCHAR(64) NOT NULL,

  -- Personal / residential
  `residential_address` TEXT NULL,
  `contact_mobile_code` VARCHAR(10) NOT NULL,
  `contact_mobile_number` VARCHAR(20) NOT NULL,
  `contact_landline_code` VARCHAR(10) NULL,
  `contact_landline_number` VARCHAR(20) NULL,

  -- Company
  `company_name` VARCHAR(255) NULL,
  `company_address` TEXT NULL,
  `company_phone_code` VARCHAR(10) NULL,
  `company_phone_number` VARCHAR(20) NULL,

  -- Email
  `email` VARCHAR(191) NOT NULL,

  -- Consent
  `consent_given` TINYINT NOT NULL DEFAULT 0,
  `consent_text` TEXT NULL,
  `consent_given_at` DATETIME NULL,

  -- Phone OTP
  `phone_otp` VARCHAR(10) NULL,
  `phone_otp_expires_at` DATETIME NULL,
  `phone_verified` TINYINT NOT NULL DEFAULT 0,
  `phone_verified_at` DATETIME NULL,

  -- Email OTP
  `email_otp` VARCHAR(10) NULL,
  `email_otp_expires_at` DATETIME NULL,
  `email_verified` TINYINT NOT NULL DEFAULT 0,
  `email_verified_at` DATETIME NULL,

  -- Workflow
  `status` ENUM('draft','submitted') NOT NULL DEFAULT 'draft',
  `submitted_at` DATETIME NULL,
  `submission_ip` VARCHAR(64) NULL,

  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_kyc_submissions_reference_token` (`reference_token`),
  INDEX `IDX_kyc_submissions_status` (`status`),
  INDEX `IDX_kyc_submissions_email` (`email`),
  INDEX `IDX_kyc_submissions_mobile` (`contact_mobile_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) KYC submission attachments table (one row per uploaded document)
CREATE TABLE IF NOT EXISTS `kyc_submission_attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kyc_submission_id` INT NOT NULL,
  `document_type` ENUM('emirates_id','passport_visa','uae_driving_license') NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_kyc_attachment_submission_id` (`kyc_submission_id`),
  CONSTRAINT `FK_kyc_attachment_submission`
    FOREIGN KEY (`kyc_submission_id`) REFERENCES `kyc_submissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Seed a KYC officer admin account
--    Email:    kyc@autostrad.com
--    Password: KycOfficer@1234   (must_reset_password = 1, so user must change it on first login)
INSERT INTO `admins`
  (`first_name`,`last_name`,`email`,`password`,`type`,`country_code`,`phone_number`,`status`,`must_reset_password`,`created_at`,`updated_at`)
VALUES
  ('KYC','Officer','kyc@autostrad.com',
   '$2b$10$BfPnnNcPmhZnKKb7kkejuuXDOrh04JqdiEUTN7Z/qv05.YGwXKEm.',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW())
ON DUPLICATE KEY UPDATE
  `type`               = VALUES(`type`),
  `password`           = VALUES(`password`),
  `status`             = VALUES(`status`),
  `must_reset_password`= VALUES(`must_reset_password`),
  `updated_at`         = NOW();
