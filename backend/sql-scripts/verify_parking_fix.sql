-- ============================================================================
-- VERIFY PARKING FIX: Dubai Airport Charges
-- ============================================================================
-- DATE: January 14, 2026
-- PURPOSE: Verify the fix is working correctly after deployment
-- ============================================================================

-- ============================================================================
-- THE FIX LOGIC:
-- ============================================================================
-- 
-- NEW SQL generated for dropoff_parking_charges:
-- CASE WHEN pl.parking_charges > 0 THEN 0 ELSE dl.parking_charges END
--
-- This means:
-- - If pickup location has parking charges (is an airport) → dropoff = 0
-- - If pickup location has NO parking charges → dropoff = dl.parking_charges
-- ============================================================================

-- ============================================================================
-- TEST SCENARIOS (Run AFTER deploying the fix):
-- ============================================================================

-- Scenario 1: T1 Arrival → T1 Departure (Should be 50 AED total)
-- Expected: pickup_parking = 50, dropoff_parking = 0

-- Scenario 2: T3 Arrival → T3 Parking (Should be 50 AED total)  
-- Expected: pickup_parking = 50, dropoff_parking = 0

-- Scenario 3: Non-airport → T1 Departure (Should be 50 AED total)
-- Expected: pickup_parking = 0, dropoff_parking = 50

-- Scenario 4: T1 Arrival → Non-airport (Should be 50 AED total)
-- Expected: pickup_parking = 50, dropoff_parking = 0

-- ============================================================================
-- VERIFICATION QUERY: Check new bookings after deployment
-- ============================================================================
-- Run this query after the fix is deployed to verify new bookings are correct

SELECT 
    b.booking_number,
    pl.name_en AS pickup_location,
    pl.parking_charges AS pickup_loc_charge,
    b.pickup_parking_charges,
    dl.name_en AS dropoff_location,
    dl.parking_charges AS dropoff_loc_charge,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.created_at,
    CASE 
        WHEN (b.pickup_parking_charges + b.dropoff_parking_charges) <= 50 THEN '✅ CORRECT'
        ELSE '❌ STILL 100 AED'
    END AS status
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (pl.parking_charges > 0 OR dl.parking_charges > 0)
    AND b.created_at >= NOW() - INTERVAL 1 HOUR  -- Bookings in last hour after deployment
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at DESC
LIMIT 20;

-- ============================================================================
-- SUMMARY QUERY: Count 50 vs 100 AED bookings after fix deployment
-- ============================================================================
SELECT 
    DATE(b.created_at) AS booking_date,
    SUM(CASE WHEN (b.pickup_parking_charges + b.dropoff_parking_charges) = 50 THEN 1 ELSE 0 END) AS correct_50aed,
    SUM(CASE WHEN (b.pickup_parking_charges + b.dropoff_parking_charges) = 100 THEN 1 ELSE 0 END) AS incorrect_100aed
FROM bookings b
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.created_at >= CURDATE()  -- Today's bookings
    AND b.cancellation_date_time IS NULL
GROUP BY DATE(b.created_at)
ORDER BY booking_date DESC;





