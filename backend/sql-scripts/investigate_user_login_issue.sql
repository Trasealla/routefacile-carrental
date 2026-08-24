-- ============================================================================
-- DESCRIPTION: Investigate "Cannot proceed due to existing number or email" issue
-- ============================================================================
-- PURPOSE: Debug why users cannot register/login when they get this error
-- User from complaint: Phone: 0507133547 / Email: cyrusjhops@yahoo.com
-- ============================================================================

-- ===========================================================================
-- PART 1: Check this specific user
-- ===========================================================================

-- Query 1: Find user by email (exact match)
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_code,
    phone_number,
    status,
    CASE status WHEN 1 THEN 'ACTIVE' WHEN 0 THEN 'INACTIVE' ELSE 'UNKNOWN' END as status_text,
    register_otp,
    password IS NOT NULL as has_password,
    last_login_at,
    created_at,
    deleted_at
FROM users 
WHERE email = 'cyrusjhops@yahoo.com';

-- Query 2: Find user by email (case insensitive)
SELECT 
    id, email, phone_number, status, created_at, deleted_at
FROM users 
WHERE LOWER(email) = LOWER('cyrusjhops@yahoo.com');

-- Query 3: Find user by phone number (with/without leading zero)
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_code,
    phone_number,
    status,
    CASE status WHEN 1 THEN 'ACTIVE' WHEN 0 THEN 'INACTIVE' ELSE 'UNKNOWN' END as status_text,
    created_at,
    deleted_at
FROM users 
WHERE phone_number IN ('0507133547', '507133547', '+971507133547');

-- Query 4: Check for similar phone numbers (partial match)
SELECT 
    id, email, phone_code, phone_number, status, created_at
FROM users 
WHERE phone_number LIKE '%507133547%';

-- ===========================================================================
-- PART 2: Common issues causing "existing number or email" error
-- ===========================================================================

-- Query 5: Find all INACTIVE users (status = 0) - these users exist but can't login
SELECT 
    id, 
    email, 
    phone_number, 
    status,
    register_otp,
    created_at,
    deleted_at
FROM users 
WHERE status = 0
ORDER BY created_at DESC
LIMIT 50;

-- Query 6: Find users with OTP still set (incomplete registration)
SELECT 
    id, 
    email, 
    phone_number, 
    status,
    register_otp,
    created_at
FROM users 
WHERE register_otp IS NOT NULL
ORDER BY created_at DESC
LIMIT 50;

-- Query 7: Find soft-deleted users (these block re-registration with same email)
SELECT 
    id,
    email,
    phone_number,
    status,
    created_at,
    deleted_at
FROM users 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 50;

-- ===========================================================================
-- PART 3: Duplicate detection
-- ===========================================================================

-- Query 8: Find duplicate emails (case sensitive)
SELECT 
    email, 
    COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Query 9: Find duplicate emails (case insensitive)
SELECT 
    LOWER(email) as email_lower, 
    COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Query 10: Find duplicate phone numbers
SELECT 
    phone_number, 
    COUNT(*) as count
FROM users
WHERE deleted_at IS NULL AND phone_number IS NOT NULL AND phone_number != ''
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- ===========================================================================
-- PART 4: Stats for understanding the scale
-- ===========================================================================

-- Query 11: User registration stats by status
SELECT 
    status,
    CASE status WHEN 1 THEN 'ACTIVE' WHEN 0 THEN 'INACTIVE' ELSE 'UNKNOWN' END as status_text,
    COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY status;

-- Query 12: Recent registrations (last 7 days)
SELECT 
    DATE(created_at) as registration_date,
    COUNT(*) as total_registrations,
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_users
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;

-- Query 13: Users who never logged in (might indicate registration issues)
SELECT 
    id,
    email,
    phone_number,
    status,
    register_otp,
    created_at
FROM users
WHERE last_login_at IS NULL 
    AND deleted_at IS NULL
    AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC
LIMIT 50;

-- ===========================================================================
-- PART 5: Solutions (uncomment to execute)
-- ===========================================================================

-- SOLUTION A: Activate an inactive user
-- UPDATE users SET status = 1, register_otp = NULL WHERE email = 'cyrusjhops@yahoo.com';

-- SOLUTION B: Clear OTP for user to retry activation
-- UPDATE users SET register_otp = NULL WHERE email = 'cyrusjhops@yahoo.com';

-- SOLUTION C: Reset password for existing user
-- Step 1: Generate hash in Node.js: bcrypt.hashSync('newpassword123', 10)
-- UPDATE users 
-- SET password = '$2b$10$YOUR_HASH_HERE', 
--     password_org = 'newpassword123'
-- WHERE email = 'cyrusjhops@yahoo.com';

-- SOLUTION D: Permanently delete a soft-deleted user to allow re-registration
-- DELETE FROM users WHERE email = 'cyrusjhops@yahoo.com' AND deleted_at IS NOT NULL;

-- SOLUTION E: Hard delete duplicate user (keep the one with most recent login)
-- First find duplicates, then delete the older/unused one
-- DELETE FROM users WHERE id = XXX;

