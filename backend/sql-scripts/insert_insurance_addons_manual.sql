-- ============================================================================
-- DESCRIPTION: Manually Insert Insurance Add-ons (SCDW & PAI) to Booking
-- ============================================================================
-- PURPOSE: Adds SCDW (Super Collision Damage Waiver) and PAI (Personal 
--          Accident Insurance) insurance add-ons to booking ARC13142 and 
--          recalculates all pricing components.
--
-- BOOKING: ARC13142
-- PERIOD:  6 days (Dec 6-12, 2025)
-- RATES:
--   - SCDW: 80 AED/day × 6 days = 480.00 AED
--   - PAI:  40 AED/day × 6 days = 240.00 AED
--   - Total Extras: 720.00 AED
--
-- UPDATES:
--   - car_extras JSON field with insurance details
--   - car_extras_rate_total
--   - sub_amount (adds 720.00)
--   - vat_amount (recalculated on new sub_amount)
--   - total_amount (recalculated)
--
-- NOTES: Includes both quick version with fixed rates and detailed version 
--        that calculates from rates_daily table.
-- ============================================================================

-- ============================================================================
-- QUICK VERSION: UPDATE WITH SPECIFIC RATES
-- ============================================================================
-- Rates: SCDW = 80 AED/day × 6 days = 480 AED
--        PAI = 40 AED/day × 6 days = 240 AED
--        Total = 720 AED
-- ============================================================================

UPDATE bookings
SET 
    car_extras = JSON_ARRAY(
        JSON_OBJECT('type', 'scdw', 'org_price', 480.00, 'quantity', 1, 'discount', 0, 'surge', 0, 'rate', 480.00),
        JSON_OBJECT('type', 'pai', 'org_price', 240.00, 'quantity', 1, 'discount', 0, 'surge', 0, 'rate', 240.00)
    ),
    car_extras_rate_total = 720.00,
    sub_amount = sub_amount + 720.00,
    vat_amount = (sub_amount + 720.00) * (vat_percentage / 100),
    total_amount = (sub_amount + 720.00) * (1 + (vat_percentage / 100))
WHERE 
    booking_number = 'ARC13142' 
    AND id = 13142;

-- ============================================================================
-- DETAILED VERSION: Calculate rates from rates_daily table
-- ============================================================================

-- STEP 1: First, let's check the rates that would be used
-- Run this to see what rates exist for this booking
SELECT 
    rd.date,
    rd.scdw,
    rd.pai,
    COALESCE(rd.scdw, 0) AS scdw_rate,
    COALESCE(rd.pai, 0) AS pai_rate
FROM 
    rates_daily rd
WHERE 
    rd.car_id = 63 
    AND rd.emirate_id = 1
    AND rd.date >= '2025-12-06'
    AND rd.date <= '2025-12-12'
ORDER BY 
    rd.date;

-- STEP 2: Calculate total rates for 6 days
-- This will show you the totals before updating
SELECT 
    SUM(COALESCE(rd.scdw, 0)) AS total_scdw,
    SUM(COALESCE(rd.pai, 0)) AS total_pai,
    SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) AS total_extras
FROM 
    rates_daily rd
WHERE 
    rd.car_id = 63 
    AND rd.emirate_id = 1
    AND rd.date >= '2025-12-06'
    AND rd.date <= '2025-12-12';

-- STEP 3: UPDATE the booking with insurance add-ons (USING SPECIFIC RATES)
-- Rates: SCDW = 80 AED/day × 6 days = 480 AED
--        PAI = 40 AED/day × 6 days = 240 AED
--        Total = 720 AED

UPDATE bookings
SET 
    -- Update car_extras JSON field with SCDW and PAI
    car_extras = JSON_ARRAY(
        JSON_OBJECT(
            'type', 'scdw',
            'org_price', 480.00,
            'quantity', 1,
            'discount', 0,
            'surge', 0,
            'rate', 480.00
        ),
        JSON_OBJECT(
            'type', 'pai',
            'org_price', 240.00,
            'quantity', 1,
            'discount', 0,
            'surge', 0,
            'rate', 240.00
        )
    ),
    -- Update car_extras_rate_total (sum of SCDW + PAI)
    car_extras_rate_total = 720.00,
    -- Recalculate sub_amount (original sub_amount + car_extras_rate_total)
    sub_amount = sub_amount + 720.00,
    -- Recalculate vat_amount (new sub_amount * vat_percentage / 100)
    vat_amount = (sub_amount + 720.00) * (vat_percentage / 100),
    -- Recalculate total_amount (new sub_amount + new vat_amount)
    total_amount = (sub_amount + 720.00) * (1 + (vat_percentage / 100))
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- STEP 4: Verify the update
SELECT 
    id,
    booking_number,
    car_extras,
    car_extras_rate_total,
    sub_amount,
    vat_amount,
    total_amount,
    JSON_EXTRACT(car_extras, '$[0].type') AS first_extra_type,
    JSON_EXTRACT(car_extras, '$[0].rate') AS first_extra_rate,
    JSON_EXTRACT(car_extras, '$[1].type') AS second_extra_type,
    JSON_EXTRACT(car_extras, '$[1].rate') AS second_extra_rate
FROM 
    bookings
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- ============================================================================
-- CALCULATION SUMMARY
-- ============================================================================
-- Booking Period: 6 days (Dec 6-12, 2025)
-- SCDW Rate: 80 AED/day × 6 days = 480.00 AED
-- PAI Rate: 40 AED/day × 6 days = 240.00 AED
-- Total Extras: 720.00 AED
--
-- Expected Values After Update:
-- - car_extras_rate_total: 720.00 AED
-- - sub_amount: 1,154.94 + 720.00 = 1,874.94 AED
-- - vat_amount: 1,874.94 × 5% = 93.75 AED
-- - total_amount: 1,874.94 + 93.75 = 1,968.69 AED
-- ============================================================================

