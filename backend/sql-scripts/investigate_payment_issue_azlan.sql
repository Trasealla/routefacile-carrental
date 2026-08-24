-- Investigation Query for Payment Issue - azlanahamed@gmail.com
-- Based on WhatsApp conversation: "amount deducted from my account" but booking shows payment_status = 0

-- ============================================
-- 1. Check Recent Bookings with Payment Issues
-- ============================================

SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_date,
    b.payment_type,
    b.payment_status,
    b.payment_triggered,
    b.total_amount,
    b.pay_now_amount,
    b.payfort_id,
    b.payfort_response,
    b.action,
    b.cancellation_date_time,
    CASE 
        WHEN b.payment_status = 1 THEN '✅ Paid'
        WHEN b.payment_type = 'now' AND b.payment_status = 0 AND b.payment_triggered = 1 THEN '⚠️ Payment Attempted but Failed'
        WHEN b.payment_type = 'now' AND b.payment_status = 0 AND b.payment_triggered = 0 THEN '❌ Payment Not Attempted'
        WHEN b.payment_type = 'now' AND b.payment_status = 0 AND b.payfort_id IS NOT NULL THEN '⚠️ Payment Gateway ID Exists but Status Not Updated'
        ELSE 'ℹ️ Pay Later'
    END AS payment_status_description,
    b.created_at,
    b.updated_at
FROM 
    bookings b
WHERE 
    b.user_email = 'azlanahamed@gmail.com'
    AND b.booking_date >= '2026-01-24'
ORDER BY 
    b.booking_date DESC;

-- ============================================
-- 2. Check if Payfort Payment Records Exist
-- ============================================

SELECT 
    b.id,
    b.booking_number,
    b.booking_date,
    b.payfort_id,
    b.payfort_response,
    JSON_EXTRACT(b.payfort_response, '$.response_code') AS payfort_response_code,
    JSON_EXTRACT(b.payfort_response, '$.response_message') AS payfort_response_message,
    JSON_EXTRACT(b.payfort_response, '$.status') AS payfort_status,
    b.payment_status,
    b.total_amount
FROM 
    bookings b
WHERE 
    b.user_email = 'azlanahamed@gmail.com'
    AND b.booking_date >= '2026-01-24'
    AND b.payfort_id IS NOT NULL
ORDER BY 
    b.booking_date DESC;

-- ============================================
-- 3. Check All Duplicate/Similar Bookings on Same Day
-- ============================================

    SELECT 
        DATE(b.booking_date) AS booking_day,
        COUNT(*) AS total_bookings,
        COUNT(CASE WHEN b.payment_status = 1 THEN 1 END) AS paid_count,
        COUNT(CASE WHEN b.payment_status = 0 THEN 1 END) AS unpaid_count,
        COUNT(CASE WHEN b.action = 'cancel' THEN 1 END) AS cancelled_count,
        SUM(b.total_amount) AS total_amount_attempted,
        GROUP_CONCAT(b.booking_number ORDER BY b.booking_date) AS booking_numbers
    FROM 
        bookings b
    WHERE 
        b.user_email = 'azlanahamed@gmail.com'
        AND b.booking_date >= '2026-01-24'
    GROUP BY 
        DATE(b.booking_date)
    ORDER BY 
        booking_day DESC;

-- ============================================
-- 4. Check Payment Gateway Response Details
-- ============================================

SELECT 
    b.booking_number,
    b.booking_date,
    b.payfort_id,
    b.payfort_response,
    b.payment_triggered,
    b.payment_status,
    b.total_amount,
    b.action
FROM 
    bookings b
WHERE 
    b.user_email = 'azlanahamed@gmail.com'
    AND b.booking_date >= '2026-01-24'
    AND (
        b.payfort_id IS NOT NULL 
        OR b.payfort_response IS NOT NULL
        OR b.payment_triggered = 1
    )
ORDER BY 
    b.booking_date DESC;

-- ============================================
-- 5. Summary: All Recent Bookings Status
-- ============================================

    SELECT 
        b.booking_number,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d %H:%i') AS booking_time,
        b.payment_type,
        CASE b.payment_status 
            WHEN 1 THEN '✅ PAID'
            WHEN 0 THEN '❌ NOT PAID'
            ELSE 'UNKNOWN'
        END AS payment_status,
        b.action AS booking_action,
        b.total_amount,
        b.pay_now_amount,
        CASE 
            WHEN b.cancellation_date_time IS NOT NULL THEN 'CANCELLED'
            WHEN b.pickup_date_time < NOW() THEN 'EXPIRED'
            ELSE 'ACTIVE'
        END AS booking_status,
        b.payfort_id,
        b.payment_triggered
    FROM 
        bookings b
    WHERE 
        b.user_email = 'azlanahamed@gmail.com'
        AND b.booking_date >= '2026-01-24'
    ORDER BY 
        b.booking_date DESC;

