-- Investigation Script for Booking ARC14951
-- Issue: Branch (WTC Mall) claims they did not receive the booking notification
-- Booking Date: Wed, Jan 14, 2026, 07:33:14 PM GST
-- Customer: Devendra Vaidya (vaidya.devendra@gmail.com)

-- ============================================================
-- 1. CHECK THE BOOKING EXISTS AND GET DETAILS
-- ============================================================
        SELECT 
            b.id,
            b.booking_number,
            b.booking_date,
            b.user_first_name,
            b.user_last_name,
            b.user_email,
            b.pickup_location_id,
            pl.name_en AS pickup_location_name,
            pl.recipients AS pickup_location_recipients,
            b.dropoff_location_id,
            dl.name_en AS dropoff_location_name,
            dl.recipients AS dropoff_location_recipients,
            b.pickup_type,
            b.dropoff_type,
            b.payment_type,
            b.action,
            b.payment_status
        FROM bookings b
        LEFT JOIN locations pl ON b.pickup_location_id = pl.id
        LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
        WHERE b.booking_number = 'ARC14951';

-- ============================================================
-- 2. CHECK EMAIL LOGS FOR THIS BOOKING
-- ============================================================
-- The booking ID is 14951 (extracted from booking_number = ARC14951)
SELECT 
    id,
    reference_number AS booking_id,
    `to`,
    cc,
    subject,
    status AS email_status,  -- 1 = success, 0 = failure
    response,
    created_at
FROM mail_responses 
WHERE reference_number = 14951
   OR (subject LIKE '%ARC14951%' OR `to` LIKE '%vaidya.devendra%')
ORDER BY created_at DESC;

-- ============================================================
-- 3. CHECK ALL BOOKING CONFIRMATION EMAILS SENT ON JAN 14, 2026
-- ============================================================
SELECT 
    id,
    reference_number,
    `to`,
    cc,
    subject,
    status,
    response,
    created_at
FROM mail_responses 
WHERE subject LIKE '%Booking with Autostrad%'
  AND created_at BETWEEN '2026-01-14 00:00:00' AND '2026-01-14 23:59:59'
ORDER BY created_at DESC;

-- ============================================================
-- 4. CHECK WORLD TRADE CENTER MALL LOCATION CONFIG
-- ============================================================
SELECT 
    id,
    name_en,
    recipients,
    status,
    contact_number
FROM locations 
WHERE name_en LIKE '%World Trade%' 
   OR name_en LIKE '%WTC%';

-- ============================================================
-- 5. VERIFY ALL ACTIVE LOCATIONS AND THEIR RECIPIENTS
-- ============================================================
SELECT 
    id,
    name_en,
    recipients,
    status
FROM locations 
WHERE status = 1
ORDER BY name_en;

-- ============================================================
-- ANALYSIS:
-- ============================================================
-- Based on the email chain, the customer received the booking confirmation
-- email with CC to:
--   - reservations@autostrad.com
--   - wtcmall@autostrad.com
--   - mohammed.kunhi@autostrad.com  
--   - mohamed.reda@autostrad.com
--
-- This confirms that:
-- 1. The backend SENT the email correctly with the branch in CC
-- 2. The issue is NOT with the backend code
--
-- Possible causes why the branch didn't receive the email:
-- 1. Email went to spam/junk folder at wtcmall@autostrad.com
-- 2. Email server-side filtering/rules
-- 3. Mailbox quota exceeded
-- 4. Network/DNS issues with email delivery
--
-- RECOMMENDATION:
-- 1. Check the mail_responses table to confirm email was sent successfully (status = 1)
-- 2. Have IT team check the email server logs for wtcmall@autostrad.com
-- 3. Check if the email landed in spam/junk folder
-- 4. Verify email delivery with Mimecast (mentioned in email footer)
-- ============================================================

