-- =============================================================================
-- Teachers Rental page CMS — IDEMPOTENT schema migration
--
-- Safe to run multiple times. Adds:
--   - `teachers_pages` table (singleton, id=1) for /:lang/teachers-rental.
--   - Extended fleet-card columns on `rates_teacher`.
--
-- In dev/staging (NODE_ENV != 'production') TypeORM `synchronize: true` will
-- create / alter these automatically. This script is for production rollout
-- (or to apply manually anywhere).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers — add column / FK only if missing.
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

DROP PROCEDURE IF EXISTS _arc_add_fk_if_missing;
DELIMITER $$
CREATE PROCEDURE _arc_add_fk_if_missing(
    IN tbl_name VARCHAR(64),
    IN fk_name  VARCHAR(64),
    IN fk_def   VARCHAR(1024)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA    = DATABASE()
          AND TABLE_NAME      = tbl_name
          AND CONSTRAINT_NAME = fk_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl_name, '` ADD CONSTRAINT `', fk_name, '` ', fk_def);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 1. teachers_pages (singleton CMS row, expected id = 1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teachers_pages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `status` TINYINT NOT NULL DEFAULT 1,

    `seo_title_en` VARCHAR(255) NULL,
    `seo_title_ae` VARCHAR(255) NULL,
    `seo_description_en` VARCHAR(500) NULL,
    `seo_description_ae` VARCHAR(500) NULL,
    `seo_meta_tags_en` VARCHAR(500) NULL,
    `seo_meta_tags_ae` VARCHAR(500) NULL,
    `seo_meta_description_en` VARCHAR(500) NULL,
    `seo_meta_description_ae` VARCHAR(500) NULL,
    `og_image` VARCHAR(255) NULL,
    `canonical_url` VARCHAR(500) NULL,

    `hero_en` JSON NULL,
    `hero_ae` JSON NULL,
    `hero_background_image` VARCHAR(255) NULL,

    `hero_price_card_en` JSON NULL,
    `hero_price_card_ae` JSON NULL,

    `stats_en` JSON NULL,
    `stats_ae` JSON NULL,

    `benefits_en` JSON NULL,
    `benefits_ae` JSON NULL,

    `eligibility_en` JSON NULL,
    `eligibility_ae` JSON NULL,
    `promotion_end_date` DATE NULL,

    `referral_en` JSON NULL,
    `referral_ae` JSON NULL,

    `fleet_section_en` JSON NULL,
    `fleet_section_ae` JSON NULL,

    `closing_quote_en` TEXT NULL,
    `closing_quote_ae` TEXT NULL,

    `enquiry_form_en` JSON NULL,
    `enquiry_form_ae` JSON NULL,

    `created_by` INT NULL,
    `updated_by` INT NULL,
    `deleted_by` INT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,

    PRIMARY KEY (`id`),
    KEY `fk_teachers_pages_created_by` (`created_by`),
    KEY `fk_teachers_pages_updated_by` (`updated_by`),
    KEY `fk_teachers_pages_deleted_by` (`deleted_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CALL _arc_add_fk_if_missing('teachers_pages','fk_teachers_pages_created_by',
    'FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL');
CALL _arc_add_fk_if_missing('teachers_pages','fk_teachers_pages_updated_by',
    'FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL');
CALL _arc_add_fk_if_missing('teachers_pages','fk_teachers_pages_deleted_by',
    'FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL');

-- -----------------------------------------------------------------------------
-- 2. rates_teacher  — extended fleet-card fields
-- -----------------------------------------------------------------------------
CALL _arc_add_column_if_missing('rates_teacher','display_order',       'INT NOT NULL DEFAULT 0');
CALL _arc_add_column_if_missing('rates_teacher','is_featured',         'TINYINT NOT NULL DEFAULT 0');
CALL _arc_add_column_if_missing('rates_teacher','currency',            'VARCHAR(10) NOT NULL DEFAULT ''AED''');
CALL _arc_add_column_if_missing('rates_teacher','original_rate',       'FLOAT(10, 2) NULL');
CALL _arc_add_column_if_missing('rates_teacher','discount_badge',      'VARCHAR(100) NULL');
CALL _arc_add_column_if_missing('rates_teacher','rate_by_duration',    'JSON NULL');
CALL _arc_add_column_if_missing('rates_teacher','available_durations', 'JSON NULL');
CALL _arc_add_column_if_missing('rates_teacher','mileage_per_month',   'INT NULL');
CALL _arc_add_column_if_missing('rates_teacher','deposit_amount',      'FLOAT(10, 2) NULL');
CALL _arc_add_column_if_missing('rates_teacher','cta_label_en',        'VARCHAR(100) NULL');
CALL _arc_add_column_if_missing('rates_teacher','cta_label_ae',        'VARCHAR(100) NULL');
CALL _arc_add_column_if_missing('rates_teacher','tagline_en',          'VARCHAR(255) NULL');
CALL _arc_add_column_if_missing('rates_teacher','tagline_ae',          'VARCHAR(255) NULL');
CALL _arc_add_column_if_missing('rates_teacher','features_en',         'JSON NULL');
CALL _arc_add_column_if_missing('rates_teacher','features_ae',         'JSON NULL');
CALL _arc_add_column_if_missing('rates_teacher','updated_by',          'INT NULL');
CALL _arc_add_column_if_missing('rates_teacher','updated_at',          'DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6)');

CALL _arc_add_fk_if_missing('rates_teacher','fk_rates_teacher_updated_by',
    'FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL');

-- -----------------------------------------------------------------------------
-- 3. Seed the singleton row (id=1) so admin GET always returns something.
-- -----------------------------------------------------------------------------
INSERT INTO `teachers_pages` (`id`, `status`)
SELECT 1, 1
WHERE NOT EXISTS (SELECT 1 FROM `teachers_pages` WHERE `id` = 1);

-- -----------------------------------------------------------------------------
-- Cleanup helpers.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS _arc_add_column_if_missing;
DROP PROCEDURE IF EXISTS _arc_add_fk_if_missing;
