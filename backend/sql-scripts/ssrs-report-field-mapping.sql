-- ============================================================================
-- DESCRIPTION: SSRS Report Field Mapping Analysis
-- ============================================================================
-- PURPOSE: Maps SSRS report fields to their data sources in the database, 
--          helping understand how report metrics are calculated and displayed.
--
-- ANALYZES:
--   - Report field definitions and expected values
--   - Source tables and columns for each metric
--   - Metric definitions (RAC, MRA, LES, NRM, IDLE, Transit, LR, etc.)
--   - Calculation formulas and percentages
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- SERVER:   10.2.6.18 (CARPRO-FOCUS)
-- REPORT:   Fast Rent A Car - Management Dashboard
--
-- NOTES: Essential reference for understanding report structure and data flow.
-- ============================================================================

USE FRCDASHBOARD;
GO

PRINT '=============================================='
PRINT 'FAST RENT A CAR - MANAGEMENT DASHBOARD REPORT'
PRINT 'Field-by-Field Analysis'
PRINT '=============================================='
PRINT ''

-- =====================================================
-- SECTION 1: FORD VEHICLES (Top Section)
-- =====================================================
PRINT '========== FORD VEHICLES SECTION =========='
PRINT ''
PRINT '| Report Field              | Expected Value |'
PRINT '|---------------------------|----------------|'
PRINT '| Total FRC Vehicles        | 5,385          |'
PRINT '| Total Utilized Vehicles   | 4,678 (87.67%) |'
PRINT '| Total Idle Vehicles       | 658 (12.33%)   |'
PRINT '| Management Use,Sale&Others| 49 (0.91%)     |'
PRINT '| Vehicles on Service       | 59             |'
PRINT ''

-- Find tables that might contain these values
PRINT 'Searching for source tables...'
PRINT ''

-- Check all tables for columns matching these metrics
SELECT 
    'Column Analysis' AS Analysis,
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE 
    COLUMN_NAME IN (
        'TotalVehicles', 'TotalFRCVehicles', 'FRCVehicles',
        'UtilizedVehicles', 'TotalUtilized', 'Utilized',
        'IdleVehicles', 'TotalIdle', 'Idle',
        'ManagementUse', 'MUse', 'M_Use',
        'Service', 'OnService', 'Maintenance',
        'RAC', 'MRA', 'LES', 'LESLoc'
    )
    OR COLUMN_NAME LIKE '%Vehicle%'
    OR COLUMN_NAME LIKE '%Utilized%'
    OR COLUMN_NAME LIKE '%Idle%'
ORDER BY TABLE_NAME, COLUMN_NAME;
GO

-- =====================================================
-- SECTION 2: Check the actual data in main tables
-- =====================================================
PRINT ''
PRINT '========== CHECKING MAIN DATA TABLES =========='
PRINT ''

-- List all tables with their row counts
SELECT 
    t.TABLE_NAME,
    p.rows AS [RowCount]
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN sys.tables st ON t.TABLE_NAME = st.name
INNER JOIN sys.partitions p ON st.object_id = p.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY p.rows DESC;
GO

-- =====================================================
-- SECTION 3: Try to find the report's data source
-- =====================================================
PRINT ''
PRINT '========== LOOKING FOR REPORT VIEWS =========='
PRINT ''

-- Check views that might be used by the report
SELECT 
    v.TABLE_NAME AS ViewName,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = v.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.VIEWS v
ORDER BY v.TABLE_NAME;
GO

-- =====================================================
-- SECTION 4: Show structure of each potential source
-- =====================================================
PRINT ''
PRINT '========== TABLE/VIEW STRUCTURES =========='
PRINT ''

-- Check common SSRS report table names
IF OBJECT_ID('DailySummary', 'U') IS NOT NULL OR OBJECT_ID('DailySummary', 'V') IS NOT NULL
BEGIN
    PRINT '--- DailySummary Structure ---'
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DailySummary';
END

IF OBJECT_ID('UtilizationSummary', 'U') IS NOT NULL OR OBJECT_ID('UtilizationSummary', 'V') IS NOT NULL
BEGIN
    PRINT '--- UtilizationSummary Structure ---'
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UtilizationSummary';
END

