-- ============================================================================
-- FIND ALL BOOKINGS WITH 100 AED TOTAL PARKING CHARGES
-- ============================================================================
-- DATE: January 14, 2026
-- PURPOSE: Double-check bookings with 100 AED parking charges as per 
--          marketing team's request to verify if it should be only 50 AED
-- ============================================================================

-- ============================================================================
-- SECTION 1: All bookings with 100 AED total parking charges
-- ============================================================================
SELECT 
    b.id AS booking_id,
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
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 100
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at DESC;

-- ============================================================================
-- SECTION 2: Count of 100 AED parking bookings by month
-- ============================================================================
SELECT 
    DATE_FORMAT(b.created_at, '%Y-%m') AS month,
    COUNT(*) AS booking_count
FROM bookings b
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 100
    AND b.cancellation_date_time IS NULL
GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
ORDER BY month DESC;

-- ============================================================================
-- SECTION 3: Breakdown by pickup and dropoff terminal combinations
-- ============================================================================
SELECT 
    pl.name_en AS pickup_terminal,
    dl.name_en AS dropoff_terminal,
    COUNT(*) AS booking_count,
    SUM(b.pickup_parking_charges + b.dropoff_parking_charges) AS total_charged
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 100
    AND b.cancellation_date_time IS NULL
GROUP BY pl.name_en, dl.name_en
ORDER BY booking_count DESC;

-- ============================================================================
-- SECTION 4: Compare 50 AED vs 100 AED bookings count
-- ============================================================================
SELECT 
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking_charges,
    COUNT(*) AS booking_count
FROM bookings b
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.cancellation_date_time IS NULL
GROUP BY (b.pickup_parking_charges + b.dropoff_parking_charges)
ORDER BY total_parking_charges;

-- ============================================================================
-- SECTION 5: Recent 100 AED bookings (last 30 days) with full details
-- ============================================================================
SELECT 
    b.booking_number,
    pl.name_en AS pickup_location,
    dl.name_en AS dropoff_location,
    b.pickup_parking_charges AS pickup_charge,
    b.dropoff_parking_charges AS dropoff_charge,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total,
    DATE_FORMAT(b.pickup_date_time, '%Y-%m-%d %H:%i') AS pickup_datetime,
    DATE_FORMAT(b.dropoff_date_time, '%Y-%m-%d %H:%i') AS dropoff_datetime,
    DATE_FORMAT(b.created_at, '%Y-%m-%d') AS booked_on
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 100
    AND b.cancellation_date_time IS NULL
    AND b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY b.created_at DESC;

