-- ============================================================================
-- Allow bookings created by admin/counter staff in the admin panel
-- ============================================================================

ALTER TABLE `bookings`
  MODIFY COLUMN `booking_source` enum('web','mobile','api','broker','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web';
