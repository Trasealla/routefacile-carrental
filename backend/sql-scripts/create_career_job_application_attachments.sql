-- Career Job Application Attachments: Support multiple file uploads per application

CREATE TABLE IF NOT EXISTS `career_job_application_attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` INT NOT NULL,
  `career_job_application_id` INT NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_attachment_application_id` (`career_job_application_id`),
  CONSTRAINT `FK_attachment_career_job_application` FOREIGN KEY (`career_job_application_id`) REFERENCES `career_job_applications`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
