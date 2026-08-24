-- ============================================================================
-- DESCRIPTION: Fix AUH Idle Total Mismatch (Option 1)
-- ============================================================================
-- PURPOSE: Corrects the idle vehicle calculation mismatch by removing the 
--          location filter that excluded locations 34, 15, 32 from IDLE count, 
--          ensuring the breakdown matches the total.
--
-- ISSUE: IDLE breakdown shows 242 (excludes locations 34,15,32) but Total 
--        shows 245. The 3-vehicle difference comes from excluded locations.
--
-- SOLUTION: Modify stored procedure sp_MainIdles to remove the location 
--           filter, making breakdown match the total.
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- PROCEDURE: sp_MainIdles
--
-- NOTES: This is Option 1 - includes all locations. See fix-idle-calculation-option2.sql 
--        for alternative approach that keeps exclusion and fixes at report level.
-- ============================================================================

USE FRCDASHBOARD;
GO

-- =====================================================
-- OPTION 1: INCLUDE all locations in IDLE breakdown
-- (This will make breakdown match the total)
-- =====================================================

-- First, backup the current procedure
-- EXEC sp_helptext 'sp_MainIdles';

-- Modify the stored procedure to REMOVE the location filter
ALTER PROCEDURE [dbo].[sp_MainIdles]
AS
BEGIN
    DELETE FROM [FRCDASHBOARD].[dbo].utiMainIdles 
    WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
    
    INSERT INTO [FRCDASHBOARD].[dbo].utiMainIdles
    SELECT 
        A.Region,
        CONVERT(varchar, GETDATE(), 112),
        ISNULL(SALE.SaleCount, 0) SaleCount,
        ISNULL(IDLE.IdleCount, 0) IdleCount,
        ISNULL(LR.LRCount, 0) LRCount,
        ISNULL(NRM.NRMCount, 0) NRMCount,
        A.Location
    FROM 
        LocationMaster A
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS SaleCount, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'for Sale'
         GROUP BY Region, Location) SALE 
         ON A.Region = SALE.Region AND A.Location = SALE.Location
        
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS IdleCount, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'IDLE'
         -- REMOVED: AND Location not in (34,15,32)  <-- THIS WAS THE BUG
         GROUP BY Region, Location) IDLE 
         ON A.Region = IDLE.Region AND A.Location = IDLE.Location
        
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS LRCount, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'Lease Replacement'
         GROUP BY Region, Location) LR 
         ON A.Region = LR.Region AND A.Location = LR.Location
        
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS NRMCount, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'NRM'
         GROUP BY Region, Location) NRM 
         ON A.Region = NRM.Region AND A.Location = NRM.Location
         
    WHERE A.Region IN (2, 4, 9, 10, 11)
END
GO

-- =====================================================
-- After fixing, re-run the procedure to update data
-- =====================================================
EXEC sp_MainIdles;
GO

-- =====================================================
-- Verify the fix
-- =====================================================
SELECT 
    Region,
    SUM(SaleCount) AS TotalSale,
    SUM(IdleCount) AS TotalIdle,
    SUM(LRCount) AS TotalLR,
    SUM(NRMCount) AS TotalNRM,
    SUM(SaleCount + IdleCount + LRCount + NRMCount) AS CalculatedTotal
FROM utiMainIdles
WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
AND Region IN (2, 4)
GROUP BY Region;
GO

PRINT ''
PRINT 'Expected results after fix:'
PRINT 'Region 2: TotalIdle should be 77 (was 74)'
PRINT 'CalculatedTotal should now match the Report Total'
GO

