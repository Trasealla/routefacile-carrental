-- ============================================================================
-- DESCRIPTION: Update SEO Meta Descriptions for Rent A Car Pages
-- ============================================================================
-- PURPOSE: Updates the SEO meta descriptions (seo_meta_description_en) for 
--          rent a car pages in three emirates to improve search engine visibility.
--
-- PAGES UPDATED:
--   1. Dubai (emirate_id = 1)
--   2. Abu Dhabi (emirate_id = 2)
--   3. Sharjah (emirate_id = 3)
--
-- CONTENT: Each emirate gets a customized meta description highlighting:
--   - Car hire/rental services
--   - Flexibility and features
--   - Easy booking process
--
-- NOTES: Includes verification queries for each emirate to confirm the update. 
--        Only updates English meta descriptions (seo_meta_description_en).
-- ============================================================================

-- ============================================
-- 1. DUBAI - Update Meta Description
-- ============================================
SET @page_id = (SELECT id FROM emirate_pages WHERE emirate_id = 1 AND type = 'emirate' AND deleted_at IS NULL LIMIT 1);

UPDATE emirate_pages
SET 
    seo_meta_description_en = 'Experience flexible car hire in Dubai! Choose short or long-term plans, a wide fleet, and easy online booking. Start your smooth ride now.',
    updated_at = NOW()
WHERE id = @page_id;

-- Verify Dubai update
SELECT 
    id,
    emirate_id,
    seo_title as 'Meta Title',
    seo_meta_description_en as 'Meta Description',
    updated_at
FROM emirate_pages
WHERE emirate_id = 1 
  AND type = 'emirate'
  AND deleted_at IS NULL;

-- ============================================
-- 2. ABU DHABI - Update Meta Description
-- ============================================
SET @page_id = (SELECT id FROM emirate_pages WHERE emirate_id = 2 AND type = 'emirate' AND deleted_at IS NULL LIMIT 1);

UPDATE emirate_pages
SET 
    seo_meta_description_en = 'Get top car hire in Abu Dhabi with Autostrad. We offer premier car rental services in Abu Dhabi with flexible plans. Book your drive today!',
    updated_at = NOW()
WHERE id = @page_id;

-- Verify Abu Dhabi update
SELECT 
    id,
    emirate_id,
    seo_title as 'Meta Title',
    seo_meta_description_en as 'Meta Description',
    updated_at
FROM emirate_pages
WHERE emirate_id = 2 
  AND type = 'emirate'
  AND deleted_at IS NULL;

-- ============================================
-- 3. SHARJAH - Update Meta Description
-- ============================================
SET @page_id = (SELECT id FROM emirate_pages WHERE emirate_id = 3 AND type = 'emirate' AND deleted_at IS NULL LIMIT 1);

UPDATE emirate_pages
SET 
    seo_meta_description_en = 'Get the best car on rent in Sharjah with Autostrad! Enjoy affordable rates, flexible plans, and easy booking. Drive your way today!',
    updated_at = NOW()
WHERE id = @page_id;

-- Verify Sharjah update
SELECT 
    id,
    emirate_id,
    seo_title as 'Meta Title',
    seo_meta_description_en as 'Meta Description',
    updated_at
FROM emirate_pages
WHERE emirate_id = 3 
  AND type = 'emirate'
  AND deleted_at IS NULL;

