-- ============================================================================
-- DESCRIPTION: Trace AUH Idle Vehicle Values - Source Analysis
-- ============================================================================
-- PURPOSE: Comprehensive diagnostic script to find the exact source of AUH 
--          idle vehicle values in the database and job execution flow.
--
-- TARGET VALUES:
--   - Total: 245 (12.24%)
--   - Breakdown: NRM=123, IDLE=76, Transit=3, LR=40
--   - Changes: Previous Month: +245, Previous Day: +126
--
-- ANALYZES:
--   - All tables with idle/NRM/LR/Transit columns
--   - FRC_DASHBOARD job steps referencing AUH
--   - Views and stored procedures
--   - Region/Location-based data
--   - Utilization tables and summaries
--
-- DATABASE: FRCDASHBOARD (SQL Server), msdb
-- REGION:   AUH (Abu Dhabi, Region 4)
--
-- NOTES: Essential for understanding the complete data pipeline for AUH metrics.
-- ============================================================================

USE FRCDASHBOARD;
GO

PRINT '=============================================='
PRINT 'STEP 1: FIND ALL TABLES WITH IDLE/NRM/LR DATA'
PRINT '=============================================='

-- Find columns that might contain NRM, IDLE, Transit, LR
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE 
    COLUMN_NAME LIKE '%NRM%'
    OR COLUMN_NAME LIKE '%Idle%'
    OR COLUMN_NAME LIKE '%Transit%'
    OR COLUMN_NAME LIKE '%LR%'
    OR COLUMN_NAME LIKE '%AUH%'
    OR COLUMN_NAME LIKE '%Abu%'
ORDER BY TABLE_NAME, COLUMN_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 2: CHECK UTILIZATION TABLES FOR AUH DATA'
PRINT '=============================================='

-- Check if UtilizationDailySummary has AUH breakdown
IF OBJECT_ID('UtilizationDailySummary', 'U') IS NOT NULL
BEGIN
    PRINT 'UtilizationDailySummary columns:'
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'UtilizationDailySummary'
    ORDER BY ORDINAL_POSITION;
    
    PRINT ''
    PRINT 'Latest data from UtilizationDailySummary:'
    SELECT TOP 5 * FROM UtilizationDailySummary ORDER BY ReportDate DESC;
END
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 3: SEARCH FOR AUH-SPECIFIC TABLES/VIEWS'
PRINT '=============================================='

-- Find any table/view with AUH in the name
SELECT 'TABLE' AS ObjectType, TABLE_NAME AS ObjectName
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE '%AUH%' OR TABLE_NAME LIKE '%Abu%'
UNION ALL
SELECT 'VIEW' AS ObjectType, TABLE_NAME AS ObjectName
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_NAME LIKE '%AUH%' OR TABLE_NAME LIKE '%Abu%';
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 4: CHECK FOR LOCATION-BASED DATA'
PRINT '=============================================='

-- Check LocationMaster for AUH locations
IF OBJECT_ID('LocationMaster', 'U') IS NOT NULL
BEGIN
    PRINT 'LocationMaster data (AUH/Abu Dhabi):'
    SELECT * FROM LocationMaster 
    WHERE LocationName LIKE '%AUH%' 
       OR LocationName LIKE '%Abu%'
       OR LocationCode LIKE '%AUH%';
END
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 5: LOOK AT ALL VIEWS (Report Data Sources)'
PRINT '=============================================='

-- List all views and their definitions
SELECT 
    v.TABLE_NAME AS ViewName,
    m.definition AS ViewDefinition
FROM INFORMATION_SCHEMA.VIEWS v
CROSS APPLY sys.sql_modules m
WHERE m.object_id = OBJECT_ID(v.TABLE_NAME)
ORDER BY v.TABLE_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 6: CHECK JOB STEPS FOR AUH DATA QUERIES'
PRINT '=============================================='

USE msdb;
GO

-- Show job steps that reference AUH or Abu Dhabi
SELECT 
    sjs.step_id,
    sjs.step_name,
    sjs.command
FROM sysjobs sj
INNER JOIN sysjobsteps sjs ON sj.job_id = sjs.job_id
WHERE sj.name = 'FRC_DASHBOARD'
AND (
    sjs.command LIKE '%AUH%' 
    OR sjs.command LIKE '%Abu%'
    OR sjs.command LIKE '%NRM%'
    OR sjs.command LIKE '%Idle%'
    OR sjs.command LIKE '%Transit%'
    OR sjs.step_name LIKE '%AUH%'
    OR sjs.step_name LIKE '%Abu%'
    OR sjs.step_name LIKE '%Idle%'
)
ORDER BY sjs.step_id;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 7: SHOW ALL JOB STEPS (Full List)'
PRINT '=============================================='

SELECT 
    sjs.step_id AS [Step],
    sjs.step_name AS [Name],
    LEFT(sjs.command, 200) AS [Command Preview]
FROM sysjobs sj
INNER JOIN sysjobsteps sjs ON sj.job_id = sjs.job_id
WHERE sj.name = 'FRC_DASHBOARD'
ORDER BY sjs.step_id;
GO

USE FRCDASHBOARD;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 8: FIND TABLES WITH REGION/EMIRATE COLUMN'
PRINT '=============================================='

-- Tables that have a Region or Emirate column (for filtering AUH)
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
AND (
    c.COLUMN_NAME LIKE '%Region%'
    OR c.COLUMN_NAME LIKE '%Emirate%'
    OR c.COLUMN_NAME LIKE '%Location%'
    OR c.COLUMN_NAME LIKE '%Branch%'
    OR c.COLUMN_NAME LIKE '%City%'
)
ORDER BY t.TABLE_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 9: CHECK DATA IN ALL TABLES (Row Counts)'
PRINT '=============================================='

-- Show all tables with row counts
SELECT 
    t.TABLE_NAME,
    p.rows AS [RowCount]
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN sys.tables st ON t.TABLE_NAME = st.name
INNER JOIN sys.partitions p ON st.object_id = p.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY p.rows DESC;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 10: SAMPLE DATA FROM LARGEST TABLES'
PRINT '=============================================='

-- This will show sample data from tables that likely contain the report data
-- You may need to adjust table names based on Step 9 results

PRINT 'Run these queries manually after seeing table names from Step 9:'
PRINT ''
PRINT 'SELECT TOP 10 * FROM [TableName] WHERE [Column] LIKE ''%AUH%'';'
PRINT ''
GO

