-- =============================================
-- Recruiting Module - Database Migration
-- =============================================

-- 1. Recruiting Departments
CREATE TABLE IF NOT EXISTS `recruiting_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL,
  `name_ae` varchar(255) NOT NULL,
  `description_en` text DEFAULT NULL,
  `description_ae` text DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_departments_created_by` (`created_by`),
  KEY `FK_recruiting_departments_updated_by` (`updated_by`),
  KEY `FK_recruiting_departments_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_departments_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_departments_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_departments_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Recruiting Interviews
CREATE TABLE IF NOT EXISTS `recruiting_interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `interview_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interview_type` varchar(50) NOT NULL COMMENT 'in-person, phone, video',
  `notes` text DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0=Scheduled, 1=Completed, 2=Cancelled, 3=No-Show, 4=Rescheduled',
  `feedback` text DEFAULT NULL,
  `rating` tinyint DEFAULT NULL COMMENT '1-5 scale',
  `application_id` int NOT NULL,
  `interviewer_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_interviews_application` (`application_id`),
  KEY `FK_recruiting_interviews_interviewer` (`interviewer_id`),
  KEY `FK_recruiting_interviews_created_by` (`created_by`),
  CONSTRAINT `FK_recruiting_interviews_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`),
  CONSTRAINT `FK_recruiting_interviews_interviewer` FOREIGN KEY (`interviewer_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_interviews_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Recruiting Status History
CREATE TABLE IF NOT EXISTS `recruiting_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_status` tinyint NOT NULL COMMENT '0=Pending, 1=Reviewing, 2=Shortlisted, 3=Interviewed, 4=Rejected, 5=Hired',
  `to_status` tinyint NOT NULL COMMENT '0=Pending, 1=Reviewing, 2=Shortlisted, 3=Interviewed, 4=Rejected, 5=Hired',
  `notes` text DEFAULT NULL,
  `application_id` int NOT NULL,
  `changed_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_status_history_application` (`application_id`),
  KEY `FK_recruiting_status_history_changed_by` (`changed_by`),
  CONSTRAINT `FK_recruiting_status_history_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_status_history_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Recruiting Application Ratings
CREATE TABLE IF NOT EXISTS `recruiting_application_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating` tinyint NOT NULL COMMENT '1-5 scale',
  `comments` text DEFAULT NULL,
  `application_id` int NOT NULL,
  `rated_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_application_ratings_application` (`application_id`),
  KEY `FK_recruiting_application_ratings_rated_by` (`rated_by`),
  CONSTRAINT `FK_recruiting_application_ratings_application` FOREIGN KEY (`application_id`) REFERENCES `career_job_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_application_ratings_rated_by` FOREIGN KEY (`rated_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
