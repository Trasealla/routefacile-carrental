-- ============================================================================
-- DESCRIPTION: Delete All Bookings and User Records for Rachel Green
-- ============================================================================
-- PURPOSE: Permanently removes all booking and user data for a specific 
--          customer (Rachel Green) including all related records.
--
-- WARNING: PERMANENT DELETION - This script will delete:
--   1. All bookings (11 bookings by booking IDs)
--   2. Payment transactions linked to those bookings
--   3. Monthly installments linked to those bookings
--   4. User records (drivers, documents, forgot password entries)
--   5. User account records
--
-- CUSTOMER: Rachel Green (taleeb.syed41@gmail.com)
-- BOOKINGS: IDs 5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 
--           12287, 13121
--
-- NOTES: Includes verification queries to preview what will be deleted and 
--        confirm successful deletion. Execute with caution.
-- ============================================================================

-- STEP 1: CHECK WHAT WILL BE DELETED (RECOMMENDED)
-- ============================================================================
-- Check bookings
SELECT 
    id,
    booking_number,
    booking_log_number,
    user_id,
    CONCAT(user_first_name, ' ', user_last_name) AS user_name,
    user_email,
    CONCAT(user_phone_code, user_phone_number) AS user_phone,
    booking_date,
    pickup_date_time,
    dropoff_date_time,
    total_amount,
    payment_status,
    action
FROM 
    bookings
WHERE 
    user_first_name = 'Rachel' 
    AND user_last_name = 'Green';

-- Check users (to get user_id)
SELECT 
    id,
    CONCAT(first_name, ' ', last_name) AS user_name,
    email,
    CONCAT(phone_code, phone_number) AS user_phone,
    created_at
FROM 
    users
WHERE 
    first_name = 'Rachel' 
    AND last_name = 'Green';

-- ============================================================================
-- STEP 2: GET USER ID(S) FROM BOOKINGS
-- ============================================================================
-- Get the user_id(s) from the bookings (use this result to update the user deletion queries below)
SELECT DISTINCT user_id
FROM bookings
WHERE id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- ============================================================================
-- STEP 3: CHECK RELATED RECORDS (Payment Transactions & Monthly Installments)
-- ============================================================================
-- Check payment transactions
SELECT COUNT(*) AS payment_transactions_count
FROM booking_payment_transactions
WHERE booking_id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- Check monthly installments
SELECT COUNT(*) AS monthly_installments_count
FROM booking_monthly_installments
WHERE booking_id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- Check user-related records (replace USER_ID_HERE with actual user_id from STEP 2)
-- SELECT COUNT(*) AS user_drivers_count FROM user_drivers WHERE user_id = USER_ID_HERE;
-- SELECT COUNT(*) AS user_documents_count FROM user_documents WHERE user_id = USER_ID_HERE;
-- SELECT COUNT(*) AS user_forgot_password_count FROM user_forgot_passwords WHERE user_id = USER_ID_HERE;

-- ============================================================================
-- STEP 4: DELETE BOOKING-RELATED RECORDS FIRST (Required due to foreign key constraints)
-- ============================================================================
-- Delete payment transactions
DELETE FROM booking_payment_transactions
WHERE booking_id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- Delete monthly installments
DELETE FROM booking_monthly_installments
WHERE booking_id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- ============================================================================
-- STEP 5: DELETE ALL BOOKINGS FOR "Rachel Green"
-- ============================================================================
-- READY TO EXECUTE - 11 bookings will be deleted
-- Using primary key (id) to satisfy MySQL safe update mode
-- ============================================================================

DELETE FROM bookings
WHERE id IN (
    5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
);

-- ============================================================================
-- STEP 6: DELETE USER-RELATED RECORDS
-- ============================================================================
-- IMPORTANT: If subqueries don't work, use the user_id from STEP 2 directly
-- Example: DELETE FROM user_drivers WHERE user_id = 12345;
-- ============================================================================

-- Option 1: Using subquery (may not work in all MySQL versions)
-- Delete user drivers
DELETE FROM user_drivers
WHERE user_id IN (
    SELECT DISTINCT user_id
    FROM bookings
    WHERE id IN (
        5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
    )
);

-- Delete user documents
DELETE FROM user_documents
WHERE user_id IN (
    SELECT DISTINCT user_id
    FROM bookings
    WHERE id IN (
        5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
    )
);

-- Delete user forgot password records (CORRECTED TABLE NAME: user_forgot_passwords)
DELETE FROM user_forgot_passwords
WHERE user_id IN (
    SELECT DISTINCT user_id
    FROM bookings
    WHERE id IN (
        5681, 5716, 6423, 6424, 6426, 6427, 6428, 12284, 12286, 12287, 13121
    )
);

-- ============================================================================
-- ALTERNATIVE: If subqueries fail, get user_id from users table directly
-- ============================================================================
-- This approach gets user_id from users table (works even if bookings are deleted)
DELETE ud FROM user_drivers ud
INNER JOIN users u ON ud.user_id = u.id
WHERE u.first_name = 'Rachel' 
    AND u.last_name = 'Green'
    AND u.email = 'taleeb.syed41@gmail.com';

DELETE ud FROM user_documents ud
INNER JOIN users u ON ud.user_id = u.id
WHERE u.first_name = 'Rachel' 
    AND u.last_name = 'Green'
    AND u.email = 'taleeb.syed41@gmail.com';

DELETE ufp FROM user_forgot_passwords ufp
INNER JOIN users u ON ufp.user_id = u.id
WHERE u.first_name = 'Rachel' 
    AND u.last_name = 'Green'
    AND u.email = 'taleeb.syed41@gmail.com';

-- ============================================================================
-- STEP 7: DELETE USER(S) FOR "Rachel Green"
-- ============================================================================
-- Delete by name and email (matches the bookings we're deleting)
DELETE FROM users
WHERE first_name = 'Rachel' 
    AND last_name = 'Green'
    AND email = 'taleeb.syed41@gmail.com';

-- ============================================================================
-- VERIFICATION: Check if deletion was successful (should return 0 rows)
-- ============================================================================
-- Check remaining bookings
SELECT COUNT(*) AS remaining_bookings
FROM bookings
WHERE 
    user_first_name = 'Rachel' 
    AND user_last_name = 'Green';

-- Check remaining users
SELECT COUNT(*) AS remaining_users
FROM users
WHERE 
    first_name = 'Rachel' 
    AND last_name = 'Green';

