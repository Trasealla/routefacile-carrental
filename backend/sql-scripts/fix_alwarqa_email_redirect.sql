-- ============================================================================
-- Fix: Remove alwarqa@autostrad.com from ALL email recipients
-- ============================================================================
-- BACKGROUND:
--   alwarqa@autostrad.com is unmanned and must not receive any booking emails.
--   The email is sent via TWO sources:
--     1. locations.recipients   — for self-pickup/dropoff bookings
--     2. emirates.recipients    — for delivery/collection bookings
--   Both tables must be cleaned.
--   Replacement: alwarqa@autostrad.com → dubai@autostrad.com
--
-- HOW TO RUN ON PRODUCTION:
--   ssh into the server, then:
--     docker exec -it arc-mysql-1 mysql -u root -p arc
--   Paste the statements below, or run:
--     docker exec -i arc-mysql-1 mysql -u root -p arc < fix_alwarqa_email_redirect.sql
-- ============================================================================

-- -------------------------------------------------------------------
-- STEP 1 — Check: which LOCATIONS contain alwarqa@autostrad.com
-- -------------------------------------------------------------------
SELECT
    id,
    name_en     AS location_name,
    recipients  AS current_recipients
FROM locations
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL;

-- -------------------------------------------------------------------
-- STEP 2 — Check: which EMIRATES contain alwarqa@autostrad.com
--   (This is the most likely source — delivery/collection bookings
--    read from the emirate recipients, not the location recipients)
-- -------------------------------------------------------------------
SELECT
    id,
    name_en     AS emirate_name,
    recipients  AS current_recipients
FROM emirates
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL;

-- -------------------------------------------------------------------
-- STEP 3 — Fix LOCATIONS: replace alwarqa → dubai
-- -------------------------------------------------------------------
SET SQL_SAFE_UPDATES = 0;
UPDATE locations
SET recipients = REPLACE(
        CAST(recipients AS CHAR),
        'alwarqa@autostrad.com',
        'dubai@autostrad.com'
    )
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL;
SET SQL_SAFE_UPDATES = 1;

-- -------------------------------------------------------------------
-- STEP 4 — Fix EMIRATES: replace alwarqa → dubai
-- -------------------------------------------------------------------
SET SQL_SAFE_UPDATES = 0;
UPDATE emirates
SET recipients = REPLACE(
        CAST(recipients AS CHAR),
        'alwarqa@autostrad.com',
        'dubai@autostrad.com'
    )
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL;
SET SQL_SAFE_UPDATES = 1;

-- -------------------------------------------------------------------
-- STEP 5 — Also fix location ID 17 (AUH Airport): remove duplicate
--           airportroad@autostrad.com entry
-- -------------------------------------------------------------------
UPDATE locations
SET recipients = JSON_ARRAY(
        'auh.airport@autostrad.com',
        'mohammed.kunhi@autostrad.com',
        'mohamed.reda@autostrad.com',
        'airportroad@autostrad.com'
    )
WHERE id = 17;

-- -------------------------------------------------------------------
-- STEP 6 — Verify: alwarqa must be gone from both tables
-- -------------------------------------------------------------------
SELECT 'locations' AS source_table, COUNT(*) AS remaining_alwarqa_count
FROM locations
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL
UNION ALL
SELECT 'emirates'  AS source_table, COUNT(*) AS remaining_alwarqa_count
FROM emirates
WHERE JSON_SEARCH(recipients, 'one', 'alwarqa@autostrad.com') IS NOT NULL;
-- Both rows should show 0
