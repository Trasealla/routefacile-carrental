-- ============================================================================
-- DESCRIPTION: Investigate booking ARC12310 - Sunday dropoff at Al Ain
-- ============================================================================
-- ISSUE: Customer booked a return on Sunday but Al Ain branch is closed on Sundays
-- REF: MRA-2072500289
-- ============================================================================

-- Query 1: Get booking details for ARC12310
SELECT 
    b.id,
    b.booking_number,
    b.pickup_date_time,
    b.dropoff_date_time,
    DAYNAME(b.dropoff_date_time) as dropoff_day_name,
    DAYOFWEEK(b.dropoff_date_time) as dropoff_day_of_week,
    -- Note: MySQL DAYOFWEEK returns 1=Sunday, 2=Monday, etc.
    -- But in the code, we add +1 to getDay() where getDay() returns 0=Sunday
    -- So code day: Sunday=1, Monday=2, etc.
    b.pickup_location_id,
    b.dropoff_location_id,
    b.dropoff_type,
    b.user_email,
    b.booking_source,
    b.booking_date,
    pl.name_en as pickup_location_name,
    dl.name_en as dropoff_location_name
FROM 
    bookings b
    LEFT JOIN locations pl ON pl.id = b.pickup_location_id
    LEFT JOIN locations dl ON dl.id = b.dropoff_location_id
WHERE 
    b.booking_number = 'ARC12310'
ORDER BY 
    b.id DESC
LIMIT 1;

-- Query 2: Get the dropoff location ID from the booking
-- Then check its opening hours
SET @dropoff_location_id = (
    SELECT dropoff_location_id 
    FROM bookings 
    WHERE booking_number = 'ARC12310' 
    ORDER BY id DESC LIMIT 1
);

SELECT 
    l.id,
    l.name_en,
    loh.day,
    CASE loh.day 
        WHEN 1 THEN 'Sunday'
        WHEN 2 THEN 'Monday'
        WHEN 3 THEN 'Tuesday'
        WHEN 4 THEN 'Wednesday'
        WHEN 5 THEN 'Thursday'
        WHEN 6 THEN 'Friday'
        WHEN 7 THEN 'Saturday'
    END as day_name,
    loh.from_hours,
    loh.to_hours,
    loh.is_closed,
    CASE loh.is_closed WHEN 1 THEN '❌ CLOSED' ELSE '✅ OPEN' END as status
FROM 
    locations l
    JOIN location_opening_hours loh ON loh.location_id = l.id
WHERE 
    l.id = @dropoff_location_id
ORDER BY 
    loh.day;

-- Query 3: Check ALL Al Ain locations and their Sunday hours
SELECT 
    l.id,
    l.name_en,
    loh.day,
    loh.is_closed,
    loh.from_hours,
    loh.to_hours,
    CASE loh.is_closed WHEN 1 THEN '❌ CLOSED' ELSE '✅ OPEN' END as sunday_status
FROM 
    locations l
    LEFT JOIN location_opening_hours loh ON loh.location_id = l.id AND loh.day = 1
WHERE 
    l.name_en LIKE '%Al Ain%';

-- Query 4: CRITICAL - Check if Sunday (day=1) even EXISTS in opening hours for this location
-- If no row exists for day=1, validation would fail with "Opening hours not found"
-- But if a row exists with is_closed=0, it would incorrectly allow booking
SELECT 
    'PROBLEM IDENTIFIED' as issue,
    l.id as location_id,
    l.name_en as location_name,
    CASE 
        WHEN loh.id IS NULL THEN 'NO SUNDAY HOURS DEFINED - would throw error'
        WHEN loh.is_closed = 0 THEN '⚠️ SUNDAY IS MARKED AS OPEN - THIS IS THE BUG!'
        ELSE 'Sunday correctly marked as closed'
    END as diagnosis
FROM 
    locations l
    LEFT JOIN location_opening_hours loh ON loh.location_id = l.id AND loh.day = 1
WHERE 
    l.id = @dropoff_location_id;

-- Query 5: FIX - Mark Sunday as closed for Al Ain (if is_closed=0)
-- Uncomment to fix:
/*
UPDATE location_opening_hours 
SET is_closed = 1
WHERE location_id = @dropoff_location_id AND day = 1;
*/

-- Query 6: Alternative - Check what day calculation gives for the dropoff date
SELECT 
    b.dropoff_date_time,
    DAYOFWEEK(b.dropoff_date_time) as mysql_dayofweek,
    -- Code uses: new Date(body.dropoff_date).getDay() + 1
    -- getDay(): 0=Sunday, 1=Monday, etc.
    -- So: Sunday would be 0+1=1, Monday would be 1+1=2
    DATE(b.dropoff_date_time) as dropoff_date_only,
    DAYNAME(b.dropoff_date_time) as day_name
FROM bookings b
WHERE b.booking_number = 'ARC12310'
ORDER BY b.id DESC LIMIT 1;

