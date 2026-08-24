-- ============================================================================
-- Eid-al-Fitr 2026 Exception Hours
-- Period: Thursday 19 March to Saturday 21 March 2026
-- Day mapping: Sunday=1, Monday=2, Tuesday=3, Wednesday=4, Thursday=5, Friday=6, Saturday=7
-- ============================================================================

SET @start_date = '2026-03-19';
SET @end_date = '2026-03-21';
SET @created_by = 1;

-- ============================================================================
-- AIRPORT TERMINALS: OPEN 24 HOURS (all 3 days)
-- D20 DXB T1 Arrival (13), D2 DXB T1 Departure (14), D80 DXB T2 (15),
-- D78 DXB T3 Arrival (16), D79 DXB T3 Return Office (18)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(13, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(14, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(15, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(16, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by),
(18, @start_date, @end_date, NULL, 1, 0, 24, 0, @created_by);

-- ============================================================================
-- D1 UM RAMOOL (7): 08:00 - 22:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(7, @start_date, @end_date, NULL, 1, 8, 22, 0, @created_by);

-- ============================================================================
-- D9 SHARJAH (8): 08:00 - 21:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(8, @start_date, @end_date, NULL, 1, 8, 21, 0, @created_by);

-- ============================================================================
-- D14 FUJAIRAH (9): 08:00 - 21:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(9, @start_date, @end_date, NULL, 1, 8, 21, 0, @created_by);

-- ============================================================================
-- D28 RAS AL KHAIMAH (10): 09:00 - 18:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(10, @start_date, @end_date, NULL, 1, 9, 18, 0, @created_by);

-- ============================================================================
-- D31 SHEIKH ZAYED RD (11): 09:00 - 18:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(11, @start_date, @end_date, NULL, 1, 9, 18, 0, @created_by);

-- ============================================================================
-- D81 DUBAI SOUTH (25): 10:00 - 23:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(25, @start_date, @end_date, NULL, 1, 10, 23, 0, @created_by);

-- ============================================================================
-- D82 LULU AL WARQA (44): 08:00 - 21:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(44, @start_date, @end_date, NULL, 1, 8, 21, 0, @created_by);

-- ============================================================================
-- D83 FESTIVAL PLAZA (78): 10:00-22:00 [THU], 10:00-23:59 [FRI-SAT]
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(78, @start_date, @end_date, 5, 1, 10, 22, 0, @created_by),
(78, @start_date, @end_date, 6, 1, 10, 24, 0, @created_by),
(78, @start_date, @end_date, 7, 1, 10, 24, 0, @created_by);

-- ============================================================================
-- A7 AL AIN (6): 08:00 - 18:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(6, @start_date, @end_date, NULL, 1, 8, 18, 0, @created_by);

-- ============================================================================
-- A8 MUSSAFAH (2): 08:00-17:00 [THU-FRI], CLOSED [SAT]
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(2, @start_date, @end_date, 5, 1, 8, 17, 0, @created_by),
(2, @start_date, @end_date, 6, 1, 8, 17, 0, @created_by),
(2, @start_date, @end_date, 7, 1, 0, 0, 1, @created_by);

-- ============================================================================
-- A14 AIRPORT ROAD (1): 08:00 - 23:00 (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(1, @start_date, @end_date, NULL, 1, 8, 23, 0, @created_by);

-- ============================================================================
-- A16 AUH MALL / ABU DHABI MALL (3): 10:00 - 00:00 (midnight) (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(3, @start_date, @end_date, NULL, 1, 10, 24, 0, @created_by);

-- ============================================================================
-- A25 RUWAIS MALL / AL DHANNAH MALL (5): 10:00 - 00:00 (midnight) (all 3 days)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(5, @start_date, @end_date, NULL, 1, 10, 24, 0, @created_by);

-- ============================================================================
-- A35 WTC MALL (4): 10:00 - 01:00 (next day) → capped at midnight (24)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(4, @start_date, @end_date, NULL, 1, 10, 24, 0, @created_by);

-- ============================================================================
-- A74 YAS MALL (43): 10:00 - 01:00 (next day) → capped at midnight (24)
-- ============================================================================
INSERT INTO location_opening_hour_exceptions (location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, created_by) VALUES
(43, @start_date, @end_date, NULL, 1, 10, 24, 0, @created_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
    e.id, e.location_id, l.name_en, e.start_date, e.end_date, 
    e.day, e.shift, e.from_hours, e.to_hours, e.is_closed
FROM location_opening_hour_exceptions e
JOIN locations l ON l.id = e.location_id
WHERE e.start_date = @start_date AND e.end_date = @end_date
ORDER BY e.location_id, e.day, e.shift;

-- ============================================================================
-- AFTER RUNNING THIS SQL, FLUSH REDIS CACHE:
-- sudo docker exec arc-redis-1 redis-cli FLUSHALL
-- ============================================================================

-- ============================================================================
-- ROLLBACK (if needed):
-- DELETE FROM location_opening_hour_exceptions WHERE start_date = '2026-03-19' AND end_date = '2026-03-21' AND id > 0;
-- sudo docker exec arc-redis-1 redis-cli FLUSHALL
-- ============================================================================
