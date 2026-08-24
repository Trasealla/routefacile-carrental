-- =============================================================
-- KYC officer admin accounts (May 2026 client roster v2)
--
-- Idempotent: re-runnable safely (ON DUPLICATE KEY UPDATE on email).
-- All accounts are created as kyc_officer with status=1.
-- must_reset_password = 1 forces a password change at first login.
--
-- Plain-text passwords (deliver via secure channel):
--
--   Lukman Hussain    lukman.hussain@autostrad.com    Lukman@Autostrad2026
--   Hatem Attaallah   hatem.attaallah@autostrad.com   Hatem@Autostrad2026
--   Osama Moharam     osama.moharam@autostrad.com     Osama@Autostrad2026
--   Wael Mohamed      wael.mohamed@autostrad.com      Wael@Autostrad2026
--   Naira Qutob       naira.qutob@autostrad.com       Naira@Autostrad2026
--   Kenneth Pinto     kenneth.pinto@autostrad.com     Kenneth@Autostrad2026
--   Joyce Titular     joyce.titular@autostrad.com     Joyce@Autostrad2026
--   Karunesh          karunesh@autostrad.com          Karunesh@Autostrad2026
--   Mohamed Reda      mohamed.reda@autostrad.com      Mohamed@Autostrad2026
--
-- Bcrypt cost = 10. If you change a password, regenerate the hash.
-- =============================================================

INSERT INTO `admins`
  (`first_name`,`last_name`,`email`,`password`,`type`,`country_code`,`phone_number`,`status`,`must_reset_password`,`created_at`,`updated_at`)
VALUES
  ('Lukman','Hussain','lukman.hussain@autostrad.com',
   '$2b$10$V5AI2YPM0HBUfad944BvYO5Keg9jAdPzJQURscNwAlasvtxokvvli',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Hatem','Attaallah','hatem.attaallah@autostrad.com',
   '$2b$10$eEI2oacVxCOfwjEbsrlAMOLFBrFETnZaPD0.IASkKcVTdpTvG2A3u',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Osama','Moharam','osama.moharam@autostrad.com',
   '$2b$10$6nTxD.nWHWA76A.PGyoz2uaGo0uADOUgqkDJLU2KZaw6Doq6PHKYy',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Wael','Mohamed','wael.mohamed@autostrad.com',
   '$2b$10$YrGalGHHICLi0sZzhGUF6eyLw.nBdaPdbSjKimUtdb5UerAbcfa8W',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Naira','Qutob','naira.qutob@autostrad.com',
   '$2b$10$tv1EPnE5HYBV246hXoCdk.zPXw.evqSZsAJSix8reZWuwqsaxRe6e',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Kenneth','Pinto','kenneth.pinto@autostrad.com',
   '$2b$10$gT3imli6ZO50kyo17YB7kO2FWOKrvbctE404JyjuJicb0vfyoqvuG',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Joyce','Titular','joyce.titular@autostrad.com',
   '$2b$10$tYpRyYVYzGt7ofU3EXuKbuzVJz6vXnoz/DSbAZP.IRflc8myd8jjS',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Karunesh','','karunesh@autostrad.com',
   '$2b$10$aPoThnRvAQpjC32Zivp3puFUuhvtJtgRg6wHVrZpiJD9Qxb0i7Kl.',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW()),
  ('Mohamed','Reda','mohamed.reda@autostrad.com',
   '$2b$10$6ZCB5ncFOrbz7wdirA3SPe3u.FgnUnfMxOl.hMHdat1zI4e5BERxu',
   'kyc_officer','+971','000000000',1,1,NOW(),NOW())
ON DUPLICATE KEY UPDATE
  `first_name`         = VALUES(`first_name`),
  `last_name`          = VALUES(`last_name`),
  `type`               = VALUES(`type`),
  `password`           = VALUES(`password`),
  `status`             = VALUES(`status`),
  `must_reset_password`= VALUES(`must_reset_password`),
  `updated_at`         = NOW();
