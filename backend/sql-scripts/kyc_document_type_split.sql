-- =============================================================
-- KYC: split Emirates ID + Driving License into front / back uploads
-- (May 2026 client request)
--
-- Idempotent: safe to re-run.
-- - Extends the document_type enum on kyc_submission_attachments to
--   include the new front/back values.
-- - Keeps the legacy single-side values ('emirates_id',
--   'uae_driving_license') so existing rows remain valid.
-- =============================================================

ALTER TABLE `kyc_submission_attachments`
    MODIFY COLUMN `document_type` ENUM(
        'emirates_id',
        'uae_driving_license',
        'emirates_id_front',
        'emirates_id_back',
        'uae_driving_license_front',
        'uae_driving_license_back',
        'passport_visa'
    ) NOT NULL;
