-- =====================================================
-- Migration: Add Special Rates feature fields to cars table
-- =====================================================
-- Date: 2026-01-15
-- Description: Adds special_rates_emirates (JSON) and special_rates_image columns 
--              to support the Special Rates feature where cars can have a special
--              main image displayed when customers select certain emirates.
-- =====================================================
--
-- FEATURE OVERVIEW:
-- - Admin can select MULTIPLE emirates (or ALL) for a car
-- - Admin uploads a special image that REPLACES the main car image
-- - When customer selects one of those emirates, they see the special image
--
-- JSON FORMAT for special_rates_emirates:
-- - { "all": true }                      - Special image shown for ALL emirates
-- - { "all": false, "ids": [1, 2, 3] }   - Special image shown only for emirates 1, 2, 3
-- - NULL                                 - Feature disabled (default car image shown)
--
-- =====================================================

-- =====================================================
-- STEP 1: Add New Columns
-- =====================================================

-- Add special_rates_emirates column (JSON)
-- Stores which emirates should show the special image
ALTER TABLE `cars` 
ADD COLUMN `special_rates_emirates` JSON NULL DEFAULT NULL 
AFTER `featured`;

-- Add special_rates_image column for storing the special image filename
-- This image replaces the main car image when emirate matches
ALTER TABLE `cars` 
ADD COLUMN `special_rates_image` VARCHAR(255) NULL DEFAULT NULL 
AFTER `special_rates_emirates`;

-- =====================================================
-- STEP 2: Add Index for Special Rates Feature
-- =====================================================

-- Note: JSON columns in MySQL can use generated columns for indexing if needed
-- For now, the query will use the status index and filter in application code
-- If performance becomes an issue, consider adding a virtual generated column

-- =====================================================
-- STEP 3: Verify Changes
-- =====================================================

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'cars'
  AND COLUMN_NAME IN ('special_rates_emirates', 'special_rates_image');

-- =====================================================
-- STEP 4: Example Data (DO NOT RUN - FOR REFERENCE ONLY)
-- =====================================================

-- Example: Set special image for ALL emirates
-- UPDATE cars SET 
--   special_rates_emirates = '{"all": true}',
--   special_rates_image = 'special-20260115-123456789.jpg'
-- WHERE id = 1;

-- Example: Set special image for specific emirates (Dubai, Abu Dhabi, Sharjah)
-- UPDATE cars SET 
--   special_rates_emirates = '{"all": false, "ids": [1, 2, 3]}',
--   special_rates_image = 'special-20260115-987654321.jpg'
-- WHERE id = 2;

-- Example: Disable special rates for a car (remove special image)
-- UPDATE cars SET 
--   special_rates_emirates = NULL,
--   special_rates_image = NULL
-- WHERE id = 3;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- ALTER TABLE `cars` DROP COLUMN `special_rates_image`;
-- ALTER TABLE `cars` DROP COLUMN `special_rates_emirates`;

