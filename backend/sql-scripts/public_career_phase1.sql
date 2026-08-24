-- =============================================================================
-- Public Career Site — Phase 1 Migration (Idempotent, MySQL 5.7+)
-- =============================================================================
-- Adds:
--   1. career_jobs.slug                  VARCHAR(180) UNIQUE
--   2. career_jobs.image_url             VARCHAR(500) NULL
--   3. career_job_applications.current_location, expected_salary,
--      notice_period_days
--   4. career_job_application_answers    table (JSON answers per application)
--   5. career_job_views                  table (UTM-tagged share-click log)
--   6. Backfill slugs for existing rows
-- =============================================================================

DROP PROCEDURE IF EXISTS _arc_pcp_add_column_if_missing;
DROP PROCEDURE IF EXISTS _arc_pcp_add_index_if_missing;

DELIMITER $$

CREATE PROCEDURE _arc_pcp_add_column_if_missing(
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

CREATE PROCEDURE _arc_pcp_add_index_if_missing(
    IN tbl VARCHAR(64),
    IN idx VARCHAR(64),
    IN definition VARCHAR(2048)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND INDEX_NAME   = idx
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD ', definition);
        PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
END $$

DELIMITER ;

-- 1. career_jobs new columns
CALL _arc_pcp_add_column_if_missing('career_jobs', 'slug',
    "VARCHAR(180) NULL AFTER `title_ae`");
CALL _arc_pcp_add_column_if_missing('career_jobs', 'image_url',
    "VARCHAR(500) NULL AFTER `slug`");

-- 2. Backfill slugs for existing rows where slug IS NULL.
--    MySQL 5.7 has no REGEXP_REPLACE, so we build the slug in a stored
--    procedure that walks each row and each character.
DROP PROCEDURE IF EXISTS _arc_pcp_backfill_slugs;

DELIMITER $$

CREATE PROCEDURE _arc_pcp_backfill_slugs()
BEGIN
    DECLARE done       INT DEFAULT 0;
    DECLARE v_id       INT;
    DECLARE v_title    VARCHAR(255);
    DECLARE v_slug     VARCHAR(180);
    DECLARE v_char     CHAR(1);
    DECLARE v_pos      INT;
    DECLARE v_len      INT;

    DECLARE cur CURSOR FOR
        SELECT id, COALESCE(title_en, '')
        FROM career_jobs
        WHERE slug IS NULL OR slug = '';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_id, v_title;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        -- Pre-clean: lowercase, replace common substitutions
        SET v_title = LOWER(v_title);
        SET v_title = REPLACE(v_title, '&', ' and ');
        SET v_title = REPLACE(v_title, '/', ' ');
        SET v_title = REPLACE(v_title, '_', ' ');
        SET v_title = REPLACE(v_title, '.', ' ');

        -- Walk character-by-character: keep [a-z0-9], turn anything else into '-'.
        SET v_slug = '';
        SET v_pos = 1;
        SET v_len = CHAR_LENGTH(v_title);
        WHILE v_pos <= v_len DO
            SET v_char = SUBSTRING(v_title, v_pos, 1);
            IF (v_char REGEXP '[a-z0-9]') THEN
                SET v_slug = CONCAT(v_slug, v_char);
            ELSE
                -- Avoid runs of dashes
                IF (RIGHT(v_slug, 1) <> '-') THEN
                    SET v_slug = CONCAT(v_slug, '-');
                END IF;
            END IF;
            SET v_pos = v_pos + 1;
        END WHILE;

        -- Trim leading/trailing dashes, ensure non-empty base
        SET v_slug = TRIM(BOTH '-' FROM v_slug);
        IF v_slug = '' THEN
            SET v_slug = 'job';
        END IF;

        -- Final shape: <base>-<id>, capped at 180 chars
        SET v_slug = CONCAT(LEFT(v_slug, 170), '-', v_id);

        UPDATE career_jobs SET slug = v_slug WHERE id = v_id;
    END LOOP;
    CLOSE cur;
END $$

DELIMITER ;

CALL _arc_pcp_backfill_slugs();
DROP PROCEDURE IF EXISTS _arc_pcp_backfill_slugs;

-- 3. Unique index on slug (after backfill so it does not collide on NULLs)
CALL _arc_pcp_add_index_if_missing(
    'career_jobs',
    'UQ_career_jobs_slug',
    'UNIQUE KEY `UQ_career_jobs_slug` (`slug`)'
);

-- 4. career_job_applications optional candidate fields
CALL _arc_pcp_add_column_if_missing('career_job_applications', 'current_location',
    "VARCHAR(120) NULL AFTER `email`");
CALL _arc_pcp_add_column_if_missing('career_job_applications', 'expected_salary',
    "DECIMAL(10,2) NULL AFTER `current_location`");
CALL _arc_pcp_add_column_if_missing('career_job_applications', 'notice_period_days',
    "INT NULL AFTER `expected_salary`");

-- 5. career_job_application_answers — stores dynamic questionnaire answers
CREATE TABLE IF NOT EXISTS `career_job_application_answers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `career_job_application_id` INT NOT NULL,
  `questionnaire_id` INT NOT NULL,
  `answer` TEXT NULL COMMENT 'Free text or JSON-encoded array (multi-choice)',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_application_answer_app`  (`career_job_application_id`),
  KEY `IDX_application_answer_q`    (`questionnaire_id`),
  CONSTRAINT `FK_application_answer_app`
    FOREIGN KEY (`career_job_application_id`) REFERENCES `career_job_applications`(`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_application_answer_q`
    FOREIGN KEY (`questionnaire_id`) REFERENCES `recruiting_questionnaires`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. career_job_views — UTM-tagged share-click log
CREATE TABLE IF NOT EXISTS `career_job_views` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `career_job_id` INT NOT NULL,
  `utm_source`   VARCHAR(60) NULL,
  `utm_medium`   VARCHAR(60) NULL,
  `utm_campaign` VARCHAR(60) NULL,
  `referrer`     VARCHAR(500) NULL,
  `ip_hash`      VARCHAR(64) NULL,
  `user_agent`   VARCHAR(500) NULL,
  `created_at`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_career_job_views_job`        (`career_job_id`),
  KEY `IDX_career_job_views_source`     (`utm_source`),
  KEY `IDX_career_job_views_created_at` (`created_at`),
  CONSTRAINT `FK_career_job_views_job`
    FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cleanup helpers
DROP PROCEDURE IF EXISTS _arc_pcp_add_column_if_missing;
DROP PROCEDURE IF EXISTS _arc_pcp_add_index_if_missing;

-- Verification:
-- SHOW COLUMNS FROM career_jobs LIKE 'slug';
-- SHOW COLUMNS FROM career_jobs LIKE 'image_url';
-- SHOW INDEX FROM career_jobs WHERE Key_name = 'UQ_career_jobs_slug';
-- SHOW COLUMNS FROM career_job_applications LIKE 'current_location';
-- SHOW TABLES LIKE 'career_job_application_answers';
-- SHOW TABLES LIKE 'career_job_views';
-- SELECT id, slug FROM career_jobs LIMIT 10;
