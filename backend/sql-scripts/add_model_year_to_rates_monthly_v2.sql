-- ============================================================================
-- Migration: Add model_year column to rates_monthly_v2
-- Purpose: Enable different monthly pricing based on vehicle year model
-- Date: 2026-01-26
-- 
-- DESCRIPTION:
-- This migration adds a new 'model_year' column to the rates_monthly_v2 table
-- to allow configuring different monthly rates for the same car model based on
-- the vehicle's year (e.g., Toyota Camry 2023 vs 2024 vs 2025).
--
-- The existing 'year' column remains as the CALENDAR/RATE YEAR.
-- The new 'model_year' column represents the VEHICLE MODEL YEAR.
--
-- BACKWARD COMPATIBILITY:
-- - model_year is nullable to maintain backward compatibility
-- - When model_year is NULL, the rate applies to ALL vehicle years
-- - When model_year is set, the rate only applies to matching vehicle years
-- ============================================================================

-- Step 1: Add the model_year column (nullable for backward compatibility)
ALTER TABLE `rates_monthly_v2` 
ADD COLUMN `model_year` INT NULL COMMENT 'Vehicle model year (e.g., 2023, 2024, 2025). NULL means rate applies to all years.' 
AFTER `year`;

-- Step 2: Add an index for better query performance when filtering by model_year
CREATE INDEX `idx_rates_monthly_v2_model_year` ON `rates_monthly_v2` (`model_year`);

-- Step 3: Add a composite index for common query patterns
CREATE INDEX `idx_rates_monthly_v2_car_emirate_model_year` 
ON `rates_monthly_v2` (`car_id`, `emirate_id`, `model_year`, `months`, `mileage`);

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- ============================================================================

-- Check the new column structure:
-- DESCRIBE rates_monthly_v2;

-- Verify existing data still works (model_year should be NULL for existing records):
-- SELECT id, car_id, emirate_id, year, model_year, months, rate 
-- FROM rates_monthly_v2 
-- WHERE deleted_at IS NULL 
-- LIMIT 10;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- DROP INDEX `idx_rates_monthly_v2_car_emirate_model_year` ON `rates_monthly_v2`;
-- DROP INDEX `idx_rates_monthly_v2_model_year` ON `rates_monthly_v2`;
-- ALTER TABLE `rates_monthly_v2` DROP COLUMN `model_year`;

