-- ============================================================================
-- DESCRIPTION: Fetch Payment Data Report by Booking Number
-- ============================================================================
-- PURPOSE: Generates a comprehensive payment report for a specific booking 
--          including all payment-related information, transactions, and installments.
--
-- USAGE: Replace 'BOOKING_NUMBER_HERE' with the actual booking number.
--
-- RETURNS:
--   - Booking payment details (status, type, amounts)
--   - Payfort transaction information
--   - Refund information
--   - Transaction count and latest transaction details
--   - Installment count
--
-- TABLES: bookings, booking_payment_transactions, booking_monthly_installments
--
-- NOTES: Useful for customer service inquiries about payment status and history.
-- ============================================================================

SELECT 
    b.id AS booking_id,
    b.booking_number,
    b.booking_log_number,
    b.type AS booking_type,
    b.payment_type,
    b.payment_status,
    b.payment_triggered,
    b.pay_now_amount,
    b.pay_later_amount,
    b.sub_amount,
    b.vat_amount,
    b.total_amount,
    b.actual_total_amount,
    b.payfort_id,
    b.payfort_response,
    b.refund_amount,
    b.refund_status,
    (SELECT COUNT(*) 
     FROM booking_payment_transactions bpt2 
     WHERE bpt2.booking_id = b.id) AS transaction_count,
    (SELECT COUNT(*) 
     FROM booking_monthly_installments bmi2 
     WHERE bmi2.booking_id = b.id) AS installment_count,
    (SELECT bpt3.type 
     FROM booking_payment_transactions bpt3 
     WHERE bpt3.booking_id = b.id 
     ORDER BY bpt3.created_at DESC 
     LIMIT 1) AS latest_transaction_type,
    (SELECT bpt3.created_at 
     FROM booking_payment_transactions bpt3 
     WHERE bpt3.booking_id = b.id 
     ORDER BY bpt3.created_at DESC 
     LIMIT 1) AS latest_transaction_date
FROM 
    bookings b
WHERE 
    b.booking_number = 'BOOKING_NUMBER_HERE';

