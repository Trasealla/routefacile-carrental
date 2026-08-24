-- ============================================================================
-- Broker API: create brokers table + add broker traceability to bookings
-- ============================================================================

CREATE TABLE `brokers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brokers_username` (`username`),
  KEY `FK_brokers_created_by` (`created_by`),
  KEY `FK_brokers_updated_by` (`updated_by`),
  KEY `FK_brokers_deleted_by` (`deleted_by`),
  CONSTRAINT `FK_brokers_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_brokers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`),
  CONSTRAINT `FK_brokers_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `bookings`
  MODIFY COLUMN `booking_source` enum('web','mobile','api','broker') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web';

ALTER TABLE `bookings`
  ADD COLUMN `broker_id` int DEFAULT NULL AFTER `booking_source`,
  ADD COLUMN `broker_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `broker_id`;

ALTER TABLE `bookings`
  ADD KEY `FK_bookings_broker_id` (`broker_id`),
  ADD CONSTRAINT `FK_bookings_broker_id` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`);
