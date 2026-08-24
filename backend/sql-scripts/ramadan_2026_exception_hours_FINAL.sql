-- ============================================================================
-- Ramadan 2026 Exception Hours - FINAL CORRECTED
-- Ramadan Period: 2026-02-15 to 2026-03-30
-- 
-- Data Source: Authoritative Master Spreadsheet (All 78 Locations)
-- Time Format: HH:MM (24-hour), decimals for minutes (23.75 = 23:45)
-- Break Format: shift 1 = morning hours, shift 2 = evening hours (after break)
-- Day Mapping: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
-- day=NULL means same hours apply to ALL days in the range
-- ============================================================================

-- Step 0: Ensure day column is nullable
ALTER TABLE `location_opening_hour_exceptions` MODIFY COLUMN `day` TINYINT NULL;

-- Step 1: Remove any previous Ramadan 2026 entries
DELETE FROM location_opening_hour_exceptions 
WHERE start_date = '2026-02-15' AND end_date = '2026-03-30' AND id > 0;

SET @start_date = '2026-02-15';
SET @end_date = '2026-03-30';
SET @created_by = 1;

-- ============================================================================
-- PATTERN A: OPEN 24 HOURS (All Days)
-- IDs: 13, 14, 15, 16, 18 (Airport Terminals & T3 Parking)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(13, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(14, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(15, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(16, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(18, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by);

-- ============================================================================
-- PATTERN B: 09:00-23:00 (All Days)
-- IDs: 1 (Airport Road), 27 (Al Wahda Mall), 28 (Khalidiya Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(1, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by),
(27, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by),
(28, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by);

-- ============================================================================
-- PATTERN C: 11:00-23:45 (All Days)
-- IDs: 3 (Abu Dhabi Mall), 5 (Al Dhannah Mall/Ruwais)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(3, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by),
(5, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN D: 11:00-23:45 (All Days)
-- ID: 4 (WTC Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(4, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN E: 09:00-18:00 / 20:00-23:00 (Mon-Sat Only, CLOSED Sunday)
-- ID: 6 (Al Ain)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
-- Monday to Saturday
(6, @start_date, @end_date, 2, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 2, 2, 20, 23, 0, @created_by),
(6, @start_date, @end_date, 3, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 3, 2, 20, 23, 0, @created_by),
(6, @start_date, @end_date, 4, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 4, 2, 20, 23, 0, @created_by),
(6, @start_date, @end_date, 5, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 5, 2, 20, 23, 0, @created_by),
(6, @start_date, @end_date, 6, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 6, 2, 20, 23, 0, @created_by),
(6, @start_date, @end_date, 7, 1, 9, 18, 0, @created_by),
(6, @start_date, @end_date, 7, 2, 20, 23, 0, @created_by),
-- Sunday - CLOSED
(6, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN F: 09:00-18:00 / 19:00-22:00 (All Days)
-- ID: 7 (Umm Ramool, Near DXB Airport)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(7, @start_date, @end_date, NULL, 1, 9, 18, 0, @created_by),
(7, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by);

-- ============================================================================
-- PATTERN G: 09:00-18:00 / 19:00-21:00 (Mon-Sat Only, CLOSED Sunday)
-- ID: 8 (Sharjah)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
-- Monday to Saturday
(8, @start_date, @end_date, 2, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 2, 2, 19, 21, 0, @created_by),
(8, @start_date, @end_date, 3, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 3, 2, 19, 21, 0, @created_by),
(8, @start_date, @end_date, 4, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 4, 2, 19, 21, 0, @created_by),
(8, @start_date, @end_date, 5, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 5, 2, 19, 21, 0, @created_by),
(8, @start_date, @end_date, 6, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 6, 2, 19, 21, 0, @created_by),
(8, @start_date, @end_date, 7, 1, 9, 18, 0, @created_by),
(8, @start_date, @end_date, 7, 2, 19, 21, 0, @created_by),
-- Sunday - CLOSED
(8, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN H: 10:00-15:00 (Mon-Sat Only, CLOSED Sunday)
-- IDs: 9, 10, 11, 19, 20, 21, 22, 23, 39, 40, 41, 42, 66
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
-- Location 9 (Fujairah)
(9, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 10 (Al Jazah Street, RAK)
(10, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 11 (Sheikh Zayed Road)
(11, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 19 (RAK Int'l Airport M&G)
(19, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 20 (Rixos Al Mairid, RAK)
(20, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 21 (Al Hamrah Village, RAK)
(21, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 22 (Al Hamrah Mall, RAK)
(22, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 23 (Al Hamra Fort, RAK)
(23, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(23, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 39 (Al Bahar Hotel and Resort)
(39, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 40 (Palace Beach Resort Fujairah)
(40, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 41 (Fujairah Port)
(41, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(41, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 42 (Fujairah City Center)
(42, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(42, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 66 (Grosvenor Business Tower)
(66, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(66, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN I: 09:00-17:00 (Mon-Sat Only, CLOSED Sunday)
-- IDs: 2, 32, 33, 34, 35, 36
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
-- Location 2 (Musaffah)
(2, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 32 (Capital Mall)
(32, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 33 (Mazyad Mall)
(33, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 34 (Dalma Mall)
(34, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 35 (Safeer Mall)
(35, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(35, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
-- Location 36 (Rabdan Mall)
(36, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(36, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN J: 10:00-23:00 (Mon-Sat) / 09:00-23:00 (Sunday)
-- ID: 17 (Abu Dhabi International Airport - Meet & Greet)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
-- Monday to Saturday
(17, @start_date, @end_date, 2, 1, 10, 23, 0, @created_by),
(17, @start_date, @end_date, 3, 1, 10, 23, 0, @created_by),
(17, @start_date, @end_date, 4, 1, 10, 23, 0, @created_by),
(17, @start_date, @end_date, 5, 1, 10, 23, 0, @created_by),
(17, @start_date, @end_date, 6, 1, 10, 23, 0, @created_by),
(17, @start_date, @end_date, 7, 1, 10, 23, 0, @created_by),
-- Sunday (different)
(17, @start_date, @end_date, 1, 1, 9, 23, 0, @created_by);

-- ============================================================================
-- PATTERN K: 11:00-23:45 (All Days)
-- ID: 43 (Yas Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(43, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN L: 12:00-18:00 / 19:00-23:00 (All Days)
-- IDs: 24, 25, 37, 38
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(24, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(24, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(25, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(25, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(37, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(37, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(38, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(38, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by);

-- ============================================================================
-- PATTERN M: 12:00-18:00 / 19:00-21:00 (All Days)
-- IDs: 44, 45, 55, 56, 57, 58, 60, 61, 64, 67, 68, 70, 71, 72, 73, 74, 76, 77
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(44, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(44, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(45, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(45, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(55, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(55, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(56, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(56, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(57, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(57, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(58, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(58, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(60, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(60, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(61, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(61, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(64, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(64, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(67, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(67, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(68, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(68, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(70, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(70, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(71, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(71, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(72, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(72, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(73, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(73, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(74, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(74, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(76, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(76, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(77, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(77, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by);

-- ============================================================================
-- PATTERN N: 11:00-23:45 (All Days)
-- IDs: 29, 30, 31
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(29, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by),
(30, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by),
(31, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN O: 11:00-18:00 / 19:00-22:00 (All Days) 
-- IDs: 46, 47, 48, 49, 50, 51, 52, 53, 54, 59, 62, 63, 65, 69, 75, 78
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(46, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(46, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(47, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(47, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(48, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(48, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(49, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(49, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(50, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(50, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(51, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(51, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(52, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(52, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(53, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(53, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(54, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(54, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(59, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(59, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(62, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(62, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(63, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(63, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(65, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(65, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(69, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(69, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(75, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(75, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(78, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(78, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by);

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================
-- Total records should be inserted (verify this matches expected count)
SELECT COUNT(*) AS total_ramadan_records, 
       COUNT(DISTINCT location_id) AS unique_locations,
       MIN(start_date) AS period_start,
       MAX(end_date) AS period_end
FROM location_opening_hour_exceptions 
WHERE start_date = @start_date AND end_date = @end_date AND deleted_at IS NULL;

-- ============================================================================
-- ROLLBACK (if needed - uncomment to execute):
-- DELETE FROM location_opening_hour_exceptions 
-- WHERE start_date = '2026-02-15' AND end_date = '2026-03-30' AND id > 0;
-- ============================================================================
