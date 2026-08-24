-- ============================================================================
-- Umm Ramool (Near DXB Airport) — Update to 24/7 Operations
-- Location ID: 7
-- Date: 2026-03-04
-- 
-- Requested by: Jimbo Salva (District Operations Supervisor)
-- Changes:
--   1. Update opening hours to 24/7 (all days, 0:00 - 24:00)
--   2. Add dubaiairport.arrival@autostrad.com as MAIN recipient for bookings
--   3. Update timing display text (English & Arabic)
--   4. Add promo ticker banner highlighting extended timing
-- ============================================================================

-- ============================================================================
-- TASK 1: UPDATE OPENING HOURS TO 24/7
-- ============================================================================

-- Step 1a: Remove existing opening hours for Umm Ramool (location_id = 7)
-- Current: Mon-Sat 08:00-17:00, Sun 09:00-18:00
DELETE FROM location_opening_hours WHERE location_id = 7 AND id > 0;

-- Step 1b: Insert new 24/7 opening hours (all 7 days, single shift 0:00-24:00)
-- Day mapping: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
INSERT INTO location_opening_hours (day, shift, from_hours, to_hours, is_closed, location_id, created_by, created_at, updated_at) VALUES
(1, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Sunday
(1, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Sunday shift 2 (placeholder)
(2, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Monday
(2, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Monday shift 2 (placeholder)
(3, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Tuesday
(3, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Tuesday shift 2 (placeholder)
(4, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Wednesday
(4, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Wednesday shift 2 (placeholder)
(5, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Thursday
(5, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Thursday shift 2 (placeholder)
(6, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Friday
(6, 2, 0, 0, 0, 7, 1, NOW(), NOW()),   -- Friday shift 2 (placeholder)
(7, 1, 0, 24, 0, 7, 1, NOW(), NOW()),  -- Saturday
(7, 2, 0, 0, 0, 7, 1, NOW(), NOW());   -- Saturday shift 2 (placeholder)

-- ============================================================================
-- TASK 2: ADD dubaiairport.arrival@autostrad.com AS MAIN RECIPIENT
-- ============================================================================
-- Current recipients: ["alquoz@autostrad.com","jimbo.salva@autostrad.com"]
-- New recipients: dubaiairport.arrival@autostrad.com as FIRST (main), keep existing
UPDATE locations 
SET recipients = '["dubaiairport.arrival@autostrad.com","alquoz@autostrad.com","jimbo.salva@autostrad.com"]',
    updated_at = NOW()
WHERE id = 7;

-- ============================================================================
-- TASK 3: UPDATE TIMING DISPLAY TEXT
-- ============================================================================
UPDATE locations 
SET timing_detail_en = 'Open 24 Hours - 7 Days a Week',
    timing_detail_ae = 'مفتوح على مدار الساعة - 7 أيام في الأسبوع',
    updated_at = NOW()
WHERE id = 7;

-- ============================================================================
-- TASK 4: ALSO REMOVE ANY RAMADAN EXCEPTION HOURS FOR UMM RAMOOL
-- (Since it's now 24/7 permanently, Ramadan exceptions are no longer needed)
-- ============================================================================
-- Optional: Uncomment if Ramadan exceptions should be cleared
-- DELETE FROM location_opening_hour_exceptions WHERE location_id = 7 AND id > 0;

-- ============================================================================
-- TASK 5: ADD PROMO TICKER BANNER FOR EXTENDED TIMING
-- ============================================================================
-- This creates a promotional text banner on the website highlighting
-- the new 24/7 hours for Umm Ramool location
INSERT INTO promo_tickers (
    text_en, text_ae, 
    description_en, description_ae,
    link, status, sort_order, 
    start_date, end_date, 
    created_by, created_at, updated_at
) VALUES (
    'Umm Ramool (Near DXB Airport) is now open 24/7!',
    'أم رمول (بالقرب من مطار دبي الدولي) مفتوح الآن على مدار الساعة!',
    'Our Umm Ramool location near Dubai International Airport is now open 24 hours a day, 7 days a week for your convenience.',
    'فرعنا في أم رمول بالقرب من مطار دبي الدولي مفتوح الآن على مدار الساعة طوال أيام الأسبوع لراحتكم.',
    NULL,
    1,     -- status: ACTIVE
    0,     -- sort_order: top priority
    '2026-03-04',   -- start_date: today
    '2026-04-30',   -- end_date: ~2 months (adjust as needed)
    1,     -- created_by: admin
    NOW(),
    NOW()
);

-- ============================================================================
-- VERIFICATION QUERIES (run after to confirm changes)
-- ============================================================================

-- Verify location recipients and timing text
SELECT id, name_en, recipients, timing_detail_en, timing_detail_ae 
FROM locations WHERE id = 7;

-- Verify opening hours are 24/7
SELECT * FROM location_opening_hours WHERE location_id = 7 ORDER BY day, shift;

-- Verify promo ticker was created
SELECT * FROM promo_tickers WHERE text_en LIKE '%Umm Ramool%' ORDER BY id DESC LIMIT 1;
