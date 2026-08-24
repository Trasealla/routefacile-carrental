-- ============================================================================
-- DESCRIPTION: Check Insurance Add-ons for Booking
-- ============================================================================
-- PURPOSE: Verifies if insurance add-ons (SCDW and PAI) are stored in the 
--          booking's car_extras JSON field and displays related booking information.
--
-- BOOKING: ARC13142 (replace with desired booking number)
--
-- CHECKS:
--   - Existence of SCDW and PAI in car_extras JSON
--   - Extracts insurance details if present
--   - Shows booking summary with extras rate total
--   - Checks original request body to see what mobile app sent
--
-- NOTES: Includes multiple query variations for comprehensive checking, including 
--        querying all bookings with the same booking number (for edits/cancellations).
-- ============================================================================

    SELECT 
        b.id,
        b.booking_number,
        b.booking_log_number,
        b.user_first_name,
        b.user_last_name,
        b.user_email,
        b.user_phone_number,
        b.booking_date,
        b.car_extras_rate_total,
        b.car_extras,
        b.sub_amount,
        b.total_amount,
        -- Check if SCDW exists in car_extras
        JSON_SEARCH(b.car_extras, 'one', 'scdw', NULL, '$[*].type') AS scdw_exists,
        -- Check if PAI exists in car_extras
        JSON_SEARCH(b.car_extras, 'one', 'pai', NULL, '$[*].type') AS pai_exists,
        -- Extract SCDW details if exists
        JSON_EXTRACT(b.car_extras, JSON_UNQUOTE(REPLACE(JSON_SEARCH(b.car_extras, 'one', 'scdw', NULL, '$[*].type'), '.type', ''))) AS scdw_details,
        -- Extract PAI details if exists
        JSON_EXTRACT(b.car_extras, JSON_UNQUOTE(REPLACE(JSON_SEARCH(b.car_extras, 'one', 'pai', NULL, '$[*].type'), '.type', ''))) AS pai_details
    FROM 
        bookings b
    WHERE 
        b.booking_number = 'ARC13142'
    ORDER BY 
        b.id DESC
    LIMIT 1;

    -- Alternative simpler query to just see the car_extras JSON and check manually
    SELECT 
        b.id,
        b.booking_number,
        b.booking_log_number,
        b.user_first_name,
        b.user_last_name,
        b.user_email,
        b.booking_date,
        b.car_extras_rate_total,
        b.car_extras,
        b.sub_amount,
        b.total_amount,
        b.booking_source
    FROM 
        bookings b
    WHERE 
        b.booking_number = 'ARC13142'
    ORDER BY 
        b.id DESC
    LIMIT 1;

-- Query to check all bookings with the same booking_number (in case there are edits/cancellations)
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.action,
    b.booking_date,
    b.car_extras_rate_total,
    b.car_extras,
    b.user_email,
    b.booking_source
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC13142'
ORDER BY 
    b.id DESC;

-- CRITICAL: Check the original request body to see if mobile app sent car_extras
-- This will show what the mobile app actually sent in the request
SELECT 
    b.id,
    b.booking_number,
    b.booking_log_number,
    b.booking_source,
    b.user_request,
    JSON_EXTRACT(b.user_request, '$.car_extras') AS car_extras_from_request,
    b.car_extras AS car_extras_saved,
    b.car_extras_rate_total
FROM 
    bookings b
WHERE 
    b.booking_number = 'ARC13142'
ORDER BY 
    b.id DESC
LIMIT 1;

