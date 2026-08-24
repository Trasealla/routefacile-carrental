-- Career Job Applications: Add status, admin_notes, reviewed_by, updated_at columns
-- Status values: 0=Pending, 1=Reviewing, 2=Shortlisted, 3=Interviewed, 4=Rejected, 5=Hired

ALTER TABLE `career_job_applications` 
ADD COLUMN `status` TINYINT NOT NULL DEFAULT 0 AFTER `cv`,
ADD COLUMN `admin_notes` TEXT NULL AFTER `status`,
ADD COLUMN `reviewed_by` INT NULL AFTER `career_job_id`,
ADD COLUMN `updated_at` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER `created_at`,
ADD CONSTRAINT `FK_career_job_application_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL;
