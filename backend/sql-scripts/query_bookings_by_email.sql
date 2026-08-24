-- Query to fetch bookings and user data for email: tanasegeorgeionut@gmail.com
-- This query searches in both bookings.user_email and users.email fields

-- ============================================
-- OPTION 1: Comprehensive Query with All Details
-- ============================================

SELECT 
    -- Booking Basic Info
    b.id AS booking_id,
    b.booking_number,
    b.booking_log_number,
    b.type AS booking_type,
    b.action AS booking_action,
    b.booking_date,
    b.booking_days,
    b.booking_months,
    b.payment_type,
    b.payment_status,
    b.booking_source,
    
    -- User Info
    b.user_id,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_full_name,
    b.user_email AS booking_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone,
    u.email AS user_account_email,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    CONCAT(u.phone_code, u.phone_number) AS user_account_phone,
    u.gender,
    u.dob,
    u.status AS user_status,
    
    -- Pickup Details
    b.pickup_type,
    pl.name_en AS pickup_location_name,
    b.pickup_address,
    b.pickup_landmark,
    b.pickup_date_time,
    pe.name_en AS pickup_emirate,
    
    -- Dropoff Details
    b.dropoff_type,
    dl.name_en AS dropoff_location_name,
    b.dropoff_address,
    b.dropoff_landmark,
    b.dropoff_date_time,
    de.name_en AS dropoff_emirate,
    
    -- Car Details
    c.name_en AS car_name,
    cg.name_en AS car_group_name,
    
    -- Financial Details
    b.car_rate_total,
    b.car_extras_rate_total,
    b.discount_total,
    b.vat_amount,
    b.total_amount,
    b.pay_now_amount,
    b.pay_later_amount,
    b.cancellation_charges,
    b.refund_amount,
    b.refund_status,
    
    -- Other Details
    b.comments,
    b.cancellation_reason,
    b.cancellation_date_time,
    b.created_at,
    b.updated_at
    
FROM 
    bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN locations pl ON b.pickup_location_id = pl.id
    LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
    LEFT JOIN emirates pe ON b.pickup_emirate_id = pe.id
    LEFT JOIN emirates de ON b.dropoff_emirate_id = de.id
    LEFT JOIN cars c ON b.car_id = c.id
    LEFT JOIN car_groups cg ON b.group_id = cg.id
    
WHERE 
    b.user_email = 'tanasegeorgeionut@gmail.com'
    OR u.email = 'tanasegeorgeionut@gmail.com'
    
ORDER BY 
    b.booking_date DESC, b.created_at DESC;

-- ============================================
-- OPTION 2: Simple Query - Just Bookings
-- ============================================

SELECT 
    b.*,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS user_full_name,
    CONCAT(b.user_phone_code, b.user_phone_number) AS user_phone
FROM 
    bookings b
WHERE 
    b.user_email = 'tanasegeorgeionut@gmail.com'
ORDER BY 
    b.booking_date DESC;

-- ============================================
-- OPTION 3: User Info and Booking Count
-- ============================================

SELECT 
    u.id AS user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS user_full_name,
    CONCAT(u.phone_code, u.phone_number) AS user_phone,
    u.gender,
    u.dob,
    u.created_at AS registered_at,
    u.last_login_at,
    COUNT(b.id) AS total_bookings,
    SUM(CASE WHEN b.payment_status = 1 THEN 1 ELSE 0 END) AS paid_bookings,
    SUM(CASE WHEN b.cancellation_date_time IS NOT NULL THEN 1 ELSE 0 END) AS cancelled_bookings
FROM 
    users u
    LEFT JOIN bookings b ON u.id = b.user_id
WHERE 
    u.email = 'tanasegeorgeionut@gmail.com'
GROUP BY 
    u.id, u.email, u.first_name, u.last_name, u.phone_code, u.phone_number, 
    u.gender, u.dob, u.created_at, u.last_login_at;

-- ============================================
-- OPTION 4: Recent Bookings with Full Details (Most Useful)
-- ============================================

SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.type,
    b.booking_date,
    b.pickup_date_time,
    b.dropoff_date_time,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS customer_name,
    b.user_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS customer_phone,
    pl.name_en AS pickup_location,
    dl.name_en AS dropoff_location,
    c.name_en AS car_name,
    b.total_amount,
    b.payment_status,
    b.payment_type,
    CASE 
        WHEN b.cancellation_date_time IS NOT NULL THEN 'Cancelled'
        WHEN b.payment_status = 1 THEN 'Paid'
        WHEN b.payment_type = 'now' AND b.payment_status = 0 THEN 'Pending Payment'
        ELSE 'Pay Later'
    END AS booking_status,
    b.comments,
    b.created_at
FROM 
    bookings b
    LEFT JOIN locations pl ON b.pickup_location_id = pl.id
    LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
    LEFT JOIN cars c ON b.car_id = c.id
WHERE 
    b.user_email = 'tanasegeorgeionut@gmail.com'
    OR b.user_id IN (SELECT id FROM users WHERE email = 'tanasegeorgeionut@gmail.com')
ORDER BY 
    b.booking_date DESC
LIMIT 50;

-- ============================================
-- OPTION 5: Check if User Exists and Get All Related Data
-- ============================================

-- First, check if user exists
SELECT 
    'User Account' AS data_type,
    u.id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS name,
    u.created_at,
    u.last_login_at
FROM 
    users u
WHERE 
    u.email = 'tanasegeorgeionut@gmail.com'

UNION ALL

-- Then get all bookings
SELECT 
    'Booking' AS data_type,
    b.id,
    b.user_email AS email,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS name,
    b.booking_date AS created_at,
    NULL AS last_login_at
FROM 
    bookings b
WHERE 
    b.user_email = 'tanasegeorgeionut@gmail.com'
ORDER BY 
    created_at DESC;

