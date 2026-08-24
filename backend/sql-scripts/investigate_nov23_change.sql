-- ============================================================================
-- INVESTIGATION: Dubai Airport Charges Change - November 23, 2024
-- ============================================================================
-- REPORTED BY: Maricel
-- DATE: January 14, 2026
-- 
-- ISSUE: System charging 100 AED instead of 50 AED for airport bookings
-- BUSINESS RULE: Should be 50 AED ONCE per airport booking, regardless of:
--   - Same terminal pickup/dropoff
--   - Different terminal pickup/dropoff
--   - Non-airport pickup + Airport dropoff (or vice versa)
-- 
-- CHANGE STARTED: November 23, 2024 onwards
-- ============================================================================

-- ============================================================================
-- SECTION 1: Check the specific bookings reported by Maricel
-- ============================================================================
SELECT 
    b.booking_number,
    b.pickup_location_id,
    pl.name_en AS pickup_location,
    b.pickup_parking_charges,
    b.dropoff_location_id,
    dl.name_en AS dropoff_location,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.created_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE b.booking_number IN ('ARC13021', 'ARC13030', 'ARC13040', 'ARC13080', 'ARC13124')
ORDER BY b.created_at;

-- ============================================================================
-- SECTION 2: Compare bookings BEFORE and AFTER November 23, 2024
-- ============================================================================

-- BEFORE November 23 (should be 50 AED)
SELECT 
    'BEFORE Nov 23' AS period,
    b.booking_number,
    pl.name_en AS pickup_location,
    b.pickup_parking_charges,
    dl.name_en AS dropoff_location,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.created_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.created_at < '2024-11-23'
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at DESC
LIMIT 20;

-- AFTER November 23 (showing 100 AED)
SELECT 
    'AFTER Nov 23' AS period,
    b.booking_number,
    pl.name_en AS pickup_location,
    b.pickup_parking_charges,
    dl.name_en AS dropoff_location,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.created_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.created_at >= '2024-11-23'
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at ASC
LIMIT 20;

-- ============================================================================
-- SECTION 3: Summary - How many 100 AED vs 50 AED bookings before/after Nov 23
-- ============================================================================
SELECT 
    CASE 
        WHEN b.created_at < '2024-11-23' THEN 'Before Nov 23'
        ELSE 'After Nov 23'
    END AS period,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    COUNT(*) AS booking_count
FROM bookings b
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.cancellation_date_time IS NULL
GROUP BY 
    CASE 
        WHEN b.created_at < '2024-11-23' THEN 'Before Nov 23'
        ELSE 'After Nov 23'
    END,
    (b.pickup_parking_charges + b.dropoff_parking_charges)
ORDER BY period, total_parking;

-- ============================================================================
-- SECTION 4: Check first 100 AED booking - when did it start?
-- ============================================================================
SELECT 
    b.booking_number,
    pl.name_en AS pickup_location,
    b.pickup_parking_charges,
    dl.name_en AS dropoff_location,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.created_at AS first_100aed_booking
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 100
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at ASC
LIMIT 5;

-- ============================================================================
-- SECTION 5: Check what changed around November 22-24
-- Look at location updates around that time
-- ============================================================================
SELECT 
    l.id,
    l.name_en AS location_name,
    l.parking_charges,
    l.updated_at,
    l.created_at
FROM locations l
WHERE 
    l.parking_charges > 0
    OR (
        l.updated_at >= '2024-11-20' 
        AND l.updated_at <= '2024-11-25'
    )
ORDER BY l.updated_at;

-- ============================================================================
-- SECTION 6: Check for any code deployment or configuration changes
-- by looking at the pattern of charges
-- ============================================================================
SELECT 
    DATE(b.created_at) AS booking_date,
    COUNT(*) AS total_airport_bookings,
    SUM(CASE WHEN (b.pickup_parking_charges + b.dropoff_parking_charges) = 50 THEN 1 ELSE 0 END) AS bookings_50aed,
    SUM(CASE WHEN (b.pickup_parking_charges + b.dropoff_parking_charges) = 100 THEN 1 ELSE 0 END) AS bookings_100aed
FROM bookings b
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.created_at >= '2024-11-15'
    AND b.created_at <= '2024-11-30'
    AND b.cancellation_date_time IS NULL
GROUP BY DATE(b.created_at)
ORDER BY booking_date;

