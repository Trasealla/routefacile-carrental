-- ============================================================================
-- DESCRIPTION: Update MCR Transaction Serial Number
-- ============================================================================
-- PURPOSE: Corrects the transaction serial number (trans_sl_no) for an MCR
--          transaction that was incorrectly assigned a duplicate serial number.
-- 
-- ISSUE: New MCR generated with serial number 400000026, but should be 
--        400000028 (the last correct MCR was 400000027).
--
-- TARGET: Transaction ID 16197 (AMAN TAXI transaction)
-- TABLE:  mcr.transaction
-- COLUMN: trans_sl_no
--
-- NOTES: This script includes verification queries to check the update was 
--        successful and ensure the next transaction will use 400000029.
-- ============================================================================

-- Step 1: Get the last transaction (most recent by ID)
SELECT * FROM mcr.transaction 
ORDER BY idtransaction DESC 
LIMIT 1;

-- Alternative: Get last transaction by date
-- SELECT * FROM mcr.transaction 
-- ORDER BY date_of_reg DESC 
-- LIMIT 1;

-- Step 1b: Find the current highest SLno (for verification)
-- Uncomment to check:
-- SELECT MAX(trans_sl_no) as current_max_slno FROM mcr.transaction;

-- Step 2: Update transaction 16197 from 400000026 to 400000028
-- This is the AMAN TAXI transaction that was incorrectly assigned 400000026
UPDATE mcr.transaction 
SET trans_sl_no = 400000028
WHERE idtransaction = 16197;

-- Verify the update was successful
SELECT idtransaction, trans_sl_no, customername, amount, date_of_reg 
FROM mcr.transaction 
WHERE idtransaction = 16197;

-- Step 3: Verify next MCR will be 400000029
-- Check current max trans_sl_no (should be 400000028 after update)
SELECT MAX(trans_sl_no) as current_max_slno FROM mcr.transaction;

-- Note: If trans_sl_no is not an auto-increment column, you'll need to handle
-- the next number generation in your application code to ensure it generates 400000029

-- Step 4: Verify the update - Check transaction 16197 now has 400000028
SELECT idtransaction, trans_sl_no, customername, amount, date_of_reg 
FROM mcr.transaction 
WHERE idtransaction = 16197;

-- Also verify all recent MCRs are correct
SELECT idtransaction, trans_sl_no, customername, date_of_reg 
FROM mcr.transaction 
WHERE trans_sl_no >= 400000020
ORDER BY trans_sl_no DESC;

-- Step 5: Check the next auto-increment value (if trans_sl_no is auto-increment)
-- Uncomment to check:
-- SHOW TABLE STATUS FROM mcr LIKE 'transaction';

-- ============================================
-- FOR MYSQL/MARIADB:
-- ============================================
-- If the above ALTER TABLE doesn't work, try:
-- ALTER TABLE mcr.transaction AUTO_INCREMENT = 400000028;

-- ============================================
-- FOR SQL SERVER:
-- ============================================
-- If using SQL Server, you need to:
-- 1. Find the identity column name (usually 'idtransaction' or 'trans_sl_no')
-- 2. Use: DBCC CHECKIDENT ('mcr.transaction', RESEED, 400000028);
--    (This sets the next value to 400000029)

-- ============================================
-- NOTES:
-- ============================================
-- 1. Make sure to backup your database before running this script
-- 2. Database: 'mcr', Table name: 'transaction' (singular)
-- 3. Primary key: 'idtransaction'
-- 4. Column to update: 'trans_sl_no'
-- 5. If trans_sl_no is not an auto-increment column, you'll need to manually
--    set it in your application code when creating new transactions
-- 6. If there are multiple transactions with SLno 400000026, Option A (by ID) 
--    is recommended to update only specific ones
-- 7. After updating, verify that the next transaction created gets SLno 400000029
-- 8. The issue: Last MCR was 400000027, new one got 400000026 (wrong), 
--    updating to 400000028, next should be 400000029

