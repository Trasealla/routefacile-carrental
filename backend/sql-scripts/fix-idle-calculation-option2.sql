-- ============================================================================
-- DESCRIPTION: Fix Idle Calculation - Option 2 (Report-Level Fix)
-- ============================================================================
-- PURPOSE: Alternative fix for idle vehicle calculation mismatch where 
--          locations 34, 15, 32 are excluded from IDLE breakdown but 
--          included in the Total. This option keeps the exclusion and 
--          fixes the calculation at the SSRS report level.
--
-- ISSUE: IDLE breakdown shows 242 (excludes locations 34,15,32) but Total 
--        shows 245 (includes all locations). The 3-vehicle difference is 
--        from the excluded locations.
--
-- SOLUTION: Modify stored procedure to add excluded vehicles back, or fix 
--           the SSRS report Total calculation to match the filtered breakdown.
--
-- DATABASE: FRCDASHBOARD (SQL Server)
-- ============================================================================

USE FRCDASHBOARD;
GO

-- =====================================================
-- First, let's understand what's at locations 34, 15, 32
-- =====================================================
SELECT 
    Location,
    LocationName,
    Region
FROM LocationMaster
WHERE Location IN (34, 15, 32);
GO

-- =====================================================
-- Check how many IDLE vehicles are at these locations
-- =====================================================
SELECT 
    Region,
    Location,
    [Description],
    SUM(TotalVeh) AS VehicleCount
FROM vw_MAIN_TOTAL_IDLE_VEH
WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
AND [Description] = 'IDLE'
AND Location IN (34, 15, 32)
GROUP BY Region, Location, [Description];
GO

-- =====================================================
-- QUICK FIX: Just re-run the procedure without changes
-- and let the SSRS report handle the total correctly
-- =====================================================

-- If you want to keep the current logic but fix the display,
-- you need to modify the SSRS report's Total calculation to use:
-- =SUM(Fields!NRMCount.Value) + SUM(Fields!IdleCount.Value) + 
--  SUM(Fields!LRCount.Value) + SUM(Fields!SaleCount.Value)

-- Instead of whatever it's currently using for the total.

-- =====================================================
-- ALTERNATIVE: Add the excluded vehicles as a separate column
-- =====================================================

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
        ISNULL(IDLE.IdleCount, 0) + ISNULL(IDLE_EX.IdleExcluded, 0) IdleCount,  -- Include ALL
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
        
        -- IDLE excluding locations 34,15,32
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS IdleCount, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'IDLE'
         AND Location NOT IN (34, 15, 32)
         GROUP BY Region, Location) IDLE 
         ON A.Region = IDLE.Region AND A.Location = IDLE.Location
         
        -- IDLE at excluded locations (to add back)
        LEFT OUTER JOIN
        (SELECT SUM(TotalVeh) AS IdleExcluded, Region, Location
         FROM vw_MAIN_TOTAL_IDLE_VEH
         WHERE ReportDate = CONVERT(varchar, GETDATE(), 112)
         AND [Description] = 'IDLE'
         AND Location IN (34, 15, 32)
         GROUP BY Region, Location) IDLE_EX 
         ON A.Region = IDLE_EX.Region AND A.Location = IDLE_EX.Location
        
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






