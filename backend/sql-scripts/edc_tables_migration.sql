-- ============================================================================
-- DESCRIPTION: EDC (Emirates Driving Company) Database Migration
-- ============================================================================
-- PURPOSE: Creates database tables, views, and configuration for the EDC 
--          exclusive feature including member verification and enquiries.
--
-- CREATED: December 22, 2025
--
-- INCLUDES:
--   - edc_verifications table (member verification records)
--   - edc_enquiries table (enquiry submissions)
--   - edc_promo_config table (promo code configuration)
--   - edc_terms table (terms and conditions)
--   - EDCVIP2025 promo code setup for daily and monthly bookings
--   - Reporting views for statistics
--
-- NOTES: This is a complete migration script for the EDC feature integration.
-- ============================================================================

-- ============================================
-- Table: edc_verifications
-- Stores EDC member verification records
-- ============================================
CREATE TABLE IF NOT EXISTS `edc_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL COMMENT 'EDC Student/Staff ID',
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `member_type` enum('student','staff','instructor') NOT NULL DEFAULT 'student',
  `verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `promo_code` varchar(50) DEFAULT NULL,
  `discount_percentage` int(11) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `bookings_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of bookings made using EDC promo code',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `verified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_email` (`email`),
  KEY `idx_verification_status` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Table: edc_enquiries
-- Stores enquiries from EDC members
-- ============================================
CREATE TABLE IF NOT EXISTS `edc_enquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone_code` varchar(5) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `edc_student_id` varchar(255) DEFAULT NULL COMMENT 'EDC Student/Staff ID',
  `car_id` int(11) DEFAULT NULL,
  `emirate_id` int(11) NOT NULL,
  `duration` tinyint(4) NOT NULL COMMENT 'Duration in months',
  `email` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `promo_code` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `fk_edc_enquiry_car` (`car_id`),
  KEY `fk_edc_enquiry_emirate` (`emirate_id`),
  KEY `idx_edc_student_id` (`edc_student_id`),
  CONSTRAINT `fk_edc_enquiry_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_edc_enquiry_emirate` FOREIGN KEY (`emirate_id`) REFERENCES `emirates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Promo Code Configuration
-- Add EDCVIP2025 promo code to discount_coupons table
-- ============================================

-- For DAILY bookings
INSERT INTO `discount_coupons` (
  `type`,
  `discount_type`,
  `applicable_for`,
  `code`,
  `start_date`,
  `end_date`,
  `rate`,
  `cdw`,
  `scdw`,
  `pai`,
  `gps`,
  `baby_seat`,
  `driver`,
  `status`,
  `note`,
  `car_ids`,
  `emirate_ids`,
  `group_ids`,
  `location_ids`,
  `created_by`,
  `created_at`
) VALUES (
  'daily',
  'percentage',
  '["all"]',
  'EDCVIP2025',
  '2025-01-01',
  '2025-12-31',
  15.00,  -- 15% discount on rate
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  1,  -- Active
  'EDC (Emirates Driving Company) Exclusive Promo Code - Students and Staff',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  1,  -- admin user id (adjust as needed)
  NOW()
) ON DUPLICATE KEY UPDATE 
  `end_date` = '2025-12-31',
  `rate` = 15.00,
  `status` = 1;

-- For MONTHLY bookings
INSERT INTO `discount_coupons` (
  `type`,
  `discount_type`,
  `applicable_for`,
  `code`,
  `start_date`,
  `end_date`,
  `rate`,
  `cdw`,
  `scdw`,
  `pai`,
  `gps`,
  `baby_seat`,
  `driver`,
  `status`,
  `note`,
  `car_ids`,
  `emirate_ids`,
  `group_ids`,
  `location_ids`,
  `created_by`,
  `created_at`
) VALUES (
  'monthly',
  'percentage',
  '["all"]',
  'EDCVIP2025',
  '2025-01-01',
  '2025-12-31',
  15.00,  -- 15% discount on rate
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  1,  -- Active
  'EDC (Emirates Driving Company) Exclusive Promo Code - Students and Staff - Monthly',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  '{"all": true, "ids": []}',
  1,  -- admin user id (adjust as needed)
  NOW()
) ON DUPLICATE KEY UPDATE 
  `end_date` = '2025-12-31',
  `rate` = 15.00,
  `status` = 1;


