-- Query to select and activate user: wael.elmansy@gmail.com
-- Phone: +971506600502
-- Customer: Rachel Green (from support chat)

-- 1. First, select the user to verify they exist
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_code,
    phone_number,
    CONCAT(phone_code, phone_number) AS full_phone,
    status,
    register_otp,
    created_at,
    updated_at
FROM 
    users
WHERE 
    email = 'wael.elmansy@gmail.com'
    OR (phone_code = '971' AND phone_number = '506600502')
ORDER BY 
    id DESC
LIMIT 1;

-- 2. Update query to activate the user
-- This sets status to 1 (ACTIVE) and clears the register_otp
UPDATE users
SET 
    status = 1,
    register_otp = NULL,
    updated_at = NOW()
WHERE 
    email = 'wael.elmansy@gmail.com'
    OR (phone_code = '971' AND phone_number = '506600502');

-- 3. Verify the activation was successful
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_code,
    phone_number,
    CONCAT(phone_code, phone_number) AS full_phone,
    status,
    register_otp,
    updated_at,
    CASE 
        WHEN status = 1 THEN 'ACTIVE'
        WHEN status = 0 THEN 'INACTIVE'
        ELSE 'UNKNOWN'
    END AS status_text
FROM 
    users
WHERE 
    email = 'wael.elmansy@gmail.com'
    OR (phone_code = '971' AND phone_number = '506600502')
ORDER BY 
    id DESC
LIMIT 1;



