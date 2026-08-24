-- ============================================
-- SQL Script to Insert All Locations to Stage
-- ============================================
-- This script inserts locations WITHOUT preserving original IDs
-- Location IDs will be auto-generated
-- 
-- IMPORTANT: After running this script, you'll need to update location_opening_hours
-- with the correct location_id values using LAST_INSERT_ID() or by matching on name/lat/long
-- ============================================

-- Step 1: Insert all locations
-- Step 2: Insert opening hours (you'll need to map location IDs)

-- ============================================
-- STEP 1: INSERT LOCATIONS
-- ============================================

SET @start_location_id = (SELECT COALESCE(MAX(id), 0) + 1 FROM locations);

INSERT INTO `locations` (
    `name_en`, `name_ae`, `address_en`, `address_ae`, `status`, `order`, 
    `buffer_hours`, `pickup`, `dropoff`, `is_virtual`, `recipients`, 
    `lat`, `long`, `contact_number`, `timing_detail_en`, `timing_detail_ae`, 
    `parking_charges`, `emirate_id`, `created_by`, `updated_by`, `deleted_by`, 
    `created_at`, `updated_at`, `deleted_at`
) VALUES
('Airport Road', 'شارع المطار', 'Airport Road, Near Al-Wahda Mall, Abu Dhabi, United Arab Emirates', 'شارع المطار، بالقرب من مول الوحدة، أبوظبي', 1, 50, 1, 1, 1, 0, '["airportroad@autostrad.com","mohammed.kunhi@autostrad.com","mohamed.reda@autostrad.com"]', '24.46429029111838', '54.375636248815184', '+971 2 445 9298', 'Monday to Sunday -\r 8:00 - 23:00', 'طوال الأسبوع \r\nمن الساعة08:00 إلى 23:00', 0, 2, 1, 3, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL),
('Musaffah', 'المصفح', 'Musaffah Industrial 2, Musaffah, Abu Dhabi, United Arab Emirates', 'المنطقة الثانية، المصفح الصناعية، أبوظبي', 1, 51, 1, 1, 1, 0, '["musaffah@autostrad.com","mohammed.kunhi@autostrad.com","mohamed.reda@autostrad.com"]', '24.374734995943744', '54.51993905699098', '+971 2 8152652', 'Monday to Saturday 08:00 - 20:00 - Sunday: Closed', 'الإثنين للسبت08:00 - 17:00يوم الأحد مغلق', 0, 2, 1, 3, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL),
('Abu Dhabi Mall', 'مول أبو ظبي', 'Ground Floor, Abu Dhabi Mall, Abu Dhabi, United Arab Emirates', 'الدور الأرضي، مول أبوظبي، أبوظبي', 1, 47, 1, 1, 1, 0, '["abudhabimall@autostrad.com","mohammed.kunhi@autostrad.com","mohamed.reda@autostrad.com"]', '24.49602170955715', '54.38318297943247', '+971 2 645 7200', 'Monday to Saturday 8:00 - 22:00  -  Sunday 10:00 - 23:00', 'الإثنين للسبت08:00 - 23:00الأحدمن 10:00 - 23:00', 0, 2, 1, 3, NULL, '2024-06-10 13:27:02', '2025-11-11 12:21:14', NULL);

-- NOTE: Add remaining 74 locations here following the same pattern
-- Due to length constraints, I recommend using the Python script to generate the complete SQL

-- ============================================
-- STEP 2: INSERT OPENING HOURS
-- ============================================
-- After inserting locations, you need to insert opening hours
-- Use LAST_INSERT_ID() or match by location name/lat/long to get the new location_id

-- Example for first location (Airport Road):
-- Assuming the new location_id is @start_location_id

-- INSERT INTO `location_opening_hours` (
--     `day`, `shift`, `from_hours`, `to_hours`, `is_closed`, 
--     `location_id`, `created_by`, `updated_by`, `deleted_by`, 
--     `created_at`, `updated_at`, `deleted_at`
-- ) VALUES
-- -- Sunday (Day 1)
-- (1, 1, 8, 23, 0, @start_location_id, 1, NULL, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL),
-- (1, 2, 0, 0, 0, @start_location_id, 1, NULL, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL),
-- -- Monday (Day 2)
-- (2, 1, 8, 23, 0, @start_location_id, 1, NULL, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL),
-- (2, 2, 0, 0, 0, @start_location_id, 1, NULL, NULL, '2024-06-10 13:27:02', '2025-07-28 07:34:45', NULL);
-- ... continue for all 7 days (14 records total per location)

-- ============================================
-- RECOMMENDED APPROACH
-- ============================================
-- 1. Use the Python script: python generate_sql_from_json.py --file locations.json > complete_insert.sql
-- 2. Review the generated SQL
-- 3. Execute on stage database
-- 4. Verify data integrity



