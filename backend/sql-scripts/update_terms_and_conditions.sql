-- ============================================================================
-- DESCRIPTION: Update Terms and Conditions Page Content
-- ============================================================================
-- PURPOSE: Updates the Terms and Conditions page content by removing a 
--          specific clause and updating terminology for refund processing fee.
--
-- CHANGES:
--   1. Removes: Clause about same-day bookings or bookings under AED 100
--   2. Updates: "non-refundable transaction fee" → "processing fee"
--
-- PAGES: terms_and_conditions (id = 3)
-- LANGUAGES: English (content_en) and Arabic (content_ae)
--
-- NOTES: Updates both English and Arabic content to maintain consistency.
-- ============================================================================

-- Update English content (content_en)
-- Using id = 3 (terms_and_conditions page) to satisfy MySQL safe update mode
UPDATE pages 
SET 
  content_en = REPLACE(
    REPLACE(
      content_en,
      '<li>For same day bookings or valued under AED 100, cancellations made within 24 hours of the scheduled pickup time will not be eligible for a refund.</li>',
      ''
    ),
    '<strong> Note</strong> A non-refundable transaction fee of 6% will be deducted from all approved refunds.',
    '<strong> Note</strong> A 6% processing fee will be deducted from all approved refunds.'
  ),
  updated_at = NOW()
WHERE 
  id = 3;

-- Update Arabic content (content_ae)
-- Remove the Arabic equivalent of the same day booking line
-- Update the Arabic note text
UPDATE pages 
SET 
  content_ae = REPLACE(
    REPLACE(
      content_ae,
      '<li>بالنسبة للحجوزات في نفس اليوم أو التي تقل قيمتها عن 100 درهم إماراتي، فإن الإلغاءات التي تتم خلال 24 ساعة من موعد الاستلام المحدد لن تكون مؤهلة لاسترداد المبلغ.</li>',
      ''
    ),
    '<strong> ملاحظة</strong>سيتم خصم رسوم معاملة غير قابلة للاسترداد بنسبة 6٪ من جميع المبالغ المستردة المعتمدة.',
    '<strong> ملاحظة</strong>سيتم خصم رسوم معالجة بنسبة 6٪ من جميع المبالغ المستردة المعتمدة.'
  ),
  updated_at = NOW()
WHERE 
  id = 3;

-- Alternative: Update both content_en and content_ae in a single query
-- UPDATE pages 
-- SET 
--   content_en = REPLACE(
--     REPLACE(
--       content_en,
--       '<li>For same day bookings or valued under AED 100, cancellations made within 24 hours of the scheduled pickup time will not be eligible for a refund.</li>',
--       ''
--     ),
--     '<strong> Note</strong> A non-refundable transaction fee of 6% will be deducted from all approved refunds.',
--     '<strong> Note</strong> A 6% processing fee will be deducted from all approved refunds.'
--   ),
--   content_ae = REPLACE(
--     REPLACE(
--       content_ae,
--       '<li>بالنسبة للحجوزات في نفس اليوم أو التي تقل قيمتها عن 100 درهم إماراتي، فإن الإلغاءات التي تتم خلال 24 ساعة من موعد الاستلام المحدد لن تكون مؤهلة لاسترداد المبلغ.</li>',
--       ''
--     ),
--     '<strong> ملاحظة</strong>سيتم خصم رسوم معاملة غير قابلة للاسترداد بنسبة 6٪ من جميع المبالغ المستردة المعتمدة.',
--     '<strong> ملاحظة</strong>سيتم خصم رسوم معالجة بنسبة 6٪ من جميع المبالغ المستردة المعتمدة.'
--   ),
--   updated_at = NOW()
-- WHERE 
--   id = 3;

