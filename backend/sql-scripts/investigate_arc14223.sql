-- ============================================================================
-- DESCRIPTION: Investigate blocking booking ARC14223
-- ============================================================================

-- Query 1: Get full details of booking ARC14223
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.action,
    b.payment_type,
    b.payment_status,
    b.user_id,
    b.user_email,
    b.user_first_name,
    b.user_last_name,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.booking_date,
    b.booking_source,
    b.total_amount,
    CASE 
        WHEN Date(b.dropoff_date_time) < CURDATE() THEN 'PAST'
        WHEN Date(b.pickup_date_time) <= CURDATE() AND Date(b.dropoff_date_time) >= CURDATE() THEN 'CURRENT'
        ELSE 'UPCOMING'
    END as booking_status
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC14223'
ORDER BY 
    b.id DESC;

-- Query 2: Check all versions of this booking (in case of edits/cancellations)
SELECT 
    b.id,
    b.booking_number,
    b.action,
    b.payment_type,
    b.payment_status,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.booking_date,
    b.cancellation_date_time,
    b.cancellation_reason
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC14223'
ORDER BY 
    b.id DESC;

-- Query 3: If user wants to cancel this booking to proceed with new one
-- UPDATE bookings SET action = 'cancel', cancellation_reason = 'User requested cancellation to make new booking' WHERE booking_number = 'ARC14223' AND id = (SELECT MAX(id) FROM bookings WHERE booking_number = 'ARC14223');