IF OBJECT_ID('VehicleSummary', 'U') IS NOT NULL OR OBJECT_ID('VehicleSummary', 'V') IS NOT NULL
BEGIN
    PRINT '--- VehicleSummary Structure ---'
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'VehicleSummary';
END
GO

-- =====================================================
-- SECTION 5: Based on report layout, expected metrics
-- =====================================================
PRINT ''
PRINT '=========================================='
PRINT 'REPORT METRICS BREAKDOWN (From Screenshot)'
PRINT '=========================================='
PRINT ''
PRINT '1. FORD VEHICLES (All Regions)'
PRINT '   - Total FRC Vehicles: 5,385'
PRINT '   - Total Utilized: 4,678 (RAC:876 + MRA:2011 + LES:1746 + LES Loc:45)'
PRINT '   - Total Idle: 658 (NRM:241 + IDLE:302 + Transit:17 + LR:95)'
PRINT '   - Mgmt Use/Sale/Others: 49 (M-Use:0 + 4Sale:27 + Missing:7 + Loss:15)'
PRINT '   - Vehicles on Service: 59'
PRINT ''
PRINT '2. ABU DHABI (AUH)'
PRINT '   - Total AUH Vehicles: 1,896'
PRINT '   - Utilized: 1,762 (RAC:199 + MRA:836 + LES:686 + LES Loc:41)'
PRINT '   - Idle: 119 (NRM:0 + IDLE:72 + Transit:3 + LR:41)'
PRINT '   - Mgmt Use/Sale/Others: 15'
PRINT '   - Vehicles on Service: 53'
PRINT ''
PRINT '3. DUBAI (DXB)'
PRINT '   - Total DXB Vehicles: 3,449'
PRINT '   - Utilized: 2,876 (84.22%)'
PRINT '   - Idle: 539 (15.78%)'
PRINT '   - Mgmt Use/Sale/Others: 34'
PRINT '   - Vehicles on Service: 6'
PRINT ''

-- =====================================================
-- SECTION 6: Metric Definitions (Based on Industry)
-- =====================================================
PRINT '=========================================='
PRINT 'METRIC DEFINITIONS'
PRINT '=========================================='
PRINT ''
PRINT 'UTILIZATION CATEGORIES:'
PRINT '  RAC  = Rental Agreements Current (On Rent)'
PRINT '  MRA  = Monthly Rental Agreements'
PRINT '  LES  = Leased Vehicles'
PRINT '  LES Loc = Leased to Locations'
PRINT ''
PRINT 'IDLE CATEGORIES:'
PRINT '  NRM     = Not Ready for Movement'
PRINT '  IDLE    = Available but not rented'
PRINT '  Transit = Vehicles being transferred'
PRINT '  LR      = Long-term Reserved'
PRINT ''
PRINT 'MANAGEMENT/OTHER:'
PRINT '  M-Use   = Management Use'
PRINT '  4Sale   = For Sale'
PRINT '  Missing = Unaccounted vehicles'
PRINT '  Loss    = Written off/Lost vehicles'
PRINT ''
PRINT 'SERVICE/MAINTENANCE:'
PRINT '  Vehicles currently in service/repair'
PRINT ''

-- =====================================================
-- SECTION 7: CALCULATION FORMULAS
-- =====================================================
PRINT '=========================================='
PRINT 'CALCULATION FORMULAS'
PRINT '=========================================='
PRINT ''
PRINT 'Total Vehicles = Utilized + Idle + Mgmt/Others + Service'
PRINT ''
PRINT 'Utilization % = (Total Utilized / Total Vehicles) * 100'
PRINT '   Example: 4678 / 5385 = 86.87% (shown as 87.67%)'
PRINT ''
PRINT 'Idle % = (Total Idle / Total Vehicles) * 100'
PRINT '   Example: 658 / 5385 = 12.22% (shown as 12.33%)'
PRINT ''
PRINT 'Mgmt % = (Mgmt Use / Total Vehicles) * 100'
PRINT '   Example: 49 / 5385 = 0.91%'
PRINT ''
GO






