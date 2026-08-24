-- ============================================================================
-- DESCRIPTION: Query all bookings from Abu Dhabi Airport location
-- ============================================================================
-- PURPOSE: Retrieves all bookings where either pickup or dropoff location
--          is Abu Dhabi Airport. Uses case-insensitive matching to find
--          locations containing "airport" and "abu" or "dhabi" in the name.
--
-- USAGE: 
--   1. If no results, first run the helper query below to find the exact
--      location name/ID in the database
--   2. If you know the location_id, replace the WHERE clause with:
--      WHERE (b.pickup_location_id = <location_id> OR b.dropoff_location_id = <location_id>)
--
-- NOTES:
--   - Only returns latest booking version (excludes cancelled unpaid bookings)
--   - Includes both pickup and dropoff location matches
--   - Results ordered by booking date (most recent first)
-- ============================================================================

-- Helper Query: Find the exact location name for Abu Dhabi airport
-- Uncomment and run this first if the main query returns no results
/*
SELECT 
    id,
    name_en,
    name_ae,
    emirate_id,
    status,
    pickup,
    dropoff
FROM locations
WHERE 
    (
        (LOWER(name_en) LIKE '%airport%' OR LOWER(name_ae) LIKE '%airport%')
        AND 
        (LOWER(name_en) LIKE '%abu%' OR LOWER(name_en) LIKE '%dhabi%' 
         OR LOWER(name_ae) LIKE '%abu%' OR LOWER(name_ae) LIKE '%dhabi%')
    )
    OR
    LOWER(name_en) LIKE '%abudhabi airport%'
    OR LOWER(name_en) LIKE '%abu dhabi airport%'
    OR LOWER(name_en) LIKE '%auh%'  -- AUH is the airport code
ORDER BY name_en;
*/

-- Main Query: Get all bookings from Abu Dhabi Airport
SELECT 
    b.id AS id,
    b.booking_number AS booking_number,
    b.booking_log_number AS booking_log_number,
    b.booking_source AS source,
    DATE_FORMAT(b.booking_date, '%e/%c/%Y %l:%i:%s %p') AS booking_date,
    CASE b.action
        WHEN 'book' THEN 'Booked'
        WHEN 'edit' THEN 'Edited'
        WHEN 'extend' THEN 'Extended'
        ELSE 'Cancelled'
    END AS status,
    b.type AS type,
    CASE
        WHEN b.payment_type = 'now' THEN 'Pay Now'
        ELSE 'Pay Later'
    END AS payment_type,
    b.booking_days AS booking_days,
    CASE
        WHEN b.booking_months IS NULL THEN 0
        ELSE b.booking_months
    END AS booking_months,
    CASE
        WHEN b.flexi_days IS NULL THEN 0
        ELSE b.flexi_days
    END AS flexi_days,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_name,
    b.user_email AS user_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
    c.name_en AS car_name,
    b.pickup_type AS pickup_type,
    COALESCE(pl.name_en, '') AS pickup_location,
    b.pickup_location_id AS pickup_location_id,
    COALESCE(pe.name_en, '') AS pickup_emirate,
    COALESCE(b.pickup_address, '') AS pickup_address,
    DATE_FORMAT(b.pickup_date_time, '%e/%c/%Y %l:%i:%s %p') AS pickup_date,
    b.dropoff_type AS dropoff_type,
    COALESCE(dl.name_en, '') AS dropoff_location,
    b.dropoff_location_id AS dropoff_location_id,
    COALESCE(de.name_en, '') AS dropoff_emirate,
    COALESCE(b.dropoff_address, '') AS dropoff_address,
    DATE_FORMAT(b.dropoff_date_time, '%e/%c/%Y %l:%i:%s %p') AS dropoff_date,
    COALESCE(b.payfort_id, '') AS payfort_id,
    b.car_rate_total AS car_rate,
    b.inter_emirates_charges AS inter_emirates_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS parking_charges,
    b.vmd_charges AS vmd_charges,
    b.delivery_charges AS delivery_charges,
    b.collection_charges AS collection_charges,
    COALESCE(b.coupon_code, '') AS coupon_code,
    b.vat_amount AS vat_amount,
    b.total_amount AS total_amount
FROM
    bookings AS b
        INNER JOIN
    (SELECT 
        booking_number, MAX(id) AS latest_id
    FROM
        bookings
    WHERE
        (payment_type != 'now'
            OR payment_status = 1)
    GROUP BY booking_number) AS la ON b.id = la.latest_id
        LEFT JOIN
    cars AS c ON c.id = b.car_id
        LEFT JOIN
    emirates AS pe ON pe.id = b.pickup_emirate_id
        LEFT JOIN
    locations AS pl ON pl.id = b.pickup_location_id
        LEFT JOIN
    emirates AS de ON de.id = b.dropoff_emirate_id
        LEFT JOIN
    locations AS dl ON dl.id = b.dropoff_location_id
WHERE
    (
        -- Match pickup location - using case-insensitive search with multiple patterns
        (LOWER(pl.name_en) LIKE '%airport%' AND (LOWER(pl.name_en) LIKE '%abu%' OR LOWER(pl.name_en) LIKE '%dhabi%'))
        OR
        -- Match dropoff location - using case-insensitive search with multiple patterns
        (LOWER(dl.name_en) LIKE '%airport%' AND (LOWER(dl.name_en) LIKE '%abu%' OR LOWER(dl.name_en) LIKE '%dhabi%'))
    )
ORDER BY b.booking_date DESC;

