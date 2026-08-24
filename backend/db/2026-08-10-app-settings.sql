-- Runtime switches an admin can flip without a deploy.
-- First use: hide "Pay Now" until the CMI gateway is live.
--   mysql -u routefacile -p route_facile < db/2026-08-10-app-settings.sql

CREATE TABLE IF NOT EXISTS `app_settings` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `key_name`    VARCHAR(100) NOT NULL,
  `value`       VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_public`   TINYINT NOT NULL DEFAULT 1,
  `updated_by`  INT NULL,
  `created_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_app_settings_key` (`key_name`),
  KEY `idx_app_settings_updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pay Now OFF: CMI is not integrated yet, so customers only get "Pay Later".
INSERT INTO `app_settings` (`key_name`,`value`,`description`,`is_public`)
VALUES ('pay_now_enabled','0','Show the "Pay Now" option to customers. Keep off until the CMI payment gateway is live.',1)
ON DUPLICATE KEY UPDATE `description`=VALUES(`description`);
