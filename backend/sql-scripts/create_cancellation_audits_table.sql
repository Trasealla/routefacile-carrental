-- ============================================================================
-- DESCRIPTION: Create cancellation_audits table
-- ============================================================================
-- PURPOSE: Tracks every booking cancellation for daily-limit enforcement
--          and audit purposes.
--
-- CREATED: March 24, 2026
--
-- ISSUE: Mobile app shows "Table 'arc.cancellation_audits' doesn't exist"
--        when a user cancels a reservation. The entity exists in code but
--        the table was never created in the database.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `cancellation_audits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `uae_business_date` date NOT NULL COMMENT 'UAE business date (Asia/Dubai, UTC+4) at the time of cancellation',
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_uae_business_date` (`uae_business_date`),
  KEY `idx_user_date` (`user_id`, `uae_business_date`),
  CONSTRAINT `fk_cancellation_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cancellation_audit_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
