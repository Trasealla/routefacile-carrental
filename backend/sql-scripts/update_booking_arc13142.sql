-- ============================================================================
-- DESCRIPTION: Update Booking ARC13142 with Insurance Add-ons
-- ============================================================================
-- PURPOSE: Adds SCDW and PAI insurance add-ons to booking ARC13142 and 
--          recalculates pricing components (sub_amount, VAT, total_amount).
--
-- BOOKING: ARC13142
-- PERIOD:  6 days
-- RATES:
--   - SCDW: 80 AED/day × 6 days = 480.00 AED
--   - PAI:  40 AED/day × 6 days = 240.00 AED
--   - Total Extras: 720.00 AED
--
-- UPDATES:
--   - car_extras JSON field
--   - car_extras_rate_total
--   - sub_amount (adds 720.00 to existing sub_amount)
--   - vat_amount (recalculated)
--   - total_amount (recalculated)
--
-- NOTES: Includes verification query to confirm the update was successful.
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
-- VERIFY THE UPDATE
-- ============================================================================

SELECT 
    id,
    booking_number,
    car_extras,
    car_extras_rate_total,
    sub_amount,
    vat_percentage,
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
-- EXPECTED VALUES AFTER UPDATE:
-- ============================================================================
-- Current sub_amount: 1,154.94 AED
-- New sub_amount: 1,154.94 + 720.00 = 1,874.94 AED
-- New VAT (5%): 1,874.94 × 0.05 = 93.75 AED
-- New total_amount: 1,874.94 + 93.75 = 1,968.69 AED
-- ============================================================================

