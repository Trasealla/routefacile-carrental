-- =============================================================================
-- HR Recruitment Portal — FULL Production Migration (Idempotent, MySQL 5.7+)
-- =============================================================================
-- Safe to run multiple times. Wrap-up script that creates / extends every
-- table the HR Recruitment module relies on:
--
--   1. career_job_applications  -> add status, admin_notes, reviewed_by,
--                                  updated_at, source_channel, ai_* columns
--   2. career_job_application_attachments
--   3. recruiting_departments
--   4. recruiting_interviews
--   5. recruiting_status_history
--   6. recruiting_application_ratings
--   7. recruiting_questionnaires
--   8. recruiting_screening_keywords
--   9. recruiting_channel_postings
--  10. admins.must_reset_password
--  11. (OPTIONAL) seed two HR admin users — review before running on prod
--
-- Usage (production):
--   mysql -h <HOST> -u <USER> -p <DB> < hr_recruitment_full_production.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Generic idempotent helpers
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS _arc_add_column_if_missing;
DROP PROCEDURE IF EXISTS _arc_add_index_if_missing;
DROP PROCEDURE IF EXISTS _arc_add_fk_if_missing;

DELIMITER $$

CREATE PROCEDURE _arc_add_column_if_missing(
    IN tbl VARCHAR(64),
    IN col VARCHAR(64),
    IN definition VARCHAR(2048)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND COLUMN_NAME  = col
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', definition);
        PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
END $$

CREATE PROCEDURE _arc_add_index_if_missing(
    IN tbl VARCHAR(64),
    IN idx VARCHAR(64),
    IN cols VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND INDEX_NAME   = idx
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD INDEX `', idx, '` (', cols, ')');
        PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
END $$

CREATE PROCEDURE _arc_add_fk_if_missing(
    IN tbl VARCHAR(64),
    IN fk  VARCHAR(64),
    IN definition VARCHAR(2048)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME        = tbl
          AND CONSTRAINT_NAME   = fk
          AND CONSTRAINT_TYPE   = 'FOREIGN KEY'
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT `', fk, '` ', definition);
        PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
END $$

DELIMITER ;

-- =============================================================================
-- 1) career_job_applications - extend with HR columns
-- =============================================================================
CALL _arc_add_column_if_missing('career_job_applications', 'status',
    "TINYINT NOT NULL DEFAULT 0 AFTER `cv`");
CALL _arc_add_column_if_missing('career_job_applications', 'admin_notes',
    "TEXT NULL AFTER `status`");
CALL _arc_add_column_if_missing('career_job_applications', 'reviewed_by',
    "INT NULL AFTER `career_job_id`");
CALL _arc_add_column_if_missing('career_job_applications', 'updated_at',
    "DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER `created_at`");
CALL _arc_add_column_if_missing('career_job_applications', 'source_channel',
    "VARCHAR(30) NOT NULL DEFAULT 'autostrad' AFTER `cv`");

-- AI screening columns
CALL _arc_add_column_if_missing('career_job_applications', 'ai_score',
    "DECIMAL(5,2) NULL AFTER `admin_notes`");
CALL _arc_add_column_if_missing('career_job_applications', 'ai_status',
    "VARCHAR(20) NULL AFTER `ai_score`");
CALL _arc_add_column_if_missing('career_job_applications', 'ai_match_summary',
    "TEXT NULL AFTER `ai_status`");
CALL _arc_add_column_if_missing('career_job_applications', 'ai_screened_at',
    "DATETIME NULL AFTER `ai_match_summary`");

-- Indexes for filtering / sorting
CALL _arc_add_index_if_missing('career_job_applications', 'idx_career_job_apps_ai_status', '`ai_status`');
CALL _arc_add_index_if_missing('career_job_applications', 'idx_career_job_apps_ai_score',  '`ai_score`');
CALL _arc_add_index_if_missing('career_job_applications', 'idx_career_job_apps_status',    '`status`');
CALL _arc_add_index_if_missing('career_job_applications', 'idx_career_job_apps_reviewed_by', '`reviewed_by`');

-- FK reviewed_by -> admins(id)
CALL _arc_add_fk_if_missing(
    'career_job_applications',
    'FK_career_job_application_reviewed_by',
    'FOREIGN KEY (`reviewed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL'
);

-- =============================================================================
-- 2) career_job_application_attachments
-- =============================================================================
CREATE TABLE IF NOT EXISTS `career_job_application_attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` INT NOT NULL,
  `career_job_application_id` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_attachment_application_id` (`career_job_application_id`),
  CONSTRAINT `FK_attachment_career_job_application`
    FOREIGN KEY (`career_job_application_id`)
    REFERENCES `career_job_applications`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3) recruiting_departments
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL,
  `name_ae` varchar(255) NOT NULL,
  `description_en` text DEFAULT NULL,
  `description_ae` text DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_departments_created_by` (`created_by`),
  KEY `FK_recruiting_departments_updated_by` (`updated_by`),
  KEY `FK_recruiting_departments_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_departments_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_departments_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_departments_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4) recruiting_interviews
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `interview_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interview_type` varchar(50) NOT NULL COMMENT 'in-person, phone, video',
  `notes` text DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0=Scheduled, 1=Completed, 2=Cancelled, 3=No-Show, 4=Rescheduled',
  `feedback` text DEFAULT NULL,
  `rating` tinyint DEFAULT NULL COMMENT '1-5 scale',
  `application_id` int NOT NULL,
  `interviewer_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_interviews_application` (`application_id`),
  KEY `FK_recruiting_interviews_interviewer` (`interviewer_id`),
  KEY `FK_recruiting_interviews_created_by` (`created_by`),
  CONSTRAINT `FK_recruiting_interviews_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`),
  CONSTRAINT `FK_recruiting_interviews_interviewer` FOREIGN KEY (`interviewer_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_interviews_created_by`  FOREIGN KEY (`created_by`)  REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5) recruiting_status_history
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_status` tinyint NOT NULL COMMENT '0=Pending, 1=Reviewing, 2=Shortlisted, 3=Interviewed, 4=Rejected, 5=Hired',
  `to_status` tinyint NOT NULL COMMENT '0=Pending, 1=Reviewing, 2=Shortlisted, 3=Interviewed, 4=Rejected, 5=Hired',
  `notes` text DEFAULT NULL,
  `application_id` int NOT NULL,
  `changed_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_status_history_application` (`application_id`),
  KEY `FK_recruiting_status_history_changed_by` (`changed_by`),
  CONSTRAINT `FK_recruiting_status_history_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_status_history_changed_by`  FOREIGN KEY (`changed_by`)     REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6) recruiting_application_ratings
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_application_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating` tinyint NOT NULL COMMENT '1-5 scale',
  `comments` text DEFAULT NULL,
  `application_id` int NOT NULL,
  `rated_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_application_ratings_application` (`application_id`),
  KEY `FK_recruiting_application_ratings_rated_by`    (`rated_by`),
  CONSTRAINT `FK_recruiting_application_ratings_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_application_ratings_rated_by`    FOREIGN KEY (`rated_by`)       REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7) recruiting_questionnaires
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_questionnaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `question_en` text NOT NULL,
  `question_ae` text DEFAULT NULL,
  `question_type` varchar(30) NOT NULL DEFAULT 'text' COMMENT 'text, yes_no, multiple_choice',
  `is_required` tinyint NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_questionnaires_job`        (`career_job_id`),
  KEY `FK_recruiting_questionnaires_created_by` (`created_by`),
  KEY `FK_recruiting_questionnaires_updated_by` (`updated_by`),
  KEY `FK_recruiting_questionnaires_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_questionnaires_job`        FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_questionnaires_created_by` FOREIGN KEY (`created_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_updated_by` FOREIGN KEY (`updated_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_deleted_by` FOREIGN KEY (`deleted_by`)    REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.b) Enrich recruiting_questionnaires with rich form-builder fields
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'options',
    "TEXT NULL COMMENT 'JSON array of {value,label_en,label_ae} for choice question types' AFTER `question_type`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'help_text_en',
    "VARCHAR(500) NULL AFTER `options`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'help_text_ae',
    "VARCHAR(500) NULL AFTER `help_text_en`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'placeholder_en',
    "VARCHAR(255) NULL AFTER `help_text_ae`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'placeholder_ae',
    "VARCHAR(255) NULL AFTER `placeholder_en`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'min_value',
    "INT NULL AFTER `placeholder_ae`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'max_value',
    "INT NULL AFTER `min_value`");
CALL _arc_add_column_if_missing('recruiting_questionnaires', 'category',
    "VARCHAR(60) NULL AFTER `max_value`");

-- =============================================================================
-- 8) recruiting_screening_keywords
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_screening_keywords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `keyword` varchar(150) NOT NULL,
  `keyword_type` varchar(20) NOT NULL DEFAULT 'optional' COMMENT 'must_have, optional, exclude',
  `weight` int NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_screening_keywords_job`        (`career_job_id`),
  KEY `FK_recruiting_screening_keywords_created_by` (`created_by`),
  KEY `FK_recruiting_screening_keywords_updated_by` (`updated_by`),
  KEY `FK_recruiting_screening_keywords_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_screening_keywords_job`        FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_screening_keywords_created_by` FOREIGN KEY (`created_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_updated_by` FOREIGN KEY (`updated_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_deleted_by` FOREIGN KEY (`deleted_by`)    REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9) recruiting_channel_postings
-- =============================================================================
CREATE TABLE IF NOT EXISTS `recruiting_channel_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `channel_name` varchar(50) NOT NULL COMMENT 'autostrad, indeed, linkedin, naukrigulf, facebook, instagram, tiktok',
  `external_post_id` varchar(150) DEFAULT NULL,
  `posting_status` varchar(30) NOT NULL DEFAULT 'queued' COMMENT 'queued, posted, failed, retrying',
  `status_message` text DEFAULT NULL,
  `last_synced_at` datetime DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_channel_postings_job`        (`career_job_id`),
  KEY `FK_recruiting_channel_postings_created_by` (`created_by`),
  KEY `FK_recruiting_channel_postings_updated_by` (`updated_by`),
  KEY `FK_recruiting_channel_postings_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_channel_postings_job`        FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_channel_postings_created_by` FOREIGN KEY (`created_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_updated_by` FOREIGN KEY (`updated_by`)    REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_deleted_by` FOREIGN KEY (`deleted_by`)    REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 10) admins.must_reset_password
-- =============================================================================
CALL _arc_add_column_if_missing('admins', 'must_reset_password',
    "TINYINT NOT NULL DEFAULT 0 AFTER `status`");

-- =============================================================================
-- 11) (OPTIONAL) Seed HR admin users
--     Temp password: Auto@2024  (bcrypt hash below)
--     must_reset_password = 1 forces password change on first login.
--
--     >>> COMMENT THIS BLOCK OUT IF YOU DO NOT WANT TO SEED USERS ON PROD <<<
-- =============================================================================
INSERT INTO `admins` (
  `type`, `first_name`, `last_name`, `email`, `password`,
  `country_code`, `phone_number`, `status`, `must_reset_password`,
  `created_at`, `updated_at`
) VALUES
(
  'hr_manager', 'Group', 'HRM',
  'grouphrm@mwasalat.ae',
  '$2b$10$by.i806FTnYiOWhl5rBtvu4TT4CxswuGT4y1hicQA6Ri14zI0hhoW',
  '+968', '00000000', 1, 1, NOW(), NOW()
),
(
  'hr_manager', 'Osamah', 'Kenawy',
  'osamah.kenawy@mwasalat.ae',
  '$2b$10$by.i806FTnYiOWhl5rBtvu4TT4CxswuGT4y1hicQA6Ri14zI0hhoW',
  '+971', '00000000', 1, 1, NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  `must_reset_password` = 1,
  `password`            = VALUES(`password`),
  `status`              = 1,
  `updated_at`          = NOW();

-- =============================================================================
-- Cleanup helper procedures
-- =============================================================================
DROP PROCEDURE IF EXISTS _arc_add_column_if_missing;
DROP PROCEDURE IF EXISTS _arc_add_index_if_missing;
DROP PROCEDURE IF EXISTS _arc_add_fk_if_missing;

-- =============================================================================
-- Verification (run manually after the script completes)
-- =============================================================================
-- SHOW TABLES LIKE 'recruiting_%';
-- SHOW TABLES LIKE 'career_job_application_attachments';
-- SHOW COLUMNS FROM career_job_applications LIKE 'ai_%';
-- SHOW COLUMNS FROM career_job_applications LIKE 'source_channel';
-- SHOW COLUMNS FROM admins LIKE 'must_reset_password';
-- SELECT id, email, type, status, must_reset_password
--   FROM admins WHERE type IN ('hr_manager','hr_recruitment');
