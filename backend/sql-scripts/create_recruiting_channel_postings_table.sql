-- =============================================
-- Recruiting Channel Posting Status Tracking
-- =============================================

CREATE TABLE IF NOT EXISTS `recruiting_channel_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `career_job_id` int NOT NULL,
  `channel_name` varchar(50) NOT NULL COMMENT 'autostrad, indeed, linkedin, naukrigulf, facebook, instagram, tiktok',
  `external_post_id` varchar(150) DEFAULT NULL,
  `posting_status` varchar(30) NOT NULL DEFAULT 'queued' COMMENT 'queued, posted, failed, retrying',
  `status_message` text DEFAULT NULL,
  `last_synced_at` datetime DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recruiting_channel_postings_job` (`career_job_id`),
  KEY `FK_recruiting_channel_postings_created_by` (`created_by`),
  KEY `FK_recruiting_channel_postings_updated_by` (`updated_by`),
  KEY `FK_recruiting_channel_postings_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_recruiting_channel_postings_job` FOREIGN KEY (`career_job_id`) REFERENCES `career_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_recruiting_channel_postings_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_recruiting_channel_postings_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
