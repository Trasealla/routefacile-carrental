-- ============================================================================
-- DESCRIPTION: SSRS Report Data Source Analysis
-- ============================================================================
-- PURPOSE: Comprehensive analysis of SSRS report data sources including 
--          tables, views, stored procedures, and data structures.
--
-- ANALYZES:
--   - All tables and views in FRCDASHBOARD database
--   - Stored procedures and their definitions
--   - UtilizationDailySummary table structure and data
--   - LocationMaster table structure
--   - Tables containing vehicle count metrics
--   - FRC_DASHBOARD job steps
--   - View and procedure definitions
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- SERVER:   10.2.6.18 (CARPRO-FOCUS)
--
-- NOTES: Provides complete overview of the data architecture used by SSRS 
--        reports for vehicle utilization metrics.
-- ============================================================================

USE FRCDASHBOARD;
GO

PRINT '=============================================='
PRINT '1. LIST ALL TABLES IN FRCDASHBOARD DATABASE'
PRINT '=============================================='

SELECT 
    t.TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT '2. LIST ALL VIEWS IN FRCDASHBOARD DATABASE'
PRINT '=============================================='

SELECT 
    TABLE_NAME AS ViewName
FROM INFORMATION_SCHEMA.VIEWS
ORDER BY TABLE_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT '3. LIST ALL STORED PROCEDURES'
PRINT '=============================================='

SELECT 
    name AS ProcedureName,
    create_date AS CreatedDate,
    modify_date AS ModifiedDate
FROM sys.procedures
ORDER BY name;
GO

PRINT ''
PRINT '=============================================='
PRINT '4. ANALYZE UTILIZATION DAILY SUMMARY TABLE'
PRINT '   (Main table for dashboard metrics)'
PRINT '=============================================='

IF OBJECT_ID('UtilizationDailySummary', 'U') IS NOT NULL
BEGIN
    -- Show table structure
    PRINT 'Table Structure:'
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'UtilizationDailySummary'
    ORDER BY ORDINAL_POSITION;
    
    -- Show sample data
    PRINT ''
    PRINT 'Sample Data (Latest 5 Records):'
    SELECT TOP 5 * 
    FROM UtilizationDailySummary 
    ORDER BY ReportDate DESC;
END
ELSE
    PRINT 'Table UtilizationDailySummary does not exist'
GO

PRINT ''
PRINT '=============================================='
PRINT '5. ANALYZE LOCATION MASTER TABLE'
PRINT '=============================================='

IF OBJECT_ID('LocationMaster', 'U') IS NOT NULL
BEGIN
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'LocationMaster'
    ORDER BY ORDINAL_POSITION;
    
    PRINT ''
    PRINT 'Sample Data:'
    SELECT TOP 10 * FROM LocationMaster;
END
GO

PRINT ''
PRINT '=============================================='
PRINT '6. FIND TABLES CONTAINING VEHICLE COUNTS'
PRINT '=============================================='

-- Search for tables with columns that might contain vehicle counts
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
AND (
    c.COLUMN_NAME LIKE '%Vehicle%' 
    OR c.COLUMN_NAME LIKE '%Total%'
    OR c.COLUMN_NAME LIKE '%Utilized%'
    OR c.COLUMN_NAME LIKE '%Idle%'
    OR c.COLUMN_NAME LIKE '%FRC%'
    OR c.COLUMN_NAME LIKE '%AUH%'
    OR c.COLUMN_NAME LIKE '%DXB%'
    OR c.COLUMN_NAME LIKE '%RAC%'
    OR c.COLUMN_NAME LIKE '%MRA%'
    OR c.COLUMN_NAME LIKE '%LES%'
    OR c.COLUMN_NAME LIKE '%NRM%'
    OR c.COLUMN_NAME LIKE '%Transit%'
)
ORDER BY t.TABLE_NAME, c.COLUMN_NAME;
GO

PRINT ''
PRINT '=============================================='
PRINT '7. ANALYZE FRC_DASHBOARD JOB STEPS'
PRINT '   (Shows what data is pulled and how)'
PRINT '=============================================='

USE msdb;
GO

SELECT 
    sj.name AS JobName,
    sjs.step_id AS StepNumber,
    sjs.step_name AS StepName,
    sjs.database_name AS TargetDatabase,
    sjs.command AS SQLCommand
FROM sysjobs sj
INNER JOIN sysjobsteps sjs ON sj.job_id = sjs.job_id
WHERE sj.name = 'FRC_DASHBOARD'
ORDER BY sjs.step_id;
GO

USE FRCDASHBOARD;
GO

PRINT ''
PRINT '=============================================='
PRINT '8. VIEW DEFINITIONS (Shows calculation logic)'
PRINT '=============================================='

-- Get view definitions to understand calculations
DECLARE @ViewName NVARCHAR(128)
DECLARE view_cursor CURSOR FOR
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS

OPEN view_cursor
FETCH NEXT FROM view_cursor INTO @ViewName

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '--- VIEW: ' + @ViewName + ' ---'
    SELECT OBJECT_DEFINITION(OBJECT_ID(@ViewName)) AS ViewDefinition
    FETCH NEXT FROM view_cursor INTO @ViewName
END

CLOSE view_cursor
DEALLOCATE view_cursor
GO

PRINT ''
PRINT '=============================================='
PRINT '9. STORED PROCEDURE DEFINITIONS'
PRINT '=============================================='

-- Get stored procedure definitions
DECLARE @ProcName NVARCHAR(128)
DECLARE proc_cursor CURSOR FOR
    SELECT name FROM sys.procedures

OPEN proc_cursor
FETCH NEXT FROM proc_cursor INTO @ProcName

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '--- PROCEDURE: ' + @ProcName + ' ---'
    SELECT OBJECT_DEFINITION(OBJECT_ID(@ProcName)) AS ProcedureDefinition
    FETCH NEXT FROM proc_cursor INTO @ProcName
END

CLOSE proc_cursor
DEALLOCATE proc_cursor
GO

PRINT ''
PRINT '=============================================='
PRINT '10. SAMPLE DATA FOR EACH METRIC BY REGION'
PRINT '=============================================='

-- Check if there's data showing regional breakdown
SELECT 
    'Looking for regional metrics (FRC, AUH, DXB)...' AS Info;

-- Try to find tables with region-specific data
SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%Region%' 
   OR COLUMN_NAME LIKE '%Location%'
   OR COLUMN_NAME LIKE '%Branch%'
   OR COLUMN_NAME LIKE '%Emirate%'
ORDER BY TABLE_NAME;
GO

