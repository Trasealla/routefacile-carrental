-- ============================================================================
-- Abu Dhabi Airport Meet & Greet - Customer Extract (Last 3 Years)
-- ============================================================================
-- PURPOSE: Extract unique customers who have taken cars from Abu Dhabi 
--          International Airport Meet & Greet service in the last 3 years
-- COLUMNS: Customer Name, Phone Number, Email
-- LOCATION_ID: 17 (Abu Dhabi International Airport - Meet & Greet)
-- ============================================================================

SELECT DISTINCT
    CONCAT(
        TRIM(b.user_first_name), 
        ' ', 
        TRIM(b.user_last_name)
    ) AS customer_name,
    CONCAT(
        TRIM(b.user_phone_code), 
        TRIM(b.user_phone_number)
    ) AS phone_number,
    TRIM(b.user_email) AS email
FROM 
    bookings AS b
INNER JOIN
    (SELECT 
        booking_number, 
        MAX(id) AS latest_id
    FROM
        bookings
    WHERE
        (payment_type != 'now' OR payment_status = 1)
    GROUP BY booking_number
    ) AS la ON b.id = la.latest_id
WHERE
    -- Filter for Abu Dhabi Airport Meet & Greet location (ID: 17)
    -- Check both pickup and dropoff locations
    (b.pickup_location_id = 17 OR b.dropoff_location_id = 17)
    AND
    -- Filter for last 3 years
    b.booking_date >= DATE_SUB(NOW(), INTERVAL 3 YEAR)
    AND
    -- Exclude cancelled/unpaid bookings (only confirmed bookings)
    b.action != 'cancel'
    AND
    -- Ensure valid email and phone
    b.user_email IS NOT NULL
    AND b.user_email != ''
    AND b.user_phone_number IS NOT NULL
    AND b.user_phone_number != ''
ORDER BY 
    b.booking_date DESC;
