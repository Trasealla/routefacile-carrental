-- ============================================================================
-- DESCRIPTION: Trace FRC Dashboard Job Calculation Logic
-- ============================================================================
-- PURPOSE: Diagnostic script to trace how vehicle status calculations 
--          (NRM, IDLE, Transit, LR) are performed in the FRC_DASHBOARD job.
--
-- ANALYZES:
--   - All job steps with full commands
--   - Steps that calculate Idle/NRM/Transit/LR
--   - Steps that query MySQL via linked server
--   - Stored procedures and views used for calculations
--
-- DATABASE: FRCDASHBOARD (SQL Server), msdb
-- JOB:      FRC_DASHBOARD
--
-- NOTES: Use this to understand the data flow and calculation logic for 
--        vehicle utilization metrics.
-- ============================================================================

USE msdb;
GO

PRINT '=============================================='
PRINT 'STEP 1: Show ALL job steps with full commands'
PRINT '=============================================='

SELECT 
    step_id,
    step_name,
    database_name,
    CAST(command AS NVARCHAR(MAX)) AS full_command
FROM sysjobsteps
WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
ORDER BY step_id;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 2: Find steps that calculate Idle/NRM'
PRINT '=============================================='

SELECT 
    step_id,
    step_name,
    CAST(command AS NVARCHAR(MAX)) AS command
FROM sysjobsteps
WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
AND (
    command LIKE '%NRM%'
    OR command LIKE '%Idle%'
    OR command LIKE '%AVL%'
    OR command LIKE '%Transit%'
    OR command LIKE '%LR%'
    OR command LIKE '%Reserve%'
);
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 3: Find steps that query MySQL (ORN11J)'
PRINT '=============================================='

SELECT 
    step_id,
    step_name,
    LEFT(CAST(command AS NVARCHAR(MAX)), 500) AS command_preview
FROM sysjobsteps
WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
AND (
    command LIKE '%ORN11J%'
    OR command LIKE '%OPENQUERY%'
    OR command LIKE '%linked%'
);
GO

USE FRCDASHBOARD;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 4: Check stored procedures for Idle calc'
PRINT '=============================================='

SELECT 
    name AS ProcedureName,
    OBJECT_DEFINITION(object_id) AS ProcDefinition
FROM sys.procedures
WHERE OBJECT_DEFINITION(object_id) LIKE '%NRM%'
   OR OBJECT_DEFINITION(object_id) LIKE '%Idle%'
   OR OBJECT_DEFINITION(object_id) LIKE '%AVL%';
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 5: Check views for Idle calculation'
PRINT '=============================================='

SELECT 
    v.TABLE_NAME AS ViewName,
    m.definition AS ViewDefinition
FROM INFORMATION_SCHEMA.VIEWS v
CROSS APPLY sys.sql_modules m
WHERE m.object_id = OBJECT_ID(v.TABLE_NAME);
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 6: List all stored procedures'
PRINT '=============================================='

SELECT name FROM sys.procedures ORDER BY name;
GO

PRINT ''
PRINT '=============================================='
PRINT 'STEP 7: Check if Transit/LR come from MySQL'
PRINT '=============================================='

-- Transit and LR might be calculated from a different source
-- Check if there's a separate status table

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%Status%'
   OR TABLE_NAME LIKE '%Transit%'
   OR TABLE_NAME LIKE '%Transfer%';
GO






