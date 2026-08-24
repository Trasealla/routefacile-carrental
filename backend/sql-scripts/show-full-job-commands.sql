-- ============================================================================
-- DESCRIPTION: Display Full FRC Dashboard Job Commands
-- ============================================================================
-- PURPOSE: Shows complete SQL commands for all steps in the FRC_DASHBOARD 
--          SQL Server Agent job to understand data calculation processes.
--
-- OUTPUT: Lists all job steps with:
--   - Step number and name
--   - Target database
--   - Complete SQL command text
--   - Steps containing specific keywords (AUH, Abu, Idle, NRM, Transit, LR)
--
-- DATABASE: msdb, FRCDASHBOARD (SQL Server)
-- JOB:      FRC_DASHBOARD
--
-- NOTES: Essential for debugging and understanding how vehicle utilization 
--        data flows from MySQL to SQL Server and is processed.
-- ============================================================================

USE msdb;
GO

-- =====================================================
-- STEP 1: Show ALL job steps with FULL command text
-- =====================================================

PRINT '=============================================='
PRINT 'ALL FRC_DASHBOARD JOB STEPS - FULL COMMANDS'
PRINT '=============================================='
PRINT ''

SELECT 
    step_id AS [Step#],
    step_name AS [StepName],
    database_name AS [Database],
    CAST(command AS NVARCHAR(MAX)) AS [FullCommand]
FROM sysjobsteps
WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
ORDER BY step_id;
GO

-- =====================================================
-- STEP 2: Print each step separately for readability
-- =====================================================

DECLARE @stepId INT
DECLARE @stepName NVARCHAR(200)
DECLARE @database NVARCHAR(200)
DECLARE @command NVARCHAR(MAX)

DECLARE step_cursor CURSOR FOR
    SELECT step_id, step_name, database_name, command
    FROM sysjobsteps
    WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
    ORDER BY step_id

OPEN step_cursor
FETCH NEXT FROM step_cursor INTO @stepId, @stepName, @database, @command

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '=================================================='
    PRINT 'STEP ' + CAST(@stepId AS VARCHAR(10)) + ': ' + @stepName
    PRINT 'Database: ' + ISNULL(@database, 'N/A')
    PRINT '=================================================='
    PRINT ''
    PRINT @command
    PRINT ''
    PRINT ''
    
    FETCH NEXT FROM step_cursor INTO @stepId, @stepName, @database, @command
END

CLOSE step_cursor
DEALLOCATE step_cursor
GO

-- =====================================================
-- STEP 3: Look for specific patterns in job commands
-- =====================================================

PRINT ''
PRINT '=============================================='
PRINT 'STEPS CONTAINING AUH/ABU DHABI/IDLE KEYWORDS'
PRINT '=============================================='

SELECT 
    step_id,
    step_name,
    CASE 
        WHEN command LIKE '%AUH%' THEN 'Contains AUH'
        WHEN command LIKE '%Abu%' THEN 'Contains Abu'
        WHEN command LIKE '%Idle%' THEN 'Contains Idle'
        WHEN command LIKE '%NRM%' THEN 'Contains NRM'
        WHEN command LIKE '%Transit%' THEN 'Contains Transit'
        ELSE 'Other'
    END AS KeywordFound
FROM sysjobsteps
WHERE job_id = (SELECT job_id FROM sysjobs WHERE name = 'FRC_DASHBOARD')
AND (
    command LIKE '%AUH%' 
    OR command LIKE '%Abu%'
    OR command LIKE '%Idle%'
    OR command LIKE '%NRM%'
    OR command LIKE '%Transit%'
    OR command LIKE '%LR%'
)
ORDER BY step_id;
GO






