-- ============================================================================
-- DESCRIPTION: Display Detailed FRC Dashboard Job Commands for SSRS
-- ============================================================================
-- PURPOSE: Shows detailed SQL commands from the FRC_DASHBOARD job to 
--          understand how data is populated for SSRS reports.
--
-- FORMAT: Prints each job step separately with full command text for 
--         better readability and analysis.
--
-- DATABASE: msdb, FRCDASHBOARD (SQL Server)
-- SERVER:   10.2.6.18 (CARPRO-FOCUS)
-- JOB:      FRC_DASHBOARD
--
-- NOTES: Provides step-by-step view of the data pipeline from MySQL source 
--        to SQL Server destination tables used by SSRS reports.
-- ============================================================================

USE msdb;
GO

PRINT '=============================================='
PRINT 'FRC_DASHBOARD JOB - STEP BY STEP COMMANDS'
PRINT '=============================================='
PRINT ''

-- Get each step with its full command
SELECT 
    sjs.step_id AS [Step #],
    sjs.step_name AS [Step Name],
    sjs.database_name AS [Database],
    sjs.subsystem AS [Type],
    CAST(sjs.command AS NVARCHAR(MAX)) AS [SQL Command]
FROM sysjobs sj
INNER JOIN sysjobsteps sjs ON sj.job_id = sjs.job_id
WHERE sj.name = 'FRC_DASHBOARD'
ORDER BY sjs.step_id;
GO

PRINT ''
PRINT '=============================================='
PRINT 'DETAILED VIEW OF EACH STEP COMMAND'
PRINT '=============================================='
PRINT ''

-- Show each step command separately for better readability
DECLARE @step_id INT
DECLARE @step_name NVARCHAR(128)
DECLARE @command NVARCHAR(MAX)

DECLARE step_cursor CURSOR FOR
    SELECT sjs.step_id, sjs.step_name, sjs.command
    FROM sysjobs sj
    INNER JOIN sysjobsteps sjs ON sj.job_id = sjs.job_id
    WHERE sj.name = 'FRC_DASHBOARD'
    ORDER BY sjs.step_id

OPEN step_cursor
FETCH NEXT FROM step_cursor INTO @step_id, @step_name, @command

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '----------------------------------------------'
    PRINT 'STEP ' + CAST(@step_id AS VARCHAR) + ': ' + @step_name
    PRINT '----------------------------------------------'
    PRINT @command
    PRINT ''
    PRINT ''
    FETCH NEXT FROM step_cursor INTO @step_id, @step_name, @command
END

CLOSE step_cursor
DEALLOCATE step_cursor
GO

PRINT ''
PRINT '=============================================='
PRINT 'DATA FLOW SUMMARY'
PRINT '=============================================='
PRINT ''
PRINT 'The FRC_DASHBOARD job typically:'
PRINT '1. Pulls data from MySQL (via ORN11J linked server)'
PRINT '2. Aggregates vehicle status counts'
PRINT '3. Stores results in FRCDASHBOARD database'
PRINT '4. Report reads from these tables/views'
PRINT ''
PRINT 'Key MySQL Tables (source):'
PRINT '  - Vehicle master table'
PRINT '  - Rental agreements table'
PRINT '  - Location/Branch table'
PRINT ''
PRINT 'Key SQL Server Tables (destination):'
PRINT '  - UtilizationDailySummary'
PRINT '  - LocationMaster'
PRINT '  - Other summary tables'
PRINT ''