-- ============================================
-- Reporting Views (Optional)
-- ============================================

-- View for EDC verification statistics
CREATE OR REPLACE VIEW `v_edc_verification_stats` AS
SELECT 
  member_type,
  verification_status,
  COUNT(*) as count,
  SUM(bookings_count) as total_bookings
FROM edc_verifications
GROUP BY member_type, verification_status;

-- View for EDC enquiries with details
CREATE OR REPLACE VIEW `v_edc_enquiries_detail` AS
SELECT 
  e.id,
  e.name,
  e.email,
  e.phone_code,
  e.phone_number,
  e.edc_student_id,
  c.name_en as car_name,
  em.name_en as emirate_name,
  e.duration,
  e.promo_code,
  e.details,
  e.created_at
FROM edc_enquiries e
LEFT JOIN cars c ON e.car_id = c.id
LEFT JOIN emirates em ON e.emirate_id = em.id
ORDER BY e.created_at DESC;


-- ============================================
-- Table: edc_promo_config
-- Stores the EDC promo configuration (managed by admin)
-- ============================================
CREATE TABLE IF NOT EXISTS `edc_promo_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `promo_code` varchar(50) NOT NULL DEFAULT 'EDCVIP2025',
  `discount_type` enum('percentage','fixed_amount') NOT NULL DEFAULT 'percentage',
  `discount_percentage` float(10,2) NOT NULL DEFAULT 15.00,
  `fixed_discount_amount` float(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `max_uses` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  `max_uses_per_user` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  `current_uses` int(11) NOT NULL DEFAULT 0,
  `min_rental_days` int(11) NOT NULL DEFAULT 1,
  `applicable_vehicles` json DEFAULT NULL,
  `description_en` varchar(500) DEFAULT NULL,
  `description_ar` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default promo config
INSERT INTO `edc_promo_config` (
  `promo_code`,
  `discount_type`,
  `discount_percentage`,
  `is_active`,
  `valid_from`,
  `valid_until`,
  `description_en`,
  `description_ar`,
  `applicable_vehicles`
) VALUES (
  'EDCVIP2025',
  'percentage',
  15.00,
  1,
  '2025-01-01 00:00:00',
  '2025-12-31 23:59:59',
  'Exclusive discount for Emirates Driving Company students and staff',
  'خصم حصري لأعضاء مؤسسة الإمارات للتعليم',
  '["all"]'
) ON DUPLICATE KEY UPDATE `id` = `id`;


-- ============================================
-- Table: edc_terms
-- Stores the EDC terms and conditions (managed by admin)
-- ============================================
CREATE TABLE IF NOT EXISTS `edc_terms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text_en` varchar(500) NOT NULL,
  `text_ar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default terms
INSERT INTO `edc_terms` (`text_en`, `text_ar`, `is_active`, `sort_order`) VALUES
('Valid EDC Student ID or Staff ID required', 'مطلوب بطاقة طالب أو موظف EDC صالحة', 1, 1),
('Offer valid for limited time', 'العرض صالح لفترة محدودة', 1, 2),
('Terms and conditions apply', 'تطبق الشروط والأحكام', 1, 3),
('Cannot be combined with other offers', 'لا يمكن دمجه مع عروض أخرى', 1, 4),
('Discount applies to base rental rate only', 'الخصم ينطبق على سعر الإيجار الأساسي فقط', 1, 5);


-- ============================================
-- Notes
-- ============================================
-- 1. The tables will be automatically created by TypeORM synchronize if enabled
-- 2. Run this script manually only if synchronize is disabled
-- 3. Adjust the discount percentage (rate field) as needed
-- 4. The promo code can be changed via admin panel at /api/admin/edc/promo
-- 5. Terms can be managed via admin panel at /api/admin/edc/terms

