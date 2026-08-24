-- ============================================================
-- Migration: Create car_daily_specials table
-- Description: Allows cars to have special images for multiple emirates
--              When a car is viewed in a specific emirate, the special
--              image replaces the main car image
-- ============================================================

-- Create the junction table
CREATE TABLE IF NOT EXISTS `car_daily_specials` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `car_id` INT NOT NULL,
    `emirate_id` INT NOT NULL,
    `special_image` VARCHAR(255) NOT NULL COMMENT 'Image that replaces main car image for this emirate',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_car_emirate` (`car_id`, `emirate_id`),
    KEY `idx_car_id` (`car_id`),
    KEY `idx_emirate_id` (`emirate_id`),
    CONSTRAINT `fk_car_daily_specials_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_car_daily_specials_emirate` FOREIGN KEY (`emirate_id`) REFERENCES `emirates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Verify table was created
-- ============================================================
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'car_daily_specials'
ORDER BY ORDINAL_POSITION;

-- ============================================================
-- Example usage:
-- ============================================================
-- Car ID 5 has special images for Abu Dhabi (emirate_id=1) and Dubai (emirate_id=2)
-- INSERT INTO car_daily_specials (car_id, emirate_id, special_image) VALUES
-- (5, 1, 'special-abudhabi-20260115-123456.png'),
-- (5, 2, 'special-dubai-20260115-789012.png');
--
-- When user searches cars in Abu Dhabi:
-- - Car 5 will show 'special-abudhabi-20260115-123456.png' instead of main image
--
-- When user searches cars in Dubai:
-- - Car 5 will show 'special-dubai-20260115-789012.png' instead of main image
--
-- When user searches cars in Sharjah (no special):
-- - Car 5 will show the normal main image
-- ============================================================

