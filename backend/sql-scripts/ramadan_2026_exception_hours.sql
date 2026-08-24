-- ============================================================================
-- Ramadan 2026 Exception Hours for ALL Locations (AUH + DXB)
-- Ramadan Period: 2026-02-15 to 2026-03-30
-- UPDATED with all 76 locations and correct timings
-- 
-- Day mapping: Sunday=1, Monday=2, Tuesday=3, Wednesday=4, Thursday=5, Friday=6, Saturday=7
-- day=NULL means the timing applies to ALL days in the range
-- When day-specific records exist, they take priority over day=NULL records
-- Multiple shifts represent breaks between operating hours
-- ============================================================================

-- Step 0: Make day column nullable (if not already)
ALTER TABLE `location_opening_hour_exceptions` MODIFY COLUMN `day` TINYINT NULL;

-- Step 1: Remove any previous Ramadan entries (safety)
-- Note: Using id > 0 to comply with MySQL safe mode (requires KEY column in WHERE)
DELETE FROM location_opening_hour_exceptions 
WHERE start_date = '2026-02-15' AND end_date = '2026-03-30' AND id > 0;

SET @start_date = '2026-02-15';
SET @end_date = '2026-03-30';
SET @created_by = 1;

-- ============================================================================
-- PATTERN A: OPEN 24 HOURS (all days)
-- IDs: 13, 14, 15, 17 (Airport terminals)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(13, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(14, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(15, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(17, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by);

-- ============================================================================
-- PATTERN B: 09:00-23:00 (all days)
-- IDs: 1 (Airport Road), 25 (Al Wahda Mall), 26 (Khalidiya Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(1, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by),
(25, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by),
(26, @start_date, @end_date, NULL, 1, 9, 23, 0, @created_by);

-- ============================================================================
-- PATTERN C: 11:00-23:45 (all days)
-- IDs: 3 (Abu Dhabi Mall), 5 (Al Dhannah Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(3, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by),
(5, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN D: 11:00-23:45 (all days)
-- ID: 4 (WTC Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(4, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN E: 09:00-18:00 / 20:00-23:00 Mon-Sat, CLOSED Sunday
-- ID: 6 (Al Ain)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
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
(6, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN F: 09:00-18:00 / 19:00-22:00 (all days)
-- ID: 7 (Umm Ramool)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(7, @start_date, @end_date, NULL, 1, 9, 18, 0, @created_by),
(7, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by);

-- ============================================================================
-- PATTERN G: 09:00-18:00 / 19:00-21:00 Mon-Sat, CLOSED Sunday
-- ID: 8 (Sharjah)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
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
(8, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN H: 10:00-15:00 Mon-Sat, CLOSED Sunday
-- IDs: 9, 10, 11, 18, 19, 20, 21, 22, 37, 38, 39, 40, 64
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(9, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(9, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(10, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(10, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(11, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(11, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(18, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(18, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(19, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(19, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(20, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(20, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(21, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(21, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(22, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(22, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(37, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(37, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(38, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(38, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(39, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(39, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(40, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(40, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(64, @start_date, @end_date, 2, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 3, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 4, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 5, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 6, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 7, 1, 10, 15, 0, @created_by),
(64, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN I: 09:00-17:00 Mon-Sat, CLOSED Sunday
-- IDs: 2, 30, 31, 32, 33, 34
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(2, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(2, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(30, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(30, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(31, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(31, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(32, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(32, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(33, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(33, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by),
(34, @start_date, @end_date, 2, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 3, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 4, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 5, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 6, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 7, 1, 9, 17, 0, @created_by),
(34, @start_date, @end_date, 1, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- PATTERN J: 10:00-23:00 Mon-Sat / 09:00-23:00 Sunday
-- ID: 16 (Abu Dhabi International Airport - Meet & Greet)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(16, @start_date, @end_date, 2, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 3, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 4, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 5, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 6, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 7, 1, 10, 23, 0, @created_by),
(16, @start_date, @end_date, 1, 1, 9, 23, 0, @created_by);

-- ============================================================================
-- PATTERN K: 11:00-23:45 (all days)
-- ID: 41 (Yas Mall)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(41, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN L: 12:00-18:00 / 19:00-23:00 (all days)
-- IDs: 23, 24, 35, 36
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(23, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(23, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(24, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(24, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(35, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(35, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by),
(36, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(36, @start_date, @end_date, NULL, 2, 19, 23, 0, @created_by);

-- ============================================================================
-- PATTERN M: 12:00-18:00 / 19:00-21:00 (all days)
-- IDs: 42, 43, 44, 45, 55, 56, 58, 59, 62, 65, 66, 68, 69, 70, 71, 72, 74, 75
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(42, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(42, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(43, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(43, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(44, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(44, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(45, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(45, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(55, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(55, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(56, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(56, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(58, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(58, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(59, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(59, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(62, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(62, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(65, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(65, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(66, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(66, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(68, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(68, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(69, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(69, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(70, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(70, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(71, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(71, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(72, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(72, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(74, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(74, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by),
(75, @start_date, @end_date, NULL, 1, 12, 18, 0, @created_by),
(75, @start_date, @end_date, NULL, 2, 19, 21, 0, @created_by);

-- ============================================================================
-- PATTERN N: 11:00-23:45 (all days)
-- IDs: 28, 29
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(28, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by),
(29, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- PATTERN O: 11:00-18:00 / 19:00-22:00 (all days)
-- IDs: 46, 47, 48, 49, 50, 51, 52, 53, 54, 57, 60, 61, 63, 67, 73, 76
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
(57, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(57, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(60, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(60, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(61, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(61, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(63, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(63, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(67, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(67, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(73, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(73, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by),
(76, @start_date, @end_date, NULL, 1, 11, 18, 0, @created_by),
(76, @start_date, @end_date, NULL, 2, 19, 22, 0, @created_by);

-- ============================================================================
-- PATTERN P: 11:00-23:45 (all days)
-- IDs: 27 (Marina Mall Abu Dhabi)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(27, @start_date, @end_date, NULL, 1, 11, 23.75, 0, @created_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT COUNT(*) AS total_ramadan_records FROM location_opening_hour_exceptions 
WHERE start_date = @start_date AND end_date = @end_date AND deleted_at IS NULL;

-- ============================================================================
-- ROLLBACK (if needed):
-- DELETE FROM location_opening_hour_exceptions 
-- WHERE start_date = '2026-02-15' AND end_date = '2026-03-30' AND id > 0;
-- ============================================================================
