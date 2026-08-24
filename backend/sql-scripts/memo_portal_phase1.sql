-- =============================================================================
-- Memo Portal - Phase 1 Database Migration
-- =============================================================================
-- Centralized, secure document/memo portal.
-- Reuses the existing `admins` table (admins.type = 'admin' is the Memo Admin;
-- any other admins.type is treated as an end-user with read-only access).
-- =============================================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS `memo_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_memo_categories_slug` (`slug`),
  KEY `FK_memo_categories_created_by` (`created_by`),
  KEY `FK_memo_categories_updated_by` (`updated_by`),
  CONSTRAINT `FK_memo_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_memo_categories_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Documents
CREATE TABLE IF NOT EXISTS `memo_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `current_version_id` int DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `tags` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_memo_documents_title` (`title`),
  KEY `IDX_memo_documents_status` (`status`),
  KEY `FK_memo_documents_category` (`category_id`),
  KEY `FK_memo_documents_created_by` (`created_by`),
  KEY `FK_memo_documents_updated_by` (`updated_by`),
  CONSTRAINT `FK_memo_documents_category` FOREIGN KEY (`category_id`) REFERENCES `memo_categories` (`id`),
  CONSTRAINT `FK_memo_documents_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_memo_documents_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Document Versions
CREATE TABLE IF NOT EXISTS `memo_document_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `version_no` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(150) DEFAULT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `change_notes` text DEFAULT NULL,
  `is_current` tinyint NOT NULL DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_versions_document` (`document_id`),
  KEY `FK_memo_document_versions_uploaded_by` (`uploaded_by`),
  CONSTRAINT `FK_memo_document_versions_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_memo_document_versions_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Document Access Control
-- target_type ALL       -> target_value NULL
-- target_type USER_TYPE -> target_value = admins.type (e.g. 'hr_manager')
-- target_type USER      -> target_value = admins.id (as string)
CREATE TABLE IF NOT EXISTS `memo_document_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `target_type` enum('all','user_type','user') NOT NULL,
  `target_value` varchar(100) DEFAULT NULL,
  `granted_by` int DEFAULT NULL,
  `granted_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_access_lookup` (`document_id`,`target_type`,`target_value`),
  KEY `FK_memo_document_access_granted_by` (`granted_by`),
  CONSTRAINT `FK_memo_document_access_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_memo_document_access_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Document Views (audit trail of who opened the file)
CREATE TABLE IF NOT EXISTS `memo_document_views` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `version_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `viewed_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_document_views_doc_user` (`document_id`,`user_id`),
  KEY `IDX_memo_document_views_user` (`user_id`),
  KEY `IDX_memo_document_views_viewed_at` (`viewed_at`),
  CONSTRAINT `FK_memo_document_views_document` FOREIGN KEY (`document_id`) REFERENCES `memo_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_memo_document_views_user` FOREIGN KEY (`user_id`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Audit Log (admin actions: upload, publish, archive, access changes, etc.)
CREATE TABLE IF NOT EXISTS `memo_audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` int DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `entity_type` varchar(80) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `metadata_json` text DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_memo_audit_log_entity` (`entity_type`,`entity_id`),
  KEY `IDX_memo_audit_log_created_at` (`created_at`),
  KEY `FK_memo_audit_log_actor` (`actor_id`),
  CONSTRAINT `FK_memo_audit_log_actor` FOREIGN KEY (`actor_id`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Seed: sample categories
-- =============================================================================
INSERT IGNORE INTO `memo_categories` (`name`, `slug`, `description`, `status`)
VALUES
  ('General',          'general',          'General organizational memos',  1),
  ('HR',               'hr',               'HR-related memos and notices',  1),
  ('Operations',       'operations',       'Operations memos',              1),
  ('Finance',          'finance',          'Finance & accounting memos',    1),
  ('IT',               'it',               'IT notices and policies',       1);
