-- ============================================================================
-- DESCRIPTION: Create promo_tickers table for promotional scrolling banner
-- ============================================================================
-- PURPOSE: Store promotional ticker/banner items shown at the top of the website
-- These are the scrolling promotional messages like:
-- - "Premium Fleet Now Available - Book Now!"
-- - "15% Discount for New Customer Special"
-- - "20% Off on Special Offer on Monthly Rentals"
-- ============================================================================

CREATE TABLE IF NOT EXISTS `promo_tickers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text_en` VARCHAR(255) NOT NULL COMMENT 'English promotional text',
  `text_ae` VARCHAR(255) NOT NULL COMMENT 'Arabic promotional text',
  `description_en` TEXT NULL COMMENT 'Optional English description/details',
  `description_ae` TEXT NULL COMMENT 'Optional Arabic description/details',
  `link` VARCHAR(255) NULL COMMENT 'Optional link URL when clicked',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Display order (lower = first)',
  `start_date` DATE NOT NULL COMMENT 'Start date for the promotion',
  `end_date` DATE NOT NULL COMMENT 'End date for the promotion',
  `created_by` INT NOT NULL COMMENT 'Admin who created this',
  `updated_by` INT NULL COMMENT 'Admin who last updated this',
  `deleted_by` INT NULL COMMENT 'Admin who deleted this',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_status_dates` (`status`, `start_date`, `end_date`),
  INDEX `idx_sort_order` (`sort_order`),
  FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`),
  FOREIGN KEY (`updated_by`) REFERENCES `admins`(`id`),
  FOREIGN KEY (`deleted_by`) REFERENCES `admins`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Sample Data (uncomment to insert)
-- ============================================================================

-- INSERT INTO `promo_tickers` (`text_en`, `text_ae`, `description_en`, `description_ae`, `link`, `status`, `sort_order`, `start_date`, `end_date`, `created_by`) VALUES
-- ('Premium Fleet Now Available - Book Now!', 'أسطول فاخر متاح الآن - احجز الآن!', NULL, NULL, '/fleet', 1, 1, '2026-01-01', '2026-12-31', 1),
-- ('15% Discount for New Customer Special', 'خصم 15% للعملاء الجدد', 'Register today and get 15% off your first booking', 'سجل اليوم واحصل على خصم 15% على حجزك الأول', '/register', 1, 2, '2026-01-01', '2026-03-31', 1),
-- ('20% Off on Special Offer on Monthly Rentals', 'خصم 20% على عروض الإيجار الشهري', NULL, NULL, '/offers', 1, 3, '2026-01-01', '2026-02-28', 1),
-- ('Free Delivery on All Bookings This Month', 'توصيل مجاني لجميع الحجوزات هذا الشهر', NULL, NULL, NULL, 1, 4, '2026-01-01', '2026-01-31', 1);

-- ============================================================================
-- Useful Queries
-- ============================================================================

-- Get all active promos (currently valid)
-- SELECT * FROM promo_tickers 
-- WHERE status = 1 
--   AND deleted_at IS NULL 
--   AND start_date <= CURDATE() 
--   AND end_date >= CURDATE()
-- ORDER BY sort_order ASC;

