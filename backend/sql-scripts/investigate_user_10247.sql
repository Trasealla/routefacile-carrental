-- ============================================================================
-- DESCRIPTION: Investigate bookings for user 10247 (Ahmed Kotb)
-- ============================================================================

-- Query 1: Get ALL bookings for this user (latest version of each)
SELECT 
    b.id,
    b.booking_number,
    b.action,
    b.payment_type,
    b.payment_status,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.total_amount,
    b.booking_source,
    CASE 
        WHEN Date(b.dropoff_date_time) < CURDATE() THEN 'PAST'
        WHEN Date(b.pickup_date_time) <= CURDATE() AND Date(b.dropoff_date_time) >= CURDATE() THEN 'CURRENT'
        ELSE 'UPCOMING'
    END as booking_status
FROM
    bookings AS b
        INNER JOIN
    (SELECT 
        booking_number, MAX(id) AS latest_id
    FROM
        bookings
    WHERE
        (payment_type != 'now' OR payment_status = 1)
    GROUP BY booking_number) AS la ON b.id = la.latest_id
WHERE 
    b.user_id = 10247
ORDER BY 
    b.id DESC;

-- Query 2: Get details of the blocking booking ARC14223
SELECT 
    id,
    booking_number,
    action,
    payment_type,
    payment_status,
    pickup_date_time,
    dropoff_date_time,
    booking_date,
    total_amount,
    booking_source
FROM 
    bookings
WHERE 
    booking_number = 'ARC14223'
ORDER BY 
    id DESC
LIMIT 1;

-- Query 3: CANCEL the blocking booking ARC14223 if needed
-- Uncomment and run this to cancel:
/*
UPDATE bookings 
SET 
    action = 'cancel', 
    cancellation_reason = 'Cancelled to allow new booking',
    cancellation_date_time = NOW()
WHERE 
    booking_number = 'ARC14223' 
    AND id = (SELECT max_id FROM (SELECT MAX(id) as max_id FROM bookings WHERE booking_number = 'ARC14223') as t);
*/

