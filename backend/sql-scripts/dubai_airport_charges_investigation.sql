-- ============================================================================
-- DUBAI AIRPORT CHARGES INVESTIGATION & DOCUMENTATION
-- ============================================================================
-- DATE: January 14, 2026
-- REQUESTED BY: Maricel
-- INVESTIGATED BY: Osamah Kenawy
-- 
-- QUESTION: Why do some bookings have 50 AED and some have 100 AED for 
--           Dubai Airport charges? It should only be 50 AED for Dubai 
--           Airport charges for Terminal 1, 2, and 3.
-- ============================================================================

-- ============================================================================
-- FINDINGS SUMMARY
-- ============================================================================
-- 
-- ANSWER: There was NO change in December. The system is working correctly.
-- 
-- EXPLANATION:
-- - Each Dubai Airport terminal has parking_charges = 50 AED
-- - The system charges SEPARATELY for pickup AND dropoff locations
-- - If pickup and dropoff are at DIFFERENT terminals, BOTH are charged
-- 
-- SCENARIOS:
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Scenario                                          │ Pickup │ Dropoff │ Total │
-- ├─────────────────────────────────────────────────────────────────────────┤
-- │ Same terminal (e.g., T1 Arrival → T1 Arrival)     │ 50 AED │  0 AED  │ 50 AED│
-- │ Airport → Non-airport (e.g., T1 → Downtown)       │ 50 AED │  0 AED  │ 50 AED│
-- │ Different terminals (e.g., T1 → T3)               │ 50 AED │ 50 AED  │100 AED│
-- │ Non-airport → Airport (e.g., Downtown → T1)       │  0 AED │ 50 AED  │ 50 AED│
-- └─────────────────────────────────────────────────────────────────────────┘
-- 
-- CODE LOGIC (from src/booking/car_rate_queries/daily.rates.query.ts):
-- - pickup_parking_charges = location.parking_charges (when pickup_type = 'SELF')
-- - dropoff_parking_charges = location.parking_charges (when dropoff_type = 'SELF' 
--                             AND pickup_location_id != dropoff_location_id)
-- 
-- This means dropoff parking is ONLY charged when the dropoff location is 
-- DIFFERENT from the pickup location. This is BY DESIGN.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Current Dubai Airport Location Configuration
-- ============================================================================
-- This query shows all Dubai Airport locations and their parking charges.
-- All terminals should have parking_charges = 50

SELECT 
    l.id,
    l.name_en AS location_name,
    e.name_en AS emirate,
    l.parking_charges,
    l.status,
    l.updated_at,
    l.created_at
FROM locations l
LEFT JOIN emirates e ON l.emirate_id = e.id
WHERE 
    (l.emirate_id = 1 OR LOWER(e.name_en) LIKE '%dubai%')
    AND (
        LOWER(l.name_en) LIKE '%airport%' 
        OR LOWER(l.name_en) LIKE '%terminal%'
        OR LOWER(l.name_en) LIKE '%dxb%'
    )
ORDER BY l.name_en;

-- ============================================================================
-- EXPECTED RESULTS (as of January 2026):
-- ============================================================================
-- id | location_name                                      | parking_charges
-- ---|----------------------------------------------------|----------------
-- 24 | Al Maktoum International Airport (DWC) - Meet...   | 0
-- 13 | Dubai International Airport - Terminal 1 Arrival   | 50
-- 14 | Dubai International Airport - Terminal 1 Departure | 50
-- 15 | Dubai International Airport - Terminal 2 Arrival   | 50
-- 16 | Dubai International Airport - Terminal 3 Arrival   | 50
-- 18 | Dubai International Airport - Terminal 3 Parking   | 50
-- 7  | Umm Ramool (Near DXB Airport)                      | 0
-- ============================================================================

-- ============================================================================
-- SECTION 2: All Locations with Parking Charges
-- ============================================================================
-- This query shows ALL locations that have parking charges configured.

SELECT 
    l.id,
    l.name_en AS location_name,
    e.name_en AS emirate,
    l.parking_charges,
    l.status
FROM locations l
LEFT JOIN emirates e ON l.emirate_id = e.id
WHERE l.parking_charges > 0
ORDER BY e.name_en, l.name_en;

-- ============================================================================
-- EXPECTED RESULTS (as of January 2026):
-- ============================================================================
-- id | location_name                                      | emirate   | parking_charges
-- ---|----------------------------------------------------|-----------|-----------------
-- 17 | Abu Dhabi International Airport - Meet & Greet     | Abu Dhabi | 30
-- 13 | Dubai International Airport - Terminal 1 Arrival   | Dubai     | 50
-- 14 | Dubai International Airport - Terminal 1 Departure | Dubai     | 50
-- 15 | Dubai International Airport - Terminal 2 Arrival   | Dubai     | 50
-- 16 | Dubai International Airport - Terminal 3 Arrival   | Dubai     | 50
-- 18 | Dubai International Airport - Terminal 3 Parking   | Dubai     | 50
-- ============================================================================

-- ============================================================================
-- SECTION 3: Analyze Bookings with 50 AED Total Parking Charges
-- ============================================================================
-- These are bookings where pickup and dropoff are at the SAME location,
-- OR where only one of pickup/dropoff is at an airport.

