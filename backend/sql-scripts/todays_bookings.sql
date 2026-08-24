-- ============================================================
-- Query: Today's Bookings Report
-- Date: January 15, 2026
-- ============================================================

-- ============================================================
-- 1. ALL CONFIRMED BOOKINGS WITH PICKUP TODAY
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    b.booking_date,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS customer_name,
    b.user_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS phone,
    b.pickup_date_time,
    pl.name_en AS pickup_location,
    b.dropoff_date_time,
    dl.name_en AS dropoff_location,
    c.name_en AS car,
    b.type AS booking_type,
    b.booking_days,
    b.payment_type,
    b.payment_status,
    b.total_amount,
    b.action
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
LEFT JOIN cars c ON b.car_id = c.id
WHERE DATE(b.pickup_date_time) = CURDATE()
  AND b.action = 'book'
ORDER BY b.pickup_date_time ASC;

-- ============================================================
-- 2. ALL BOOKINGS MADE TODAY (regardless of pickup date)
-- ============================================================
SELECT 
    b.id,
    b.booking_number,
    b.booking_date,
    CONCAT(b.user_first_name, ' ', b.user_last_name) AS customer_name,
    b.user_email,
    CONCAT(b.user_phone_code, b.user_phone_number) AS phone,
    b.pickup_date_time,
    pl.name_en AS pickup_location,
    b.dropoff_date_time,
    dl.name_en AS dropoff_location,
    c.name_en AS car,
    b.type AS booking_type,
    b.payment_type,
    b.payment_status,
    b.total_amount,
    b.action
FROM bookings b
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
LEFT JOIN cars c ON b.car_id = c.id
WHERE DATE(b.booking_date) = CURDATE()
ORDER BY b.booking_date DESC;

-- ============================================================
-- 3. SUMMARY: Counts for today
-- ============================================================
SELECT 
    'Pickups Today (Confirmed)' AS metric,
    COUNT(*) AS count
FROM bookings 
WHERE DATE(pickup_date_time) = CURDATE() 
  AND action = 'book'

UNION ALL

SELECT 
    'Bookings Made Today' AS metric,
    COUNT(*) AS count
FROM bookings 
WHERE DATE(booking_date) = CURDATE()

UNION ALL

SELECT 
    'Cancelled Today' AS metric,
    COUNT(*) AS count
FROM bookings 
WHERE DATE(cancellation_date_time) = CURDATE() 
  AND action = 'cancel';

