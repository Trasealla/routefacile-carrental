-- =============================================================
-- KYC officer admin accounts (May 2026 client roster)
--
-- Each row maps a real Autostrad accounts/credit team member to
-- the KYC portal as a kyc_officer. Idempotent: re-runnable safely.
--
-- Plain-text passwords (deliver via secure channel, force change
-- on first login -> must_reset_password = 1):
--
--   Lukman Hussain   lukman.hussain@autostrad.com   Lukman@Autostrad2026
--   Hatem Attaallah  hatem.attaallah@autostrad.com  Hatem@Autostrad2026
--   Osama Moharam    osama.moharam@autostrad.com    Osama@Autostrad2026
--   Wael Mohamed     wael.mohamed@autostrad.com     Wael@Autostrad2026
--   Naira Qutob      naira.qutob@autostrad.com      Naira@Autostrad2026
--
-- Bcrypt cost = 10. Regenerate hashes if you change a password.
-- =============================================================

INSERT INTO `admins`
  (`first_name`,`last_name`,`email`,`password`,`type`,`country_code`,`phone_number`,`status`,`must_reset_password`,`created_at`,`updated_at`)
VALUES
  ('Lukman','Hussain','lukman.hussain@autostrad.com',
   '$2b$10$w.q/xu8dl4aGZZZx/4Yeh.V8y7DgszxBEIycS.s2ADJvi/icqXi8q',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Hatem','Attaallah','hatem.attaallah@autostrad.com',
   '$2b$10$afkbKVA6k2elwq64mRD/VOMMI41yU4N7Io4vNbWR5oivwNObPJkN.',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Osama','Moharam','osama.moharam@autostrad.com',
   '$2b$10$lt9aWdkH/TenHUB36MaqrO2IB/ejJnfNvXKP8ZqmjsOd9ykxVWrcG',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Wael','Mohamed','wael.mohamed@autostrad.com',
   '$2b$10$gGHcHVdHHAhhJ0FoKJAExua8DS1mYhTimSypL6fGU3dIH7aBkn2G6',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Naira','Qutob','naira.qutob@autostrad.com',
   '$2b$10$Gw2A8up/4sPW5S3aV6BALuwoXrABy3Fy6AHQS.CH2LEaPyPf./NXC',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW())
ON DUPLICATE KEY UPDATE
  `first_name`         = VALUES(`first_name`),
  `last_name`          = VALUES(`last_name`),
  `type`               = VALUES(`type`),
  `password`           = VALUES(`password`),
  `status`             = VALUES(`status`),
  `must_reset_password`= VALUES(`must_reset_password`),
  `updated_at`         = NOW();
