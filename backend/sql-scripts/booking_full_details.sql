-- ============================================
-- FULL BOOKING DETAILS WITH EMAIL STATUS
-- Autostrad ARC
-- ============================================

-- Comprehensive booking query with payment type and email confirmation status
SELECT 
    b.id,
    b.booking_number,
    b.type AS booking_type,
    b.payment_type,
    b.payment_status,
    CASE 
        WHEN b.payment_status = 1 THEN 'PAID'
        WHEN b.payment_status = 0 AND b.payment_type = 'pay_later' THEN 'PAY AT PICKUP'
        WHEN b.payment_status = 0 AND b.payment_type = 'pay_now' THEN 'PENDING PAYMENT'
        ELSE 'UNKNOWN'
    END AS payment_status_text,
    b.booking_source,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    b.user_phone_code,
    b.user_phone_number,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.booking_days,
    b.booking_months,
    b.car_rate_total,
    b.vat_amount,
    b.total_amount,
    b.coupon_code,
    b.coupon_discount_amount,
    b.adjust_device_id,
    b.created_at AS booking_created_at,
    -- Email confirmation status
    CASE 
        WHEN m.id IS NOT NULL AND m.status = 1 THEN 'YES - EMAIL SENT'
        WHEN m.id IS NOT NULL AND m.status = 0 THEN 'FAILED'
        ELSE 'NO EMAIL RECORD'
    END AS email_confirmation_sent,
    m.created_at AS email_sent_at,
    m.response AS email_response
FROM bookings b
LEFT JOIN mail_responses m 
    ON m.reference_number = b.id 
    AND m.template LIKE '%booking_confirm%'
ORDER BY b.created_at DESC
LIMIT 50;


-- ============================================
-- BOOKINGS FOR TODAY WITH EMAIL STATUS
-- ============================================
SELECT 
    b.id,
    b.booking_number,
    b.type AS booking_type,
    b.payment_type,
    CASE 
        WHEN b.payment_status = 1 THEN 'PAID'
        WHEN b.payment_status = 0 AND b.payment_type = 'pay_later' THEN 'PAY AT PICKUP'
        WHEN b.payment_status = 0 AND b.payment_type = 'pay_now' THEN 'PENDING PAYMENT'
        ELSE 'UNKNOWN'
    END AS payment_status_text,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    CONCAT(b.user_phone_code, ' ', b.user_phone_number) AS phone,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.total_amount,
    CASE 
        WHEN m.id IS NOT NULL AND m.status = 1 THEN 'YES'
        WHEN m.id IS NOT NULL AND m.status = 0 THEN 'FAILED'
        ELSE 'NO'
    END AS email_sent,
    b.created_at
FROM bookings b
LEFT JOIN mail_responses m 
    ON m.reference_number = b.id 
    AND m.template LIKE '%booking_confirm%'
WHERE DATE(b.pickup_date_time) = CURDATE()
ORDER BY b.created_at DESC;


-- ============================================
-- MONTHLY BOOKINGS (FOR ADVOLVE / ADJUST)
-- ============================================
SELECT 
    b.id,
    b.booking_number,
    b.payment_type,
    CASE WHEN b.payment_status = 1 THEN 'PAID' ELSE 'PENDING' END AS payment_status_text,
    b.user_first_name,
    b.user_last_name,
    b.user_email,
    b.pickup_date_time,
    b.dropoff_date_time,
    b.booking_months,
    b.total_amount,
    b.adjust_device_id,
    CASE 
        WHEN m.id IS NOT NULL AND m.status = 1 THEN 'YES'
        ELSE 'NO'
    END AS email_sent,
    b.created_at
FROM bookings b
LEFT JOIN mail_responses m 
    ON m.reference_number = b.id 
    AND m.template LIKE '%booking_confirm%'
WHERE b.type = 'monthly'
ORDER BY b.created_at DESC
LIMIT 50;


-- ============================================
-- CHECK EMAIL STATUS FOR A SPECIFIC BOOKING
-- Replace 15787 with actual booking ID
-- ============================================
SELECT 
    b.id,
    b.booking_number,
    b.user_email,
    m.id AS mail_id,
    m.to AS email_to,
    m.subject AS email_subject,
    m.template AS email_template,
    m.status AS email_status,
    CASE WHEN m.status = 1 THEN 'SENT' ELSE 'FAILED' END AS status_text,
    m.response AS email_response,
    m.created_at AS email_sent_at
FROM bookings b
LEFT JOIN mail_responses m ON m.reference_number = b.id
WHERE b.id = 15787;


-- ============================================
-- SUMMARY: EMAIL DELIVERY STATS
-- ============================================
SELECT 
    COUNT(DISTINCT b.id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN m.status = 1 THEN b.id END) AS emails_sent,
    COUNT(DISTINCT CASE WHEN m.status = 0 THEN b.id END) AS emails_failed,
    COUNT(DISTINCT CASE WHEN m.id IS NULL THEN b.id END) AS no_email_record
FROM bookings b
LEFT JOIN mail_responses m 
    ON m.reference_number = b.id 
    AND m.template LIKE '%booking_confirm%'
WHERE b.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
