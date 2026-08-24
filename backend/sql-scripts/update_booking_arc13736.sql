-- ============================================================================
-- DESCRIPTION: Update Booking Dates and Recalculate Amounts
-- ============================================================================
-- PURPOSE: Updates booking ARC13736 with new pickup/dropoff dates and 
--          recalculates all pricing components (discounts, VAT, total).
--
-- CUSTOMER: mariel del rosario (mevdelrosario@gmail.com, +971 588106752)
-- BOOKING:  ARC13736
-- CAR:      MG 5 (car_id: 52)
-- LOCATION: Airport Road (location_id: 1)
--
-- CHANGES:
--   - Original: Dec 19-20, 2025 (1 day)
--   - Updated:  Dec 24-28, 2025 (4 days)
--   - Recalculates pricing for 4-day rental with NEWAPP coupon (7% discount)
--
-- NOTES: Includes payment summary showing additional payment needed (263.06 AED)
-- ============================================================================
-- 
-- CURRENT BOOKING:
-- - Pickup: Dec 19, 2025 15:00 (3:00 PM)
-- - Dropoff: Dec 20, 2025 15:00 (3:00 PM)
-- - Days: 1
-- - Amount Paid: 87.70 AED
-- - Coupon: NEWAPP (7% discount)
-- - Payment: PAID (Payfort ID: 169999992890676548)
--
-- CUSTOMER REQUEST:
-- - Pickup: Dec 24, 2025 08:00 AM
-- - Dropoff: Dec 28, 2025 08:00 AM (assuming same time)
-- - Days: 4
--
-- PRICING CALCULATION:
-- Daily rate: 99.78 AED
-- For 4 days: 99.78 × 4 = 399.12 AED
-- NEWAPP discount (7%): 399.12 × 0.93 = 371.18 AED
-- Pay Now discount (10%): 371.18 × 0.9 = 334.06 AED
-- VAT (5%): 334.06 × 0.05 = 16.70 AED
-- NEW TOTAL: 350.76 AED
-- ALREADY PAID: 87.70 AED
-- ADDITIONAL PAYMENT NEEDED: 263.06 AED
-- ============================================

-- Step 1: Verify current booking
SELECT 
    id,
    booking_number,
    user_first_name,
    user_last_name,
    user_email,
    pickup_date_time,
    dropoff_date_time,
    booking_days,
    car_rate_total,
    coupon_discount_amount,
    pay_now_discount_amount,
    vat_amount,
    total_amount,
    payment_status
FROM bookings 
WHERE id = 13736;

-- ============================================
-- Step 2: UPDATE THE BOOKING
-- This updates the dates and recalculates the amounts
-- ============================================
UPDATE bookings 
SET 
    -- New dates
    pickup_date_time = '2025-12-24 08:00:00',
    dropoff_date_time = '2025-12-28 08:00:00',
    booking_days = 4,
    
    -- Recalculated amounts for 4 days
    car_rate_total = 399.12,           -- 99.78 × 4 days
    coupon_discount_amount = 27.94,    -- 399.12 × 7% (NEWAPP discount)
    pay_now_discount_amount = 37.12,   -- (399.12 - 27.94) × 10%
    sub_amount = 334.06,               -- After discounts
    vat_amount = 16.70,                -- 334.06 × 5%
    total_amount = 350.76,             -- Final amount
    actual_total_amount = 350.76,
    
    -- Update user_request JSON
    user_request = JSON_SET(
        user_request,
        '$.pickup_date', '2025-12-24',
        '$.pickup_time', '08:00',
        '$.dropoff_date', '2025-12-28',
        '$.dropoff_time', '08:00'
    ),
    
    updated_at = NOW()
WHERE id = 13736;

-- ============================================
-- Step 3: Verify the update
-- ============================================
SELECT 
    id,
    booking_number,
    pickup_date_time,
    dropoff_date_time,
    booking_days,
    car_rate_total,
    coupon_discount_amount,
    pay_now_discount_amount,
    sub_amount,
    vat_amount,
    total_amount,
    payment_status
FROM bookings 
WHERE id = 13736;

-- ============================================
-- SUMMARY FOR CUSTOMER:
-- ============================================
-- New Booking Details:
-- - Pickup: December 24, 2025 at 8:00 AM - Airport Road
-- - Dropoff: December 28, 2025 at 8:00 AM - Airport Road
-- - Duration: 4 days
-- - Car: MG 5
-- 
-- Payment Summary:
-- - New Total: 350.76 AED
-- - Already Paid: 87.70 AED
-- - BALANCE DUE: 263.06 AED
-- ============================================

-- ============================================
-- ALTERNATIVE: If you want to just update dates without price change
-- (Customer pays the difference separately)
-- ============================================
/*
UPDATE bookings 
SET 
    pickup_date_time = '2025-12-24 08:00:00',
    dropoff_date_time = '2025-12-28 08:00:00',
    booking_days = 4,
    updated_at = NOW()
WHERE id = 13736;
*/

-- ============================================
-- NOTES:
-- ============================================
-- 1. Customer: mariel del rosario
-- 2. Email: mevdelrosario@gmail.com
-- 3. Phone: +971 588106752
-- 4. The customer needs to pay an additional 263.06 AED
-- 5. Original payment was via Payfort (Mastercard ending 2516)
-- 6. After update, send confirmation to customer


