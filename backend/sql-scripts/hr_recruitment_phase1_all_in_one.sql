-- =============================================================================
-- HR Recruitment Portal - Phase 1 All-in-One Idempotent SQL Migration
-- Includes:
--   1) source_channel on career_job_applications
--   2) recruiting_questionnaires table
--   3) recruiting_screening_keywords table
--   4) recruiting_channel_postings table
-- Safe to run multiple times.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS _arc_add_column_if_missing;
DELIMITER $$
CREATE PROCEDURE _arc_add_column_if_missing(
    IN tbl_name VARCHAR(64),
    IN col_name VARCHAR(64),
    IN col_def  VARCHAR(1024)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl_name
          AND COLUMN_NAME  = col_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 1) source_channel on applications
-- -----------------------------------------------------------------------------
CALL _arc_add_column_if_missing(
    'career_job_applications',
    'source_channel',
    "VARCHAR(30) NOT NULL DEFAULT 'autostrad' AFTER `cv`"
);

-- -----------------------------------------------------------------------------
-- 2) recruiting_questionnaires
-- -----------------------------------------------------------------------------
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
  KEY `FK_recruiting_questionnaires_job` (`career_job_id`),
  KEY `FK_recruiting_questionnaires_created_by` (`created_by`),
  KEY `FK_recruiting_questionnaires_updated_by` (`updated_by`),
  KEY `FK_recruiting_questionnaires_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_questionnaires_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_questionnaires_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3) recruiting_screening_keywords
-- -----------------------------------------------------------------------------
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
  KEY `FK_recruiting_screening_keywords_job` (`career_job_id`),
  KEY `FK_recruiting_screening_keywords_created_by` (`created_by`),
  KEY `FK_recruiting_screening_keywords_updated_by` (`updated_by`),
  KEY `FK_recruiting_screening_keywords_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_screening_keywords_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_screening_keywords_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4) recruiting_channel_postings
-- -----------------------------------------------------------------------------
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
  KEY `FK_recruiting_channel_postings_job` (`career_job_id`),
  KEY `FK_recruiting_channel_postings_created_by` (`created_by`),
  KEY `FK_recruiting_channel_postings_updated_by` (`updated_by`),
  KEY `FK_recruiting_channel_postings_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_channel_postings_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_channel_postings_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Cleanup helper
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS _arc_add_column_if_missing;
