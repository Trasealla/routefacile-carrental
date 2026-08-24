-- ============================================================================
-- DESCRIPTION: Calculate Expected Values After Adding Insurance Add-ons
-- ============================================================================
-- PURPOSE: Shows expected booking values after adding SCDW and PAI insurance 
--          add-ons to booking ARC13142, including calculations from rates_daily.
--
-- BOOKING: ARC13142
-- PERIOD:  Dec 6-12, 2025 (6 days)
-- CAR:     ID 63
-- EMIRATE: ID 1
--
-- CALCULATES:
--   - Insurance rates from rates_daily table (SCDW and PAI)
--   - Expected car_extras JSON structure
--   - Expected car_extras_rate_total
--   - Expected sub_amount, vat_amount, and total_amount after update
--
-- NOTES: Includes both dynamic calculation from rates_daily and example with 
--        fixed rates (30 AED/day SCDW, 20 AED/day PAI).
-- ============================================================================

-- STEP 1: Check current booking values
SELECT 
    id,
    booking_number,
    car_extras,
    car_extras_rate_total,
    sub_amount AS current_sub_amount,
    vat_percentage,
    vat_amount AS current_vat_amount,
    total_amount AS current_total_amount,
    booking_days
FROM 
    bookings
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- STEP 2: Calculate expected insurance rates from rates_daily
-- This shows what the rates should be
SELECT 
    'SCDW Total' AS extra_type,
    SUM(COALESCE(rd.scdw, 0)) AS total_rate
FROM 
    rates_daily rd
WHERE 
    rd.car_id = 63 
    AND rd.emirate_id = 1
    AND rd.date >= '2025-12-06'
    AND rd.date <= '2025-12-12'

UNION ALL

SELECT 
    'PAI Total' AS extra_type,
    SUM(COALESCE(rd.pai, 0)) AS total_rate
FROM 
    rates_daily rd
WHERE 
    rd.car_id = 63 
    AND rd.emirate_id = 1
    AND rd.date >= '2025-12-06'
    AND rd.date <= '2025-12-12'

UNION ALL

SELECT 
    'Combined Total' AS extra_type,
    SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) AS total_rate
FROM 
    rates_daily rd
WHERE 
    rd.car_id = 63 
    AND rd.emirate_id = 1
    AND rd.date >= '2025-12-06'
    AND rd.date <= '2025-12-12';

-- STEP 3: Calculate expected values after update
-- Replace the rates below with actual values from STEP 2
SELECT 
    b.id,
    b.booking_number,
    -- Expected car_extras JSON structure
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 'scdw',
            'org_price', (SELECT SUM(COALESCE(rd.scdw, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12'),
            'quantity', 1,
            'discount', 0,
            'surge', 0,
            'rate', (SELECT SUM(COALESCE(rd.scdw, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12')
        ),
        JSON_OBJECT(
            'type', 'pai',
            'org_price', (SELECT SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12'),
            'quantity', 1,
            'discount', 0,
            'surge', 0,
            'rate', (SELECT SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12')
        )
    ) AS expected_car_extras,
    -- Expected car_extras_rate_total
    (SELECT SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12') AS expected_car_extras_rate_total,
    -- Expected sub_amount (current + extras)
    b.sub_amount + (SELECT SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12') AS expected_sub_amount,
    -- Expected vat_amount (new sub_amount * vat_percentage / 100)
    (b.sub_amount + (SELECT SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12')) * (b.vat_percentage / 100) AS expected_vat_amount,
    -- Expected total_amount (new sub_amount + new vat_amount)
    (b.sub_amount + (SELECT SUM(COALESCE(rd.scdw, 0)) + SUM(COALESCE(rd.pai, 0)) FROM rates_daily rd WHERE rd.car_id = 63 AND rd.emirate_id = 1 AND rd.date >= '2025-12-06' AND rd.date <= '2025-12-12')) * (1 + (b.vat_percentage / 100)) AS expected_total_amount,
    -- Current values for comparison
    b.sub_amount AS current_sub_amount,
    b.vat_amount AS current_vat_amount,
    b.total_amount AS current_total_amount,
    b.vat_percentage
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC13142'
    AND b.id = 13142;

-- ============================================================================
-- EXAMPLE WITH FIXED RATES (if rates_daily doesn't have data)
-- ============================================================================
-- If the above queries return NULL, use these example calculations:
-- Typical rates for 6 days:
-- SCDW: 30 AED/day × 6 days = 180 AED
-- PAI: 20 AED/day × 6 days = 120 AED
-- Total extras: 300 AED

/*
SELECT 
    b.id,
    b.booking_number,
    -- Expected car_extras JSON
    JSON_ARRAY(
        JSON_OBJECT('type', 'scdw', 'org_price', 180.00, 'quantity', 1, 'discount', 0, 'surge', 0, 'rate', 180.00),
        JSON_OBJECT('type', 'pai', 'org_price', 120.00, 'quantity', 1, 'discount', 0, 'surge', 0, 'rate', 120.00)
    ) AS expected_car_extras,
    -- Expected values
    300.00 AS expected_car_extras_rate_total,  -- 180 + 120
    b.sub_amount + 300.00 AS expected_sub_amount,
    (b.sub_amount + 300.00) * (b.vat_percentage / 100) AS expected_vat_amount,
    (b.sub_amount + 300.00) * (1 + (b.vat_percentage / 100)) AS expected_total_amount,
    -- Current values
    b.sub_amount AS current_sub_amount,
    b.vat_amount AS current_vat_amount,
    b.total_amount AS current_total_amount
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC13142'
    AND b.id = 13142;
*/






