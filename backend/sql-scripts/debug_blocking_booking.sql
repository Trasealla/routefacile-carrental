-- ============================================================================
-- DESCRIPTION: Debug query to find what booking is blocking a new booking
-- ============================================================================
-- PURPOSE: When a user gets "Booking already in progress" error, this query
--          helps identify which existing booking is causing the block.
--
-- USAGE: Replace USER_ID and PICKUP_DATE with the actual values
-- ============================================================================

-- Set the user_id and pickup_date you want to check
SET @user_id = 123;  -- Replace with actual user_id
SET @pickup_date = '2024-12-29';  -- Replace with the pickup date user is trying to book

-- Query 1: Find ALL bookings for this user (latest version of each booking_number)
SELECT 
    b.id,
    b.booking_number,
    b.action,
    b.payment_type,
    b.payment_status,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.user_email,
    b.booking_source,
    CASE 
        WHEN Date(b.dropoff_date_time) < CURDATE() THEN 'PAST'
        WHEN Date(b.pickup_date_time) <= CURDATE() AND Date(b.dropoff_date_time) >= CURDATE() THEN 'CURRENT'
        ELSE 'UPCOMING'
    END as booking_status,
    CASE 
        WHEN @pickup_date BETWEEN Date(b.pickup_date_time) AND Date(b.dropoff_date_time) THEN 'YES - BLOCKING'
        ELSE 'NO'
    END as would_block_new_booking
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
    b.user_id = @user_id
ORDER BY 
    b.id DESC;

-- Query 2: Find ONLY the bookings that would BLOCK a new booking for this pickup date
-- (This is what the validation query checks)
SELECT 
    b.id,
    b.booking_number,
    b.action,
    b.payment_type,
    b.payment_status,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.user_email,
    'This booking is BLOCKING the new booking' as reason
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
    AND b.user_id = @user_id
    AND b.action != 'cancel'
    AND @pickup_date BETWEEN Date(b.pickup_date_time) AND Date(b.dropoff_date_time);

-- Query 3: Find user by email (to get user_id)
-- SELECT id, email, first_name, last_name FROM users WHERE email = 'user@example.com';

-- Query 4: Alternative - Find blocking bookings by email instead of user_id
-- SET @user_email = 'user@example.com';
-- SELECT 
--     b.id,
--     b.booking_number,
--     b.action,
--     b.payment_type,
--     b.payment_status,
--     b.pickup_date_time,
--     b.dropoff_date_time,
--     b.user_email
-- FROM
--     bookings AS b
--         INNER JOIN
--     (SELECT 
--         booking_number, MAX(id) AS latest_id
--     FROM
--         bookings
--     WHERE
--         (payment_type != 'now' OR payment_status = 1)
--     GROUP BY booking_number) AS la ON b.id = la.latest_id
--     AND b.user_email = @user_email
--     AND b.action != 'cancel'
--     AND @pickup_date BETWEEN Date(b.pickup_date_time) AND Date(b.dropoff_date_time);