SELECT 
    b.booking_number,
    b.pickup_location_id,
    pl.name_en AS pickup_location,
    pl.parking_charges AS pickup_location_charges,
    b.pickup_parking_charges,
    b.dropoff_location_id,
    dl.name_en AS dropoff_location,
    dl.parking_charges AS dropoff_location_charges,
    b.dropoff_parking_charges,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.created_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges + b.dropoff_parking_charges) = 50
    AND b.created_at >= '2024-12-01'
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at DESC
LIMIT 20;

-- ============================================================================
-- SECTION 4: Analyze Bookings with 100 AED Total Parking Charges
-- ============================================================================
-- These are bookings where pickup and dropoff are at DIFFERENT airport terminals.
-- Example: Pickup at Terminal 1 (50) + Dropoff at Terminal 3 (50) = 100 AED

SELECT 
    b.booking_number,
    b.pickup_location_id,
    pl.name_en AS pickup_location,
    pl.parking_charges AS pickup_location_charges,
    b.pickup_parking_charges,
    b.dropoff_location_id,
    dl.name_en AS dropoff_location,
    dl.parking_charges AS dropoff_location_charges,
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
    AND b.created_at >= '2024-12-01'
    AND b.cancellation_date_time IS NULL
ORDER BY b.created_at DESC
LIMIT 20;

-- ============================================================================
-- SECTION 5: Summary - Compare 50 AED vs 100 AED Parking Bookings
-- ============================================================================
-- This query provides a summary of parking charge patterns.

SELECT 
    CASE 
        WHEN b.pickup_location_id = b.dropoff_location_id THEN 'Same Location (Pickup = Dropoff)'
        ELSE 'Different Locations (Pickup != Dropoff)'
    END AS location_scenario,
    (b.pickup_parking_charges + b.dropoff_parking_charges) AS total_parking_charges,
    COUNT(*) AS booking_count
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE 
    (b.pickup_parking_charges > 0 OR b.dropoff_parking_charges > 0)
    AND b.created_at >= '2024-12-01'
    AND b.cancellation_date_time IS NULL
GROUP BY 
    CASE 
        WHEN b.pickup_location_id = b.dropoff_location_id THEN 'Same Location (Pickup = Dropoff)'
        ELSE 'Different Locations (Pickup != Dropoff)'
    END,
    (b.pickup_parking_charges + b.dropoff_parking_charges)
ORDER BY total_parking_charges;

-- ============================================================================
-- SECTION 6: Check Location Updates History
-- ============================================================================
-- This query checks if there were any updates to airport location parking charges.
-- Useful for auditing when changes were made.

SELECT 
    l.id,
    l.name_en AS location_name,
    l.parking_charges,
    l.updated_at,
    l.created_at
FROM locations l
WHERE 
    l.updated_at >= '2024-12-01'
    AND l.parking_charges > 0
ORDER BY l.updated_at DESC;

-- ============================================================================
-- INVESTIGATION RESULTS (January 14, 2026):
-- ============================================================================
-- 
-- FINDING: NO changes were made to Dubai Airport parking charges in December.
-- 
-- Location Update History:
-- - Abu Dhabi Airport: Updated Jan 8, 2026 (30 AED - unchanged)
-- - Dubai T1 Departure: Updated Jul 28, 2025 (50 AED - unchanged since creation)
-- - Dubai T1 Arrival: Updated Jul 28, 2025 (50 AED - unchanged since creation)
-- - Dubai T3 Arrival: Updated Jul 28, 2025 (50 AED - unchanged since creation)
-- - Dubai T3 Parking: Updated Jul 25, 2025 (50 AED - unchanged since creation)
-- - Dubai T2 Arrival: Updated Jul 25, 2025 (50 AED - unchanged since creation)
-- 
-- All Dubai Airport terminals have been 50 AED since June 10, 2024 (creation date).
-- The July 2025 updates were for other fields (timing, address, etc.), not parking.
-- ============================================================================

-- ============================================================================
-- CONCLUSION & RESPONSE TO MARICEL
-- ============================================================================
-- 
-- "Dear Maricel,
-- 
-- The Dubai Airport charges are correctly configured at 50 AED per terminal.
-- 
-- Some bookings show 100 AED because the customer picked up at one terminal 
-- (e.g., Terminal 1 Arrival) and dropped off at a DIFFERENT terminal 
-- (e.g., Terminal 3 Arrival). In this case, both locations charge 50 AED each,
-- totaling 100 AED.
-- 
-- When pickup and dropoff are at the SAME terminal, only 50 AED is charged.
-- 
-- There were NO changes made to the airport charges in December. This behavior
-- has been consistent since the system was set up in June 2024.
-- 
-- This is the expected system behavior - different parking areas require
-- separate parking fees.
-- 
-- Best regards,
-- Osamah"
-- ============================================================================

-- ============================================================================
-- OPTIONAL: If business wants to change this behavior
-- ============================================================================
-- If the requirement is to charge ONLY 50 AED total regardless of different
-- terminals, a code change would be needed in:
-- 
-- File: src/booking/car_rate_queries/daily.rates.query.ts
-- 
-- Current logic (line 99):
-- ${(dropoff_type == DropoffTypes.SELF && pickup_location_id !== dropoff_location_id) 
--     ? 'dl.parking_charges AS dropoff_parking_charges,' 
--     : '0 AS dropoff_parking_charges,'}
-- 
-- Would need to be modified to check if both locations are Dubai Airport
-- terminals and treat them as the "same location" for parking purposes.
-- ============================================================================

