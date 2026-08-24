-- ============================================================================
-- FIX: Abu Dhabi Mall (location_id=3) Timing Issue
-- Date: 2026-03-19
-- Issue: Customers cannot select pickup/dropoff times for Abu Dhabi Mall
-- Root Cause: Stale Ramadan exception hours + Redis cache not flushed
-- ============================================================================

-- Step 1: Check current exception records for Abu Dhabi Mall
SELECT id, location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed, deleted_at
FROM location_opening_hour_exceptions 
WHERE location_id = 3;

-- Step 2: Check ALL active exception records (any location) to see full picture
SELECT id, location_id, start_date, end_date, day, shift, from_hours, to_hours, is_closed
FROM location_opening_hour_exceptions 
WHERE deleted_at IS NULL
ORDER BY location_id, start_date;

-- Step 3: DELETE ALL exception hours from ALL locations (clean slate)
DELETE FROM location_opening_hour_exceptions WHERE id > 0;

-- Step 4: Verify deletion
SELECT COUNT(*) AS remaining_exceptions FROM location_opening_hour_exceptions;

-- Step 5: Check regular opening hours exist for Abu Dhabi Mall (fallback)
SELECT id, location_id, day, shift, from_hours, to_hours, is_closed
FROM location_opening_hours 
WHERE location_id = 3 AND deleted_at IS NULL
ORDER BY day, shift;

-- ============================================================================
-- CRITICAL: After running the SQL above, you MUST flush the Redis cache!
-- 
-- Option A - SSH into the server and run:
--   docker exec <redis_container_name> redis-cli FLUSHALL
--
-- Option B - If you know the container name:
--   docker exec arc_redis_1 redis-cli FLUSHALL
--
-- Option C - Connect to Redis directly:
--   redis-cli -h <redis_host> -p 6379 FLUSHALL
--
-- Without flushing Redis, the website will continue serving stale cached data!
-- ============================================================================
