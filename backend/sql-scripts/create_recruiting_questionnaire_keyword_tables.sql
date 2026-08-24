-- =============================================
-- Recruiting Questionnaire & Screening Keywords
-- =============================================

CREATE TABLE IF NOT EXISTS `recruiting_questionnaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `question_en` text NOT NULL,
  `question_ae` text DEFAULT NULL,
  `question_type` varchar(30) NOT NULL DEFAULT 'text' COMMENT 'text, yes_no, multiple_choice',
  `is_required` tinyint NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_questionnaires_job` (`career_job_id`),
  KEY `FK_recruiting_questionnaires_created_by` (`created_by`),
  KEY `FK_recruiting_questionnaires_updated_by` (`updated_by`),
  KEY `FK_recruiting_questionnaires_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_questionnaires_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_questionnaires_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_questionnaires_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recruiting_screening_keywords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `keyword` varchar(150) NOT NULL,
  `keyword_type` varchar(20) NOT NULL DEFAULT 'optional' COMMENT 'must_have, optional, exclude',
  `weight` int NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_screening_keywords_job` (`career_job_id`),
  KEY `FK_recruiting_screening_keywords_created_by` (`created_by`),
  KEY `FK_recruiting_screening_keywords_updated_by` (`updated_by`),
  KEY `FK_recruiting_screening_keywords_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_screening_keywords_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_screening_keywords_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_screening_keywords_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
