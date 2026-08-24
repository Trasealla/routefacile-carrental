-- ============================================================================
-- Add AI screening columns to career_job_applications (MySQL 5.7 compatible)
-- ============================================================================

DROP PROCEDURE IF EXISTS _arc_add_screening_columns;
DELIMITER //
CREATE PROCEDURE _arc_add_screening_columns()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'career_job_applications'
          AND COLUMN_NAME  = 'ai_score'
    ) THEN
        ALTER TABLE `career_job_applications`
            ADD COLUMN `ai_score` DECIMAL(5,2) NULL AFTER `admin_notes`;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'career_job_applications'
          AND COLUMN_NAME  = 'ai_status'
    ) THEN
        ALTER TABLE `career_job_applications`
            ADD COLUMN `ai_status` VARCHAR(20) NULL AFTER `ai_score`;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'career_job_applications'
          AND COLUMN_NAME  = 'ai_match_summary'
    ) THEN
        ALTER TABLE `career_job_applications`
            ADD COLUMN `ai_match_summary` TEXT NULL AFTER `ai_status`;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'career_job_applications'
          AND COLUMN_NAME  = 'ai_screened_at'
    ) THEN
        ALTER TABLE `career_job_applications`
            ADD COLUMN `ai_screened_at` DATETIME NULL AFTER `ai_match_summary`;
    END IF;
END //
DELIMITER ;
CALL _arc_add_screening_columns();
DROP PROCEDURE IF EXISTS _arc_add_screening_columns;

-- Helpful indexes for filtering by AI verdict
CREATE INDEX `idx_career_job_apps_ai_status` ON `career_job_applications` (`ai_status`);
CREATE INDEX `idx_career_job_apps_ai_score` ON `career_job_applications` (`ai_score`);
