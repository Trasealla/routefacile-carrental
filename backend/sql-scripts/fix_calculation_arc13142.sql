-- ============================================================================
-- DESCRIPTION: Fix Booking Calculation for ARC13142
-- ============================================================================
-- PURPOSE: Corrects the calculation for booking ARC13142 by fixing sub_amount, 
--          vat_amount, and total_amount after insurance add-ons were incorrectly 
--          added (possibly twice).
--
-- BOOKING: ARC13142
--
-- ORIGINAL VALUES (from booking confirmation email):
-- Rental Amount: 1,151.58 AED
-- Promo Code (NEWAPP) Discount: -80.64 AED
-- Delivery Charges: 30.00 AED
-- Collection Charges: 30.00 AED
-- VMD Charges: 24.00 AED
-- Sub Total: 1,154.94 AED (already includes discount)
-- VAT (5%): 57.75 AED
-- Total: 1,212.69 AED
--
-- AFTER ADDING INSURANCE ADD-ONS:
-- SCDW: 480.00 AED (80/day × 6 days)
-- PAI: 240.00 AED (40/day × 6 days)
-- Total Extras: 720.00 AED
--
-- CORRECT VALUES SHOULD BE:
-- New Sub Total: 1,154.94 + 720.00 = 1,874.94 AED
-- (Discount of 80.64 is already included in the 1,154.94)
-- New VAT (5%): 1,874.94 × 0.05 = 93.75 AED
-- New Total: 1,874.94 + 93.75 = 1,968.69 AED
-- ============================================================================

-- Current database shows sub_amount: 2,594.94 (which is wrong - seems like extras added twice)
-- We need to fix: sub_amount, vat_amount, total_amount, and verify coupon_discount_amount

-- Fix all calculations based on original 1,154.94 + 720.00:
-- Note: The discount (80.64) is already applied in the original sub_amount of 1,154.94
UPDATE bookings
SET 
    sub_amount = 1154.94 + 720.00,  -- Original sub (with discount) + extras
    coupon_discount_amount = 80.64,  -- Ensure discount amount is correct
    vat_amount = ROUND((1154.94 + 720.00) * (vat_percentage / 100), 2),  -- New sub × 5% (rounded)
    total_amount = ROUND((1154.94 + 720.00) * (1 + (vat_percentage / 100)), 2)  -- New sub + VAT (rounded)
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

SELECT 
    id,
    booking_number,
    coupon_code,
    coupon_discount_amount,
    car_extras_rate_total,
    sub_amount,
    vat_percentage,
    vat_amount,
    total_amount,
    -- Show calculated values for verification (rounded to 2 decimal places)
    ROUND(sub_amount * vat_percentage / 100, 2) AS calculated_vat,
    ROUND(sub_amount + (sub_amount * vat_percentage / 100), 2) AS calculated_total,
    -- Check if correct (using ROUND for comparison)
    CASE 
        WHEN ROUND(vat_amount, 2) = ROUND(sub_amount * vat_percentage / 100, 2) THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END AS vat_status,
    CASE 
        WHEN ROUND(total_amount, 2) = ROUND(sub_amount + (sub_amount * vat_percentage / 100), 2) THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END AS total_status,
    -- Show breakdown
    (sub_amount - car_extras_rate_total) AS sub_amount_before_extras,
    car_extras_rate_total AS extras_added
FROM 
    bookings
WHERE 
    booking_number = 'ARC13142'
    AND id = 13142;

-- ============================================================================
-- EXPECTED VALUES AFTER FIX:
-- ============================================================================
-- Breakdown:
-- Rental Amount: 1,151.58 AED
-- Promo Code (NEWAPP) Discount: -80.64 AED (already applied)
-- Delivery Charges: 30.00 AED
-- Collection Charges: 30.00 AED
-- VMD Charges: 24.00 AED
-- Original Sub Total (with discount): 1,154.94 AED
--
-- Insurance Extras Added:
-- SCDW: 480.00 AED (80/day × 6 days)
-- PAI: 240.00 AED (40/day × 6 days)
-- Total Extras: 720.00 AED
--
-- Final Values:
-- New Sub Total: 1,874.94 AED ✅ (1,154.94 + 720.00)
-- Promo Code Discount: 80.64 AED ✅ (unchanged, already applied)
-- New VAT (5%): 93.75 AED ✅ (1,874.94 × 0.05)
-- New Total: 1,968.69 AED ✅ (1,874.94 + 93.75)
-- ============================================================================

