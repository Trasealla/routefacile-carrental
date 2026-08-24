-- =============================================================================
-- MEMO PORTAL - VIEW COUNTER (Phase 3 patch)
-- =============================================================================
-- Adds a denormalised view_count column on memo_documents and back-fills it
-- from the existing memo_document_views audit table.
-- Idempotent: safe to re-run.
-- =============================================================================

-- 1. Add the column (only if missing)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'memo_documents'
    AND COLUMN_NAME  = 'view_count'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `memo_documents` ADD COLUMN `view_count` INT NOT NULL DEFAULT 0 AFTER `published_at`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Back-fill from existing view rows.
--    Uses an UPDATE with a sub-query so it works on MySQL 5.7 and 8.0.
--    SQL_SAFE_UPDATES is disabled for this session only so MySQL Workbench
--    allows the bulk UPDATE (it has no WHERE on a KEY column by design — we
--    want to touch every row). The original value is restored afterwards.
SET @old_safe_updates := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE `memo_documents` d
LEFT JOIN (
  SELECT `document_id`, COUNT(*) AS c
  FROM `memo_document_views`
  GROUP BY `document_id`
) v ON v.`document_id` = d.`id`
SET d.`view_count` = COALESCE(v.c, 0)
WHERE d.`id` > 0;

SET SQL_SAFE_UPDATES = @old_safe_updates;

-- 3. Verification
SELECT id, title, status, view_count
FROM memo_documents
ORDER BY view_count DESC, id DESC
LIMIT 20;
