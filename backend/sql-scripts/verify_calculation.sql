-- ============================================================================
-- DESCRIPTION: Verify Booking Calculation Accuracy
-- ============================================================================
-- PURPOSE: Validates that VAT and total amount calculations are correct for 
--          booking ARC13142 by comparing stored values with calculated values.
--
-- BOOKING: ARC13142
-- CHECKS:
--   - VAT calculation: vat_amount = sub_amount × vat_percentage / 100
--   - Total calculation: total_amount = sub_amount + vat_amount
--   - Identifies discrepancies and shows differences
--
-- NOTES: Includes analysis of sub_amount before/after extras to identify 
--        calculation issues or duplicate charges.
-- ============================================================================

-- Current values from database:
-- sub_amount: 2,594.94
-- vat_amount: 165.75
-- total_amount: 3,480.69
-- car_extras_rate_total: 720.00

-- Let's check if the calculations are correct:

SELECT 
    id,
    booking_number,
    car_extras_rate_total,
    sub_amount,
    vat_percentage,
    vat_amount,
    total_amount,
    -- Calculate expected VAT
    (sub_amount * vat_percentage / 100) AS calculated_vat,
    -- Calculate expected total
    (sub_amount + (sub_amount * vat_percentage / 100)) AS calculated_total,
    -- Check if VAT matches
    CASE 
        WHEN vat_amount = (sub_amount * vat_percentage / 100) THEN 'CORRECT'
        ELSE 'INCORRECT'
    END AS vat_check,
    -- Check if total matches
    CASE 
        WHEN total_amount = (sub_amount + (sub_amount * vat_percentage / 100)) THEN 'CORRECT'
        ELSE 'INCORRECT'
    END AS total_check,
    -- Difference in VAT
    vat_amount - (sub_amount * vat_percentage / 100) AS vat_difference,
    -- Difference in total
    total_amount - (sub_amount + (sub_amount * vat_percentage / 100)) AS total_difference
FROM 
    bookings
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- ============================================================================
-- EXPECTED CALCULATION:
-- ============================================================================
-- Original sub_amount: 1,154.94
-- Added extras: 720.00
-- New sub_amount should be: 1,154.94 + 720.00 = 1,874.94
--
-- But actual sub_amount is: 2,594.94
-- Difference: 2,594.94 - 1,874.94 = 720.00
--
-- This suggests the sub_amount was already higher before adding extras,
-- OR the extras were added twice, OR there's another charge included.
-- ============================================================================

-- Check what the original sub_amount was before update:
-- (This would require checking backup/audit log, but we can calculate backwards)

SELECT 
    id,
    booking_number,
    sub_amount AS current_sub_amount,
    car_extras_rate_total,
    -- Calculate what sub_amount was before adding extras
    sub_amount - car_extras_rate_total AS original_sub_amount_before_extras,
    -- Expected original (from email confirmation)
    1154.94 AS expected_original_sub_amount,
    -- Difference
    (sub_amount - car_extras_rate_total) - 1154.94 AS difference_from_expected
FROM 
    bookings
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;






