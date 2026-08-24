-- ============================================================================
-- DESCRIPTION: Find Exact Values in Database Tables
-- ============================================================================
-- PURPOSE: Searches all numeric columns in all tables to locate specific 
--          values related to AUH idle vehicle counts.
--
-- SEARCH VALUES:
--   - AUH Idle Total: 245
--   - NRM: 123
--   - IDLE: 76
--   - Transit: 3
--   - LR: 40
--
-- METHOD: Iterates through all numeric columns in all tables to find exact 
--         value matches, helping identify where report values originate.
--
-- DATABASE: FRCDASHBOARD (SQL Server)
--
-- NOTES: Use this diagnostic script to trace where specific numeric values 
--        appear in the database schema.
-- ============================================================================

USE FRCDASHBOARD;
GO

-- =====================================================
-- METHOD 1: Search ALL tables for these exact values
-- =====================================================

PRINT '=============================================='
PRINT 'SEARCHING FOR VALUE: 245 (AUH Idle Total)'
PRINT '=============================================='

DECLARE @sql NVARCHAR(MAX) = '';
DECLARE @tableName NVARCHAR(128);
DECLARE @columnName NVARCHAR(128);

DECLARE col_cursor CURSOR FOR
    SELECT t.TABLE_NAME, c.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLES t
    INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
    WHERE t.TABLE_TYPE = 'BASE TABLE'
    AND c.DATA_TYPE IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real')

OPEN col_cursor
FETCH NEXT FROM col_cursor INTO @tableName, @columnName

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = 'IF EXISTS (SELECT 1 FROM [' + @tableName + '] WHERE [' + @columnName + '] = 245) ' +
               'SELECT ''' + @tableName + ''' AS TableName, ''' + @columnName + ''' AS ColumnName, ' +
               '245 AS SearchValue, * FROM [' + @tableName + '] WHERE [' + @columnName + '] = 245'
    
    BEGIN TRY
        EXEC sp_executesql @sql
    END TRY
    BEGIN CATCH
        -- Skip errors
    END CATCH
    
    FETCH NEXT FROM col_cursor INTO @tableName, @columnName
END

CLOSE col_cursor
DEALLOCATE col_cursor
GO

PRINT ''
PRINT '=============================================='
PRINT 'SEARCHING FOR VALUE: 123 (NRM)'
PRINT '=============================================='

DECLARE @sql2 NVARCHAR(MAX) = '';
DECLARE @tableName2 NVARCHAR(128);
DECLARE @columnName2 NVARCHAR(128);

DECLARE col_cursor2 CURSOR FOR
    SELECT t.TABLE_NAME, c.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLES t
    INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
    WHERE t.TABLE_TYPE = 'BASE TABLE'
    AND c.DATA_TYPE IN ('int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real')
    AND (c.COLUMN_NAME LIKE '%NRM%' OR c.COLUMN_NAME LIKE '%Idle%' OR c.COLUMN_NAME LIKE '%Count%')

OPEN col_cursor2
FETCH NEXT FROM col_cursor2 INTO @tableName2, @columnName2

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql2 = 'IF EXISTS (SELECT 1 FROM [' + @tableName2 + '] WHERE [' + @columnName2 + '] = 123) ' +
                'SELECT ''' + @tableName2 + ''' AS TableName, ''' + @columnName2 + ''' AS ColumnName, ' +
                '123 AS SearchValue FROM [' + @tableName2 + '] WHERE [' + @columnName2 + '] = 123'
    
    BEGIN TRY
        EXEC sp_executesql @sql2
    END TRY
    BEGIN CATCH
    END CATCH
    
    FETCH NEXT FROM col_cursor2 INTO @tableName2, @columnName2
END

CLOSE col_cursor2
DEALLOCATE col_cursor2
GO

-- =====================================================
-- METHOD 2: Check columns that SUM to these values
-- =====================================================

PRINT ''
PRINT '=============================================='
PRINT 'CHECK: Does 123 + 76 + 3 + 40 = 242 (close to 245)'
PRINT '=============================================='

-- Note: 123 + 76 + 3 + 40 = 242, but report shows 245
-- The difference (3) might be rounding or another category

PRINT 'NRM(123) + IDLE(76) + Transit(3) + LR(40) = 242'
PRINT 'Report shows: 245'
PRINT 'Difference: 3 (possibly another category or rounding)'
GO

-- =====================================================
-- METHOD 3: List ALL columns in ALL tables
-- =====================================================

PRINT ''
PRINT '=============================================='
PRINT 'ALL COLUMNS IN DATABASE (for reference)'
PRINT '=============================================='

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    ORDINAL_POSITION
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;
GO






