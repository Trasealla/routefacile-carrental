-- ============================================================================
-- DESCRIPTION: Deep Trace AUH Idle Vehicle Breakdown
-- ============================================================================
-- PURPOSE: Comprehensive diagnostic script to trace the source of AUH idle 
--          vehicle breakdown values (NRM, IDLE, Transit, LR) in the database.
--
-- TARGET VALUES:
--   - NRM: 125
--   - IDLE: 74
--   - Transit: 3
--   - LR: 40
--   - Total: 242
--
-- ANALYZES:
--   - UtilizationDailySummary table data by location
--   - DocumentType breakdown (NRM, AVL/IDLE, Transit, LR)
--   - Location-specific counts
--   - Views and stored procedures used in calculations
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- REGION:   AUH (Region 4)
--
-- NOTES: Use this to identify exactly where each component value originates.
-- ============================================================================

USE FRCDASHBOARD;
GO

PRINT '=============================================='
PRINT 'STEP 1: Find value 125 (NRM) in all tables'
PRINT '=============================================='

-- Search for 125 in numeric columns
SELECT 'UtilizationDailySummary' AS TableName, *
FROM UtilizationDailySummary
WHERE TranCount = 125
AND Region = 4;  -- AUH
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 2: Find value 74 (IDLE) in all tables'
PRINT '=============================================='

SELECT 'UtilizationDailySummary' AS TableName, *
FROM UtilizationDailySummary
WHERE TranCount = 74
AND Region = 4;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 3: Find value 40 (LR) in all tables'
PRINT '=============================================='

SELECT 'UtilizationDailySummary' AS TableName, *
FROM UtilizationDailySummary
WHERE TranCount = 40
AND Region = 4;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 4: Check by Location within AUH (Region 4)'
PRINT '=============================================='

-- Get breakdown by Location for latest date
SELECT 
    Region,
    Location,
    DocumentType,
    SUM(TranCount) AS TotalCount
FROM UtilizationDailySummary
WHERE Region = 4  -- AUH
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary)
GROUP BY Region, Location, DocumentType
ORDER BY Location, DocumentType;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 5: Check NRM breakdown by Location'
PRINT '=============================================='

SELECT 
    Location,
    SUM(TranCount) AS NRM_Count
FROM UtilizationDailySummary
WHERE Region = 4
AND DocumentType = 'NRM'
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary)
GROUP BY Location
ORDER BY Location;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 6: Check AVL (IDLE) breakdown by Location'
PRINT '=============================================='

SELECT 
    Location,
    SUM(TranCount) AS AVL_Count
FROM UtilizationDailySummary
WHERE Region = 4
AND DocumentType = 'AVL'
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary)
GROUP BY Location
ORDER BY Location;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 7: Check ALL DocumentTypes available'
PRINT '=============================================='

SELECT DISTINCT DocumentType
FROM UtilizationDailySummary
ORDER BY DocumentType;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 8: Look for Transit/LR document types'
PRINT '=============================================='

SELECT DISTINCT DocumentType
FROM UtilizationDailySummary
WHERE DocumentType LIKE '%Trans%'
   OR DocumentType LIKE '%LR%'
   OR DocumentType LIKE '%Reserve%'
   OR DocumentType LIKE '%Long%';
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 9: Check ALL tables for Transit column'
PRINT '=============================================='

SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%Transit%'
   OR COLUMN_NAME LIKE '%LR%'
   OR COLUMN_NAME LIKE '%Reserve%';
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 10: Check LocationMaster for AUH locations'
PRINT '=============================================='

IF OBJECT_ID('LocationMaster', 'U') IS NOT NULL
BEGIN
    SELECT * FROM LocationMaster
    WHERE LocationCode LIKE '%AUH%'
       OR LocationName LIKE '%Abu%'
       OR Region = 4;
END
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 11: Check for other tables with vehicle status'
PRINT '=============================================='

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
AND (
    TABLE_NAME LIKE '%Vehicle%'
    OR TABLE_NAME LIKE '%Status%'
    OR TABLE_NAME LIKE '%Idle%'
    OR TABLE_NAME LIKE '%Daily%'
);
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 12: Full data dump for AUH latest date'
PRINT '=============================================='

SELECT *
FROM UtilizationDailySummary
WHERE Region = 4
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary)
ORDER BY Location, DocumentType;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 13: Check if there are sub-status columns'
PRINT '=============================================='

SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'UtilizationDailySummary'
ORDER BY ORDINAL_POSITION;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 14: Sum by DocumentType to match report'
PRINT '=============================================='

-- Try to match report values
SELECT 
    'NRM' AS ReportCategory,
    SUM(CASE WHEN DocumentType = 'NRM' THEN TranCount ELSE 0 END) AS DatabaseTotal,
    125 AS ReportValue,
    'Check specific locations' AS Note
FROM UtilizationDailySummary
WHERE Region = 4
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary)

UNION ALL

SELECT 
    'IDLE (AVL)' AS ReportCategory,
    SUM(CASE WHEN DocumentType = 'AVL' THEN TranCount ELSE 0 END) AS DatabaseTotal,
    74 AS ReportValue,
    'Check specific locations' AS Note
FROM UtilizationDailySummary
WHERE Region = 4
AND ReportDate = (SELECT MAX(ReportDate) FROM UtilizationDailySummary);
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 15: Check for Views used by report'
PRINT '=============================================='

SELECT 
    v.TABLE_NAME AS ViewName,
    m.definition AS ViewDefinition
FROM INFORMATION_SCHEMA.VIEWS v
CROSS APPLY sys.sql_modules m
WHERE m.object_id = OBJECT_ID(v.TABLE_NAME)
AND (
    m.definition LIKE '%Idle%'
    OR m.definition LIKE '%NRM%'
    OR m.definition LIKE '%AUH%'
    OR m.definition LIKE '%Region%'
);
GO

