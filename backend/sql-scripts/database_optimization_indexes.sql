  -- =====================================================
  -- Database Optimization Indexes
  -- =====================================================
  -- Created: November 12, 2025
  -- Updated: January 16, 2026 (Fixed: removed invalid emirate_visibility_id index)
  -- Purpose: Improve query performance for rates and cars tables
  -- =====================================================

  -- =====================================================
  -- SECTION 1: Drop Existing Indexes (Safe Re-run)
  -- =====================================================
  -- Note: MySQL 5.7 doesn't support DROP INDEX IF EXISTS, 
  -- so we use a stored procedure approach.
  -- This will safely drop indexes only if they exist.

  -- Drop index on rates_daily
  SET @sql = '';
  SELECT IF(
      COUNT(*) > 0,
      'DROP INDEX idx_rd_emir_grp_car_date_rate ON rates_daily',
      'SELECT 1'
  ) INTO @sql
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE table_schema = DATABASE() 
    AND table_name = 'rates_daily' 
    AND index_name = 'idx_rd_emir_grp_car_date_rate';
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  -- Drop index on rates_range
  SET @sql = '';
  SELECT IF(
      COUNT(*) > 0,
      'DROP INDEX idx_rr_grp_em_locdel_from_to_start_end_rate ON rates_range',
      'SELECT 1'
  ) INTO @sql
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE table_schema = DATABASE() 
    AND table_name = 'rates_range' 
    AND index_name = 'idx_rr_grp_em_locdel_from_to_start_end_rate';
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  -- Drop index on cars (status_deleted)
  SET @sql = '';
  SELECT IF(
      COUNT(*) > 0,
      'DROP INDEX idx_c_status_deleted ON cars',
      'SELECT 1'
  ) INTO @sql
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE table_schema = DATABASE() 
    AND table_name = 'cars' 
    AND index_name = 'idx_c_status_deleted';
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  -- NOTE: emirate_visibility_id column does not exist in cars table
  -- The Daily Specials feature uses special_rates_emirates (JSON column) instead
  -- JSON columns cannot be indexed directly in MySQL 5.7

  -- =====================================================
  -- SECTION 2: Create Indexes
  -- =====================================================

  -- =====================================================
  -- Index 1: rates_daily - Optimize daily rate queries
  -- =====================================================
  -- Covers queries filtering by emirate, group, car, date and rate
  -- Usage: Daily rate searches by location and car type
  CREATE INDEX idx_rd_emir_grp_car_date_rate
    ON rates_daily (emirate_id, group_id, car_id, date, rate);

  -- =====================================================
  -- Index 2: rates_range - Optimize range rate queries
  -- =====================================================
  -- Covers queries filtering by group, emirate, location, and date ranges
  -- NOTE: `from` and `to` are escaped with backticks (MySQL reserved keywords)
  CREATE INDEX idx_rr_grp_em_locdel_from_to_start_end_rate
    ON rates_range (group_id, emirate_id, location_id, deleted_at, `from`, `to`, start_date, end_date, rate);

  -- =====================================================
  -- Index 3: cars - Optimize car status queries
  -- =====================================================
  -- Covers queries filtering by status and checking for soft deletes
  -- Usage: Active/available car searches
  CREATE INDEX idx_c_status_deleted 
    ON cars (status, deleted_at);

  -- =====================================================
  -- NOTE: Daily Specials uses JSON column (special_rates_emirates)
  -- =====================================================
  -- JSON columns cannot be indexed directly in MySQL 5.7
  -- The special_rates_emirates column stores emirate IDs as JSON:
  -- { all: true } or { all: false, ids: [1, 2, 3] }
  -- For optimization, consider adding a generated column if needed:
  -- ALTER TABLE cars ADD COLUMN special_rates_enabled TINYINT 
  --   GENERATED ALWAYS AS (JSON_EXTRACT(special_rates_emirates, '$.all') IS NOT NULL) STORED;
  -- CREATE INDEX idx_cars_special_rates ON cars (special_rates_enabled);

  -- =====================================================
  -- SECTION 3: Verify Indexes Created
  -- =====================================================

  -- Check rates_daily indexes
  SHOW INDEX FROM rates_daily 
  WHERE Key_name = 'idx_rd_emir_grp_car_date_rate';

  -- Check rates_range indexes
  SHOW INDEX FROM rates_range 
  WHERE Key_name = 'idx_rr_grp_em_locdel_from_to_start_end_rate';

  -- Check cars indexes (status_deleted)
  SHOW INDEX FROM cars 
  WHERE Key_name = 'idx_c_status_deleted';

  -- Note: No index for Daily Specials - uses JSON column (special_rates_emirates)

  -- =====================================================
  -- SECTION 4: Index Summary
  -- =====================================================
  -- Display all custom indexes on key tables
  SELECT 
      TABLE_NAME,
      INDEX_NAME,
      GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('rates_daily', 'rates_range', 'cars')
    AND INDEX_NAME LIKE 'idx_%'
  GROUP BY TABLE_NAME, INDEX_NAME
  ORDER BY TABLE_NAME, INDEX_NAME;

  -- =====================================================
  -- Index Statistics (Optional - Run after indexes are used)
  -- =====================================================
  -- Uncomment to analyze tables after index creation:
  -- ANALYZE TABLE rates_daily;
  -- ANALYZE TABLE rates_range;
  -- ANALYZE TABLE cars;

