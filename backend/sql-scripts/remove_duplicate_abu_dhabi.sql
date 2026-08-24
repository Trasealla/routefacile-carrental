-- ============================================================================
-- DESCRIPTION: Remove Duplicate Paragraph from Abu Dhabi Page
-- ============================================================================
-- PURPOSE: Removes a specific paragraph containing HTML links from the Abu 
--          Dhabi rent a car page content.
--
-- PAGE: Abu Dhabi emirate page (emirate_id = 2, type = 'emirate')
-- CONTENT: Paragraph with links to Autostrad car hire pages
--
-- METHOD: Uses REPLACE function to remove the exact HTML paragraph structure, 
--         handling various newline combinations.
--
-- NOTES: Includes verification query to confirm successful removal. The 
--        paragraph contains embedded HTML anchor tags that must be matched exactly.
-- ============================================================================

-- Step 1: Get the page ID
SET @page_id = (SELECT id FROM emirate_pages WHERE emirate_id = 2 AND type = 'emirate' AND deleted_at IS NULL LIMIT 1);

-- Step 2: Remove the paragraph (with HTML links)
-- The paragraph in the database has this structure with embedded links
-- We'll remove it by matching the key text pattern
UPDATE emirate_pages
SET 
    content_en = REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    content_en,
                    -- Remove paragraph with HTML links (exact match from database)
                    '<p>Whether you need short-term or long-term travel solutions, our <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car hire in Abu Dhabi</a> ensures comfort, style, and reliability at affordable rates. <a href="https://www.autostrad.com/">Autostrad</a> also provides flexible packages for <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car on rent in Abu Dhabi</a>, giving you the freedom to choose the perfect vehicle that matches your journey and budget.</p>',
                    ''
                ),
                -- Also handle case with newlines/carriage returns before
                '\n\n<p>Whether you need short-term or long-term travel solutions, our <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car hire in Abu Dhabi</a> ensures comfort, style, and reliability at affordable rates. <a href="https://www.autostrad.com/">Autostrad</a> also provides flexible packages for <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car on rent in Abu Dhabi</a>, giving you the freedom to choose the perfect vehicle that matches your journey and budget.</p>',
                ''
            ),
            -- Handle case with newline after
            '<p>Whether you need short-term or long-term travel solutions, our <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car hire in Abu Dhabi</a> ensures comfort, style, and reliability at affordable rates. <a href="https://www.autostrad.com/">Autostrad</a> also provides flexible packages for <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car on rent in Abu Dhabi</a>, giving you the freedom to choose the perfect vehicle that matches your journey and budget.</p>\n\n',
            ''
        ),
        -- Handle case with newlines on both sides
        '\n\n<p>Whether you need short-term or long-term travel solutions, our <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car hire in Abu Dhabi</a> ensures comfort, style, and reliability at affordable rates. <a href="https://www.autostrad.com/">Autostrad</a> also provides flexible packages for <a href="https://www.autostrad.com/en/emirateservice/rent-a-car-in-abu-dhabi-2">car on rent in Abu Dhabi</a>, giving you the freedom to choose the perfect vehicle that matches your journey and budget.</p>\n\n',
        ''
    ),
    updated_at = NOW()
WHERE id = @page_id;

-- Step 3: Verify the update
SELECT 
    id,
    emirate_id,
    CASE 
        WHEN content_en LIKE '%Whether you need short-term or long-term travel solutions, our%car hire in Abu Dhabi%ensures comfort, style, and reliability at affordable rates%Autostrad%also provides flexible packages for%car on rent in Abu Dhabi%giving you the freedom to choose the perfect vehicle that matches your journey and budget%'
        THEN '✗ Paragraph still exists!'
        ELSE '✓ Paragraph removed successfully'
    END as 'Removal Status',
    updated_at
FROM emirate_pages
WHERE emirate_id = 2 
  AND type = 'emirate'
  AND deleted_at IS NULL;

