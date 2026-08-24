-- ============================================
-- Booking Queries - Autostrad ARC
-- ============================================

-- 1. Bookings for today (by pickup date)
SELECT 
  id,
  booking_number,
  type,
  user_first_name,
  user_last_name,
  user_email,
  pickup_date_time,
  dropoff_date_time,
  total_amount,
  payment_status,
  created_at
FROM bookings
WHERE DATE(pickup_date_time) = CURDATE()
ORDER BY created_at DESC;

-- 2. Bookings created today
SELECT 
  id,
  booking_number,
  type,
  user_email,
  pickup_date_time,
  total_amount,
  booking_date AS created_at
FROM bookings
WHERE DATE(booking_date) = CURDATE()
ORDER BY booking_date DESC;

-- 3. Recent bookings (last 7 days)
SELECT 
  id,
  booking_number,
  type,
  user_email,
  pickup_date_time,
  total_amount,
  payment_status,
  created_at
FROM bookings
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY created_at DESC;

-- 4. Monthly bookings (for Adjust / AdVolve)
SELECT 
  id,
  booking_number,
  user_email,
  pickup_date_time,
  total_amount,
  adjust_device_id,
  created_at
FROM bookings
WHERE type = 'monthly'
ORDER BY created_at DESC
LIMIT 50;

-- 5. Count of bookings today
SELECT COUNT(*) AS bookings_today
FROM bookings
WHERE DATE(pickup_date_time) = CURDATE();

-- 6. Bookings for a specific date (change date as needed)
SELECT id, booking_number, type, user_email, pickup_date_time, total_amount
FROM bookings
WHERE DATE(pickup_date_time) = '2026-01-28'
ORDER BY created_at DESC;
