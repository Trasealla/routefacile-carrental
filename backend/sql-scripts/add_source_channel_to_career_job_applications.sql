-- =============================================
-- Add source channel tracking for applications
-- =============================================

ALTER TABLE `career_job_applications`
  ADD COLUMN `source_channel` VARCHAR(30) NOT NULL DEFAULT 'autostrad' AFTER `cv`;
