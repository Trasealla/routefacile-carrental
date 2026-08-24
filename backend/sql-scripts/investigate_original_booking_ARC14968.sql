-- Investigation Script for Booking ARC14968
-- Issue: Customer did not receive email for the original booking before extension
-- Extension Date: Fri, Jan 16, 2026, 02:12:44 PM GST
-- Customer: Aswin Subramanian (aswin_05@hotmail.com)
-- Booking Number: ARC14968

-- ============================================================
-- 1. FIND ALL BOOKINGS WITH THIS BOOKING NUMBER (ORIGINAL + EXTENSIONS)
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_date,
    b.action,
    b.parent_id,
    CASE 
        WHEN b.parent_id IS NULL AND b.action = 'book' THEN 'ORIGINAL BOOKING'
        WHEN b.action = 'extend' THEN 'EXTENSION'
        WHEN b.action = 'edit' THEN 'EDITED'
        WHEN b.action = 'cancel' THEN 'CANCELLED'
        ELSE 'OTHER'
    END AS booking_type,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    b.user_phone_code,
    b.user_phone_number,
    b.pickup_location_id,
    pl.name_en AS pickup_location_name,
    b.dropoff_location_id,
    dl.name_en AS dropoff_location_name,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.payment_type,
    b.payment_status,
    b.payfort_id,
    b.total_amount,
    b.created_at,
    b.updated_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE b.booking_number = 'ARC14968'
ORDER BY b.created_at ASC;

-- ============================================================
-- 2. FIND THE ORIGINAL BOOKING (BEFORE EXTENSION)
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_date,
    b.action,
    b.parent_id,
    'ORIGINAL BOOKING' AS booking_type,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    b.user_phone_code,
    b.user_phone_number,
    b.pickup_location_id,
    pl.name_en AS pickup_location_name,
    pl.recipients AS pickup_location_recipients,
    b.dropoff_location_id,
    dl.name_en AS dropoff_location_name,
    dl.recipients AS dropoff_location_recipients,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.payment_type,
    b.payment_status,
    b.payfort_id,
    b.total_amount,
    b.created_at,
    b.updated_at
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE b.booking_number = 'ARC14968'
  AND b.action = 'book'
  AND b.parent_id IS NULL;

-- ============================================================
-- 3. FIND THE EXTENSION BOOKING
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_date,
    b.action,
    b.parent_id,
    'EXTENSION' AS booking_type,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.payment_type,
    b.payment_status,
    b.payfort_id,
    b.total_amount,
    b.created_at,
    b.updated_at,
    parent.id AS original_booking_id,
    parent.booking_date AS original_booking_date
FROM bookings b
LEFT JOIN bookings parent ON b.parent_id = parent.id
WHERE b.booking_number = 'ARC14968'
  AND b.action = 'extend'
ORDER BY b.created_at DESC;

-- ============================================================
-- 4. CHECK EMAIL LOGS FOR THE ORIGINAL BOOKING
-- ============================================================
-- First, get the original booking ID
-- Then check email logs for that booking ID
SELECT 
    mr.id,
    mr.reference_number AS booking_id,
    mr.`to`,
    mr.cc,
    mr.subject,
    mr.status AS email_status,  -- 1 = success, 0 = failure
    mr.response,
    mr.created_at
FROM mail_responses mr
WHERE mr.reference_number IN (
    SELECT id FROM bookings 
    WHERE booking_number = 'ARC14968' 
      AND action = 'book' 
      AND parent_id IS NULL
)
   OR (mr.subject LIKE '%ARC14968%' AND mr.subject LIKE '%Booking with Autostrad%')
   OR (mr.`to` LIKE '%aswin_05@hotmail.com%' AND mr.subject LIKE '%Booking with Autostrad%')
ORDER BY mr.created_at DESC;

-- ============================================================
-- 5. CHECK EMAIL LOGS FOR THE EXTENSION BOOKING
-- ============================================================
SELECT 
    mr.id,
    mr.reference_number AS booking_id,
    mr.`to`,
    mr.cc,
    mr.subject,
    mr.status AS email_status,  -- 1 = success, 0 = failure
    mr.response,
    mr.created_at
FROM mail_responses mr
WHERE mr.reference_number IN (
    SELECT id FROM bookings 
    WHERE booking_number = 'ARC14968' 
      AND action = 'extend'
)
   OR (mr.subject LIKE '%ARC14968%' AND mr.subject LIKE '%extended%')
   OR (mr.`to` LIKE '%aswin_05@hotmail.com%' AND mr.subject LIKE '%extended%')
ORDER BY mr.created_at DESC;

-- ============================================================
-- 6. CHECK ALL EMAILS SENT TO THIS CUSTOMER
-- ============================================================
SELECT 
    mr.id,
    mr.reference_number AS booking_id,
    mr.`to`,
    mr.cc,
    mr.subject,
    mr.status AS email_status,
    mr.response,
    mr.created_at
FROM mail_responses mr
WHERE mr.`to` LIKE '%aswin_05@hotmail.com%'
ORDER BY mr.created_at DESC
LIMIT 20;

-- ============================================================
-- 7. COMPARE ORIGINAL VS EXTENSION BOOKING DETAILS
-- ============================================================
SELECT 
    'ORIGINAL' AS booking_version,
    b.id,
    b.booking_date,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.total_amount,
    b.payment_type,
    b.payment_status,
    b.payfort_id,
    b.created_at
FROM bookings b
WHERE b.booking_number = 'ARC14968'
  AND b.action = 'book'
  AND b.parent_id IS NULL

UNION ALL

SELECT 
    'EXTENSION' AS booking_version,
    b.id,
    b.booking_date,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.total_amount,
    b.payment_type,
    b.payment_status,
    b.payfort_id,
    b.created_at
FROM bookings b
WHERE b.booking_number = 'ARC14968'
  AND b.action = 'extend'
ORDER BY created_at ASC;

-- ============================================================
-- 8. QUICK QUERY TO GET PAYFORT IDs FOR BOTH BOOKINGS
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    CASE 
        WHEN b.parent_id IS NULL AND b.action = 'book' THEN 'ORIGINAL'
        WHEN b.action = 'extend' THEN 'EXTENSION'
    END AS booking_type,
    b.payfort_id,
    b.payment_status,
    b.total_amount
FROM bookings b
WHERE b.booking_number = 'ARC14968'
  AND (b.action = 'book' OR b.action = 'extend')
ORDER BY b.created_at ASC;

-- ============================================================
-- ANALYSIS:
-- ============================================================
-- Based on the email notification, the extension was created on:
--   Date: Fri, Jan 16, 2026, 02:12:44 PM GST
--   Booking Number: ARC14968
--   Customer: Aswin Subramanian (aswin_05@hotmail.com)
--
-- The original booking should be:
--   - Same booking_number: ARC14968
--   - action = 'book'
--   - parent_id IS NULL
--   - Created BEFORE the extension
--
-- To find the original booking:
-- 1. Run query #1 to see all bookings with this booking number
-- 2. Run query #2 to get the original booking details
-- 3. Run query #4 to check if email was sent for the original booking
--
-- If no email was sent for the original booking, possible reasons:
-- 1. Email failed to send (check email_status in mail_responses)
-- 2. Email was sent but customer didn't receive it (spam/junk folder)
-- 3. Email service was down at the time of original booking
-- 4. Original booking was created through a different flow that doesn't send emails
-- ============================================================

