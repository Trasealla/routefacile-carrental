-- Query to check booking ARC15150 date issue
-- Customer selected January 24th but got January 18th confirmed
-- ANALYSIS: The backend received "2026-01-18" in the user_request JSON, meaning the mobile app sent the wrong date

-- 1. Main booking details - shows what was received vs stored
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_source,
    DATE_FORMAT(b.booking_date, '%Y-%m-%d %H:%i:%s') AS booking_created_date,
    DATE_FORMAT(b.pickup_date_time, '%Y-%m-%d %H:%i:%s') AS stored_pickup_date_time,
    DATE_FORMAT(b.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS stored_pickup_date_formatted,
    DATE_FORMAT(b.dropoff_date_time, '%Y-%m-%d %H:%i:%s') AS stored_dropoff_date_time,
    b.user_request AS original_request_json,
    JSON_EXTRACT(b.user_request, '$.pickup_date') AS requested_pickup_date,
    JSON_EXTRACT(b.user_request, '$.pickup_time') AS requested_pickup_time,
    JSON_EXTRACT(b.user_request, '$.dropoff_date') AS requested_dropoff_date,
    JSON_EXTRACT(b.user_request, '$.dropoff_time') AS requested_dropoff_time,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS customer_name,
    b.user_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
    b.action,
    b.type AS booking_type,
    b.payment_type,
    b.payment_status
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC15150'
ORDER BY 
    b.id DESC;

-- 2. Check booking form submissions for THIS SPECIFIC USER around the dates
-- This will show if the user searched for January 24th before booking
SELECT 
    bfs.id,
    bfs.booking_source,
    DATE_FORMAT(bfs.pickup_date_time, '%Y-%m-%d %H:%i:%s') AS form_submission_pickup_date,
    DATE_FORMAT(bfs.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS form_submission_pickup_date_formatted,
    DATE_FORMAT(bfs.dropoff_date_time, '%Y-%m-%d %H:%i:%s') AS form_submission_dropoff_date,
    bfs.type,
    bfs.created_at,
    -- Try to match by user (if we can find user_id from bookings)
    (SELECT GROUP_CONCAT(DISTINCT b2.user_email) 
     FROM bookings b2 
     WHERE b2.user_email = 'shinusasidharan008@gmail.com' 
     LIMIT 1) AS matching_user_email
FROM 
    booking_form_submissions bfs
WHERE 
    DATE(bfs.pickup_date_time) BETWEEN '2026-01-18' AND '2026-01-25'
    AND bfs.booking_source = 'mobile'
    AND bfs.created_at BETWEEN '2026-01-18 00:00:00' AND '2026-01-19 23:59:59'
ORDER BY 
    bfs.created_at DESC;

-- 3. Check ALL bookings from this user to see booking pattern
SELECT 
    b.id,
    b.booking_number,
    DATE_FORMAT(b.booking_date, '%Y-%m-%d %H:%i:%s') AS booking_created_date,
    DATE_FORMAT(b.pickup_date_time, '%Y-%m-%d %H:%i:%s') AS pickup_date_time,
    JSON_EXTRACT(b.user_request, '$.pickup_date') AS requested_pickup_date,
    b.booking_source,
    b.action
FROM 
    bookings b
WHERE 
    b.user_email = 'shinusasidharan008@gmail.com'
    OR CONCAT(b.user_phone_code, b.user_phone_number) = '971507736485'
ORDER BY 
    b.booking_date DESC
LIMIT 10;

-- 4. Check if there are any booking form submissions for January 24th specifically
-- This would show if the user searched for Jan 24th but then booked Jan 18th
SELECT 
    bfs.id,
    bfs.booking_source,
    DATE_FORMAT(bfs.pickup_date_time, '%Y-%m-%d %H:%i:%s') AS form_submission_pickup_date,
    DATE_FORMAT(bfs.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS form_submission_pickup_date_formatted,
    DATE_FORMAT(bfs.dropoff_date_time, '%Y-%m-%d %H:%i:%s') AS form_submission_dropoff_date,
    bfs.type,
    bfs.created_at
FROM 
    booking_form_submissions bfs
WHERE 
    DATE(bfs.pickup_date_time) = '2026-01-24'
    AND bfs.booking_source = 'mobile'
    AND bfs.created_at BETWEEN '2026-01-18 00:00:00' AND '2026-01-19 23:59:59'
ORDER BY 
    bfs.created_at DESC;

