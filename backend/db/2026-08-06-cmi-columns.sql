-- CMI (Morocco) payment integration — add per-attempt order id + approved callback payload.
-- DB_SYNCHRONIZE=false on this deployment, so run this manually against `route_facile`.
--   mysql -u routefacile -p route_facile < db/2026-08-06-cmi-columns.sql

ALTER TABLE `bookings`
  ADD COLUMN `cmi_oid` VARCHAR(191) NULL AFTER `payfort_response`,
  ADD COLUMN `cmi_response` JSON NULL AFTER `cmi_oid`;

-- Look up the booking from the CMI callback `oid` fast.
CREATE INDEX `idx_bookings_cmi_oid` ON `bookings` (`cmi_oid`);
