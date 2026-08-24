-- ============================================================================
-- DESCRIPTION: Fix Total Calculation to Match Breakdown Sum
-- ============================================================================
-- PURPOSE: Corrects the Total calculation to match the sum of breakdown 
--          components (242) by applying the same location filter used for 
--          IDLE breakdown (excluding locations 34, 15, 32).
--
-- ISSUE: Total shows 245 but breakdown (NRM + IDLE + LR + Transit) = 242.
--        The difference is due to IDLE excluding locations 34,15,32 while 
--        Total includes them.
--
-- SOLUTION: Either modify the view to apply the same filter, or fix the 
--           SSRS report to calculate Total from the filtered breakdown columns.
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- VIEW:     vw_AUH_TOTAL_IdleVehicles (if applicable)
--
-- NOTES: Includes verification query to check if correct total (242) is 
--        calculated after the fix.
-- ============================================================================

USE FRCDASHBOARD;
GO

-- =====================================================
-- STEP 1: Find where the Total (245) is calculated
-- =====================================================

-- Check if there's a separate view for the Total
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_NAME LIKE '%AUH%' 
   OR TABLE_NAME LIKE '%Total%Idle%';
GO

-- =====================================================
-- STEP 2: Check vw_AUH_TOTAL_IdleVehicles
-- This view likely calculates the 245 total
-- =====================================================

-- See the view definition
EXEC sp_helptext 'vw_AUH_TOTAL_IdleVehicles';
GO

-- Check what data it returns
SELECT * FROM vw_AUH_TOTAL_IdleVehicles;
GO

-- =====================================================
-- STEP 3: The fix depends on where Total is calculated
-- Run the above queries first, then apply the fix below
-- =====================================================

-- If the Total comes from vw_AUH_TOTAL_IdleVehicles,
-- modify it to exclude locations 34, 15, 32 for IDLE:

/*
ALTER VIEW [dbo].[vw_AUH_TOTAL_IdleVehicles]
AS
SELECT 
    SUM(CASE WHEN [Description] = 'NRM' THEN TotalVeh ELSE 0 END) +
    SUM(CASE WHEN [Description] = 'IDLE' AND Location NOT IN (34,15,32) THEN TotalVeh ELSE 0 END) +
    SUM(CASE WHEN [Description] = 'Lease Replacement' THEN TotalVeh ELSE 0 END) +
    SUM(CASE WHEN [Description] = 'for Sale' THEN TotalVeh ELSE 0 END) AS TotalIdleVehicles,
    Region
FROM vw_MAIN_TOTAL_IDLE_VEH
WHERE Region = 4  -- AUH
AND ReportDate = CONVERT(varchar, GETDATE(), 112)
GROUP BY Region;
*/

-- =====================================================
-- ALTERNATIVE: If Total is calculated in SSRS Report
-- The fix needs to be done in Report Builder
-- =====================================================

-- The report should calculate Total as:
-- Total = NRM + IDLE + LR + Transit
-- Where each value comes from utiMainIdles table
-- (which already has the filter applied)

-- Check the current values in utiMainIdles:
SELECT 
    Region,
    SUM(NRMCount) AS NRM,
    SUM(IdleCount) AS IDLE,
    SUM(LRCount) AS LR,
    SUM(SaleCount) AS Transit,
    SUM(NRMCount + IdleCount + LRCount + SaleCount) AS CorrectTotal
FROM utiMainIdles
WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
AND Region = 4  -- AUH
GROUP BY Region;
GO

PRINT ''
PRINT 'The CorrectTotal above should be 242'
PRINT 'If it shows 242, the fix needs to be in the SSRS report'
PRINT 'to use SUM of breakdown columns instead of a separate Total query'
GO

