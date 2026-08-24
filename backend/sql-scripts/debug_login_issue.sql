-- ============================================================================
-- DESCRIPTION: Debug login issues for users
-- ============================================================================
-- PURPOSE: When users report "wrong credentials" errors, use this to check:
--   1. Does the user exist?
--   2. Is the user active (status = 1)?
--   3. Is there a password stored?
--   4. Check password_org for debugging (temp field)
-- ============================================================================

-- Query 1: Check user by email
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
    password_org,
    last_login_at,
    created_at,
    deleted_at
FROM users 
WHERE email = 'ida891334@gmail.com';

-- Query 2: Check if email exists with different case
SELECT 
    id, email, status, created_at
FROM users 
WHERE LOWER(email) = LOWER('ida891334@gmail.com');

-- Query 3: Check by phone number (in case user is trying wrong email)
SELECT 
    id, email, first_name, last_name, phone_number, status
FROM users 
WHERE phone_number = '569915993' OR phone_number = '0569915993';

-- Query 4: Check if user was soft-deleted
SELECT 
    id, email, status, deleted_at
FROM users 
WHERE email = 'ida891334@gmail.com' OR deleted_at IS NOT NULL;

-- Query 5: If user needs password reset, generate new password hash:
-- Run this in Node.js or use an online bcrypt generator:
-- const bcrypt = require('bcrypt');
-- const hash = bcrypt.hashSync('newpassword123', 10);

-- Query 6: Reset user password (uncomment and update hash)
-- UPDATE users 
-- SET password = '$2b$10$YOUR_NEW_HASH_HERE', 
--     password_org = 'newpassword123'
-- WHERE email = 'ida891334@gmail.com';

-- Query 7: Activate user if inactive
-- UPDATE users SET status = 1, register_otp = NULL WHERE email = 'ida891334@gmail.com';

