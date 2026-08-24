-- =============================================
-- Recruiting Module - Seed Data
-- Run AFTER create_recruiting_tables.sql
-- =============================================
-- NOTE: Adjust admin IDs (1, 2, 3) to match real admin IDs in your DB.
-- Run: SELECT id, first_name, last_name FROM admins LIMIT 10;
-- to find valid admin IDs before running this script.

SET @admin1 = 1;
SET @admin2 = 2;
SET @admin3 = 3;

-- =============================================
-- 1. RECRUITING DEPARTMENTS (12 departments)
-- =============================================
INSERT INTO `recruiting_departments` (`name_en`, `name_ae`, `description_en`, `description_ae`, `status`, `created_by`) VALUES
('Operations', 'العمليات', 'Manages day-to-day fleet operations and logistics', 'يدير العمليات اليومية للأسطول واللوجستيات', 1, @admin1),
('Customer Service', 'خدمة العملاء', 'Handles customer inquiries, complaints and support', 'يتعامل مع استفسارات العملاء والشكاوى والدعم', 1, @admin1),
('Finance & Accounting', 'المالية والمحاسبة', 'Financial planning, budgeting and accounting', 'التخطيط المالي والميزانية والمحاسبة', 1, @admin1),
('Human Resources', 'الموارد البشرية', 'Recruitment, employee relations and HR management', 'التوظيف وعلاقات الموظفين وإدارة الموارد البشرية', 1, @admin1),
('Marketing', 'التسويق', 'Brand management, advertising and digital marketing', 'إدارة العلامة التجارية والإعلان والتسويق الرقمي', 1, @admin1),
('IT & Technology', 'تكنولوجيا المعلومات', 'Software development, infrastructure and tech support', 'تطوير البرمجيات والبنية التحتية والدعم التقني', 1, @admin1),
('Fleet Management', 'إدارة الأسطول', 'Vehicle procurement, maintenance and disposal', 'شراء المركبات والصيانة والتخلص منها', 1, @admin1),
('Sales', 'المبيعات', 'Corporate sales, partnerships and revenue growth', 'المبيعات المؤسسية والشراكات ونمو الإيرادات', 1, @admin1),
('Legal & Compliance', 'القانونية والامتثال', 'Legal affairs, contracts and regulatory compliance', 'الشؤون القانونية والعقود والامتثال التنظيمي', 1, @admin1),
('Administration', 'الإدارة', 'Office management and administrative support', 'إدارة المكاتب والدعم الإداري', 1, @admin1),
('Quality Assurance', 'ضمان الجودة', 'Service quality monitoring and improvement', 'مراقبة جودة الخدمة والتحسين', 1, @admin1),
('Training & Development', 'التدريب والتطوير', 'Employee training programs and skill development', 'برامج تدريب الموظفين وتطوير المهارات', 1, @admin1);


-- =============================================
-- 2. CAREER JOBS (20 job postings)
-- =============================================
INSERT INTO `career_jobs` (`title_en`, `title_ae`, `description_en`, `description_ae`, `expiry_date`, `location_en`, `location_ae`, `experience_years`, `status`, `created_by`) VALUES
('Senior Software Engineer', 'مهندس برمجيات أول', 'Design and develop backend systems for our booking platform using NestJS and TypeORM.', 'تصميم وتطوير أنظمة الخلفية لمنصة الحجز باستخدام NestJS و TypeORM.', '2026-06-30', 'Muscat, Oman', 'مسقط، عمان', 5, 1, @admin1),
('Customer Service Representative', 'ممثل خدمة العملاء', 'Handle customer inquiries via phone, email and live chat with professionalism.', 'التعامل مع استفسارات العملاء عبر الهاتف والبريد الإلكتروني والدردشة المباشرة.', '2026-07-15', 'Muscat, Oman', 'مسقط، عمان', 1, 1, @admin1),
('Fleet Manager', 'مدير الأسطول', 'Oversee vehicle procurement, maintenance schedules and fleet optimization.', 'الإشراف على شراء المركبات وجداول الصيانة وتحسين الأسطول.', '2026-08-01', 'Muscat, Oman', 'مسقط، عمان', 7, 1, @admin1),
('Digital Marketing Specialist', 'أخصائي تسويق رقمي', 'Plan and execute digital marketing campaigns across social media and search engines.', 'تخطيط وتنفيذ حملات التسويق الرقمي عبر وسائل التواصل الاجتماعي ومحركات البحث.', '2026-06-15', 'Muscat, Oman', 'مسقط، عمان', 3, 1, @admin1),
('Accountant', 'محاسب', 'Manage financial records, prepare reports and handle reconciliation.', 'إدارة السجلات المالية وإعداد التقارير ومعالجة المطابقة.', '2026-07-30', 'Muscat, Oman', 'مسقط، عمان', 3, 1, @admin1),
('HR Coordinator', 'منسق موارد بشرية', 'Support recruitment processes, onboarding and employee engagement activities.', 'دعم عمليات التوظيف والتعريف وأنشطة مشاركة الموظفين.', '2026-08-15', 'Muscat, Oman', 'مسقط، عمان', 2, 1, @admin1),
('Counter Staff', 'موظف كاونتر', 'Assist customers at rental counters with vehicle handover and documentation.', 'مساعدة العملاء في كاونترات التأجير مع تسليم المركبات والتوثيق.', '2026-09-01', 'Salalah, Oman', 'صلالة، عمان', 1, 1, @admin1),
('IT Support Technician', 'فني دعم تقني', 'Provide technical support for hardware, software and network issues.', 'تقديم الدعم التقني لمشاكل الأجهزة والبرمجيات والشبكات.', '2026-07-01', 'Muscat, Oman', 'مسقط، عمان', 2, 1, @admin1),
('Sales Executive', 'مدير مبيعات', 'Drive corporate sales and build long-term partnerships with businesses.', 'قيادة المبيعات المؤسسية وبناء شراكات طويلة الأمد مع الشركات.', '2026-08-30', 'Muscat, Oman', 'مسقط، عمان', 4, 1, @admin1),
('Operations Supervisor', 'مشرف عمليات', 'Supervise daily rental operations ensuring service quality and efficiency.', 'الإشراف على العمليات اليومية للتأجير لضمان جودة الخدمة والكفاءة.', '2026-07-15', 'Muscat, Oman', 'مسقط، عمان', 5, 1, @admin1),
('Legal Advisor', 'مستشار قانوني', 'Provide legal consultation on contracts, regulations and disputes.', 'تقديم الاستشارات القانونية بشأن العقود واللوائح والنزاعات.', '2026-09-15', 'Muscat, Oman', 'مسقط، عمان', 6, 1, @admin1),
('Quality Inspector', 'مفتش جودة', 'Inspect vehicles and service quality; report and track improvements.', 'فحص المركبات وجودة الخدمة؛ الإبلاغ وتتبع التحسينات.', '2026-08-01', 'Muscat, Oman', 'مسقط، عمان', 3, 1, @admin1),
('Training Officer', 'مسؤول تدريب', 'Design and deliver staff training programs on customer service and safety.', 'تصميم وتقديم برامج تدريب الموظفين على خدمة العملاء والسلامة.', '2026-07-20', 'Muscat, Oman', 'مسقط، عمان', 4, 1, @admin1),
('Senior Accountant', 'محاسب أول', 'Lead financial reporting, audits and tax compliance processes.', 'قيادة التقارير المالية والتدقيق وعمليات الامتثال الضريبي.', '2026-09-30', 'Muscat, Oman', 'مسقط، عمان', 6, 1, @admin1),
('Mobile App Developer', 'مطور تطبيقات الجوال', 'Develop and maintain mobile applications for iOS and Android platforms.', 'تطوير وصيانة تطبيقات الجوال لمنصات iOS و Android.', '2026-08-15', 'Muscat, Oman', 'مسقط، عمان', 3, 1, @admin1),
('Counter Staff - Airport', 'موظف كاونتر - المطار', 'Serve customers at airport rental desks with rapid vehicle handover.', 'خدمة العملاء في مكاتب تأجير المطار مع تسليم سريع للمركبات.', '2026-10-01', 'Muscat Airport', 'مطار مسقط', 1, 1, @admin1),
('Procurement Officer', 'مسؤول مشتريات', 'Source and procure vehicles, parts and services at best value.', 'البحث عن وشراء المركبات والقطع والخدمات بأفضل قيمة.', '2026-08-20', 'Muscat, Oman', 'مسقط، عمان', 4, 1, @admin1),
('Business Analyst', 'محلل أعمال', 'Analyze business processes and recommend system improvements.', 'تحليل العمليات التجارية واقتراح تحسينات للأنظمة.', '2026-07-31', 'Muscat, Oman', 'مسقط، عمان', 3, 1, @admin1),
('Admin Assistant', 'مساعد إداري', 'Provide administrative support including scheduling, filing and correspondence.', 'تقديم الدعم الإداري بما في ذلك الجدولة والأرشفة والمراسلات.', '2026-09-15', 'Muscat, Oman', 'مسقط، عمان', 1, 1, @admin1),
('Network Engineer', 'مهندس شبكات', 'Design, implement and maintain network infrastructure and security.', 'تصميم وتنفيذ وصيانة البنية التحتية للشبكات والأمان.', '2026-08-30', 'Muscat, Oman', 'مسقط، عمان', 4, 1, @admin1);


-- =============================================
-- 3. CAREER JOB APPLICATIONS (50 applicants)
-- =============================================
-- We reference career_job_id from the jobs above. Adjust IDs if needed.
-- Assumes career_jobs auto-increment starts fresh or you know the IDs.

SET @job_start = (SELECT MIN(id) FROM career_jobs ORDER BY id DESC LIMIT 20);

INSERT INTO `career_job_applications` (`first_name`, `last_name`, `phone_code`, `phone_number`, `email`, `cv`, `career_job_id`, `status`, `admin_notes`, `reviewed_by`) VALUES
-- Job 1: Senior Software Engineer
('Ahmed', 'Al-Balushi', '+971', '91234567', 'ahmed.balushi@email.com', 'uploads/cv_ahmed_balushi.pdf', @job_start, 3, 'Strong NestJS background. Passed technical interview.', @admin1),
('Sara', 'Al-Hinai', '+971', '92345678', 'sara.hinai@email.com', 'uploads/cv_sara_hinai.pdf', @job_start, 2, 'Good portfolio. Shortlisted for interview.', @admin1),
('Mohammed', 'Al-Rawahi', '+971', '93456789', 'mohammed.rawahi@email.com', 'uploads/cv_mohammed_rawahi.pdf', @job_start, 4, 'Not enough experience with TypeORM.', @admin1),
('Fatima', 'Al-Siyabi', '+971', '94567890', 'fatima.siyabi@email.com', 'uploads/cv_fatima_siyabi.pdf', @job_start, 1, 'Resume under review.', @admin2),
('Khalid', 'Al-Kindi', '+971', '95678901', 'khalid.kindi@email.com', 'uploads/cv_khalid_kindi.pdf', @job_start, 0, NULL, NULL),

-- Job 2: Customer Service Representative
('Aisha', 'Al-Busaidi', '+971', '91112233', 'aisha.busaidi@email.com', 'uploads/cv_aisha_busaidi.pdf', @job_start+1, 5, 'Excellent communication skills. Hired!', @admin1),
('Hassan', 'Al-Lawati', '+971', '92223344', 'hassan.lawati@email.com', 'uploads/cv_hassan_lawati.pdf', @job_start+1, 3, 'Interviewed. Good candidate.', @admin2),
('Maryam', 'Al-Riyami', '+971', '93334455', 'maryam.riyami@email.com', 'uploads/cv_maryam_riyami.pdf', @job_start+1, 2, 'Shortlisted. Previous call center experience.', @admin2),
('Salim', 'Al-Habsi', '+971', '94445566', 'salim.habsi@email.com', 'uploads/cv_salim_habsi.pdf', @job_start+1, 4, 'Did not meet language requirements.', @admin1),
('Layla', 'Al-Mamari', '+971', '95556677', 'layla.mamari@email.com', 'uploads/cv_layla_mamari.pdf', @job_start+1, 0, NULL, NULL),

-- Job 3: Fleet Manager
('Nasser', 'Al-Rashdi', '+971', '96001122', 'nasser.rashdi@email.com', 'uploads/cv_nasser_rashdi.pdf', @job_start+2, 5, '10+ years fleet experience. Hired.', @admin1),
('Yusuf', 'Al-Zadjali', '+971', '96112233', 'yusuf.zadjali@email.com', 'uploads/cv_yusuf_zadjali.pdf', @job_start+2, 3, 'Good interview. Awaiting final decision.', @admin1),
('Huda', 'Al-Wahaibi', '+971', '96223344', 'huda.wahaibi@email.com', 'uploads/cv_huda_wahaibi.pdf', @job_start+2, 4, 'Lacks required certifications.', @admin2),

-- Job 4: Digital Marketing Specialist
('Omar', 'Al-Saadi', '+971', '97001122', 'omar.saadi@email.com', 'uploads/cv_omar_saadi.pdf', @job_start+3, 2, 'Strong social media portfolio. Shortlisted.', @admin2),
('Zahra', 'Al-Farsi', '+971', '97112233', 'zahra.farsi@email.com', 'uploads/cv_zahra_farsi.pdf', @job_start+3, 3, 'Completed interview. Impressive Google Ads experience.', @admin1),
('Tariq', 'Al-Maskari', '+971', '97223344', 'tariq.maskari@email.com', 'uploads/cv_tariq_maskari.pdf', @job_start+3, 0, NULL, NULL),
('Noura', 'Al-Tobi', '+971', '97334455', 'noura.tobi@email.com', 'uploads/cv_noura_tobi.pdf', @job_start+3, 1, 'CV looks promising. Under review.', @admin2),

-- Job 5: Accountant
('Suleiman', 'Al-Shanfari', '+971', '98001122', 'suleiman.shanfari@email.com', 'uploads/cv_suleiman_shanfari.pdf', @job_start+4, 5, 'CPA certified. Hired immediately.', @admin1),
('Reem', 'Al-Ghafri', '+971', '98112233', 'reem.ghafri@email.com', 'uploads/cv_reem_ghafri.pdf', @job_start+4, 2, 'SAP experience. Shortlisted.', @admin1),
('Badr', 'Al-Kalbani', '+971', '98223344', 'badr.kalbani@email.com', 'uploads/cv_badr_kalbani.pdf', @job_start+4, 4, 'No relevant accounting degree.', @admin2),

-- Job 6: HR Coordinator
('Amna', 'Al-Hashmi', '+971', '91001100', 'amna.hashmi@email.com', 'uploads/cv_amna_hashmi.pdf', @job_start+5, 3, 'Good HR background. Interview completed.', @admin1),
('Majid', 'Al-Alawi', '+971', '91002200', 'majid.alawi@email.com', 'uploads/cv_majid_alawi.pdf', @job_start+5, 2, 'CIPD certified. Under consideration.', @admin2),

-- Job 7: Counter Staff (Salalah)
('Hamza', 'Al-Badi', '+971', '91003300', 'hamza.badi@email.com', 'uploads/cv_hamza_badi.pdf', @job_start+6, 5, 'Great personality. Hired for Salalah branch.', @admin1),
('Suad', 'Al-Maskari', '+971', '91004400', 'suad.maskari@email.com', 'uploads/cv_suad_maskari.pdf', @job_start+6, 3, 'Interview done. Positive feedback.', @admin2),
('Ali', 'Al-Jabri', '+971', '91005500', 'ali.jabri@email.com', 'uploads/cv_ali_jabri.pdf', @job_start+6, 0, NULL, NULL),

-- Job 8: IT Support Technician
('Maha', 'Al-Harthi', '+971', '91006600', 'maha.harthi@email.com', 'uploads/cv_maha_harthi.pdf', @job_start+7, 2, 'CompTIA certified. Shortlisted.', @admin1),
('Rashid', 'Al-Muqbali', '+971', '91007700', 'rashid.muqbali@email.com', 'uploads/cv_rashid_muqbali.pdf', @job_start+7, 1, 'Reviewing technical assessment results.', @admin2),
('Asma', 'Al-Zedjali', '+971', '91008800', 'asma.zedjali@email.com', 'uploads/cv_asma_zedjali.pdf', @job_start+7, 4, 'Failed technical assessment.', @admin1),

-- Job 9: Sales Executive
('Ibrahim', 'Al-Wahaibi', '+971', '92001100', 'ibrahim.wahaibi@email.com', 'uploads/cv_ibrahim_wahaibi.pdf', @job_start+8, 3, 'Strong sales background. Interviewed.', @admin1),
('Samia', 'Al-Riyami', '+971', '92002200', 'samia.riyami@email.com', 'uploads/cv_samia_riyami.pdf', @job_start+8, 5, 'B2B experience. Hired!', @admin1),
('Waleed', 'Al-Balushi', '+971', '92003300', 'waleed.balushi@email.com', 'uploads/cv_waleed_balushi.pdf', @job_start+8, 0, NULL, NULL),

-- Job 10: Operations Supervisor
('Salma', 'Al-Kindi', '+971', '92004400', 'salma.kindi@email.com', 'uploads/cv_salma_kindi.pdf', @job_start+9, 3, 'Operations experience at Hertz. Interviewed.', @admin1),
('Fahad', 'Al-Busaidi', '+971', '92005500', 'fahad.busaidi@email.com', 'uploads/cv_fahad_busaidi.pdf', @job_start+9, 2, 'Shortlisted. 6 years rental industry.', @admin2),

-- Job 11: Legal Advisor
('Dalal', 'Al-Kindy', '+971', '93001100', 'dalal.kindy@email.com', 'uploads/cv_dalal_kindy.pdf', @job_start+10, 2, 'Bar association member. Shortlisted.', @admin1),
('Nassir', 'Al-Hinai', '+971', '93002200', 'nassir.hinai@email.com', 'uploads/cv_nassir_hinai.pdf', @job_start+10, 1, 'Reviewing credentials.', @admin2),

-- Job 12: Quality Inspector
('Hanan', 'Al-Lawati', '+971', '93003300', 'hanan.lawati@email.com', 'uploads/cv_hanan_lawati.pdf', @job_start+11, 3, 'ISO 9001 auditor. Great interview.', @admin1),
('Saeed', 'Al-Habsi', '+971', '93004400', 'saeed.habsi@email.com', 'uploads/cv_saeed_habsi.pdf', @job_start+11, 0, NULL, NULL),

-- Job 14: Senior Accountant
('Thuraya', 'Al-Ghafri', '+971', '93005500', 'thuraya.ghafri@email.com', 'uploads/cv_thuraya_ghafri.pdf', @job_start+13, 2, 'ACCA qualified. Under consideration.', @admin1),

-- Job 15: Mobile App Developer
('Yaqoob', 'Al-Farsi', '+971', '94001100', 'yaqoob.farsi@email.com', 'uploads/cv_yaqoob_farsi.pdf', @job_start+14, 3, 'Flutter expert. Completed coding test.', @admin1),
('Lubna', 'Al-Rashdi', '+971', '94002200', 'lubna.rashdi@email.com', 'uploads/cv_lubna_rashdi.pdf', @job_start+14, 2, 'React Native experience. Shortlisted.', @admin2),
('Mazin', 'Al-Saadi', '+971', '94003300', 'mazin.saadi@email.com', 'uploads/cv_mazin_saadi.pdf', @job_start+14, 4, 'No mobile development experience.', @admin1),

-- Job 16: Counter Staff - Airport
('Khadija', 'Al-Alawi', '+971', '94004400', 'khadija.alawi@email.com', 'uploads/cv_khadija_alawi.pdf', @job_start+15, 5, 'Airport experience at Avis. Hired.', @admin1),
('Hilal', 'Al-Tobi', '+971', '94005500', 'hilal.tobi@email.com', 'uploads/cv_hilal_tobi.pdf', @job_start+15, 0, NULL, NULL),

-- Job 18: Business Analyst
('Ruqaiya', 'Al-Badi', '+971', '95001100', 'ruqaiya.badi@email.com', 'uploads/cv_ruqaiya_badi.pdf', @job_start+17, 3, 'CBAP certified. Strong analytical interview.', @admin1),
('Anwar', 'Al-Maskari', '+971', '95002200', 'anwar.maskari@email.com', 'uploads/cv_anwar_maskari.pdf', @job_start+17, 1, 'CV under review. Looks solid.', @admin2),

-- Job 19: Admin Assistant
('Safiya', 'Al-Jabri', '+971', '95003300', 'safiya.jabri@email.com', 'uploads/cv_safiya_jabri.pdf', @job_start+18, 5, 'Efficient. Immediate start. Hired.', @admin1),
('Nabil', 'Al-Harthi', '+971', '95004400', 'nabil.harthi@email.com', 'uploads/cv_nabil_harthi.pdf', @job_start+18, 2, 'Shortlisted. Good organizational skills.', @admin2),

-- Job 20: Network Engineer
('Hajar', 'Al-Muqbali', '+971', '95005500', 'hajar.muqbali@email.com', 'uploads/cv_hajar_muqbali.pdf', @job_start+19, 3, 'CCNP certified. Great interview.', @admin1),
('Faisal', 'Al-Zedjali', '+971', '95006600', 'faisal.zedjali@email.com', 'uploads/cv_faisal_zedjali.pdf', @job_start+19, 0, NULL, NULL);


-- =============================================
-- 4. RECRUITING INTERVIEWS (35 interviews)
-- =============================================
-- Reference application IDs. Assumes the 50 applications above start at a known ID.
-- Adjust @app_start if needed.

SET @app_start = (SELECT MIN(id) FROM career_job_applications WHERE email = 'ahmed.balushi@email.com');

INSERT INTO `recruiting_interviews` (`interview_date`, `location`, `interview_type`, `notes`, `status`, `feedback`, `rating`, `application_id`, `interviewer_id`, `created_by`) VALUES
-- Ahmed Al-Balushi (Senior Software Engineer) - 2 interviews
('2026-03-10 10:00:00', 'HQ Meeting Room A', 'in-person', 'Technical interview - Backend focus', 1, 'Excellent NestJS and TypeORM knowledge. Strong problem solving.', 5, @app_start, @admin1, @admin1),
('2026-03-15 14:00:00', 'HQ Meeting Room B', 'in-person', 'Final round with CTO', 1, 'Impressive system design skills. Cultural fit.', 4, @app_start, @admin2, @admin1),

-- Sara Al-Hinai (shortlisted)
('2026-04-20 09:00:00', 'HQ Meeting Room A', 'in-person', 'Technical screening', 0, NULL, NULL, @app_start+1, @admin1, @admin1),

-- Mohammed Al-Rawahi (rejected)
('2026-03-05 11:00:00', 'Zoom', 'video', 'Initial screening call', 1, 'Lacks TypeORM experience. Not a good fit.', 2, @app_start+2, @admin2, @admin1),

-- Aisha Al-Busaidi (hired - CS Rep)
('2026-02-20 09:30:00', 'HQ Counter Area', 'in-person', 'Customer service role play', 1, 'Outstanding communication. Fluent in 3 languages.', 5, @app_start+5, @admin1, @admin1),
('2026-02-25 10:00:00', 'HQ Meeting Room C', 'in-person', 'Final interview with Operations Manager', 1, 'Perfect fit for the role. Recommended for hire.', 5, @app_start+5, @admin2, @admin1),

-- Hassan Al-Lawati (interviewed - CS Rep)
('2026-03-12 13:00:00', 'Zoom', 'video', 'Initial video screening', 1, 'Good communicator but limited experience.', 3, @app_start+6, @admin2, @admin2),

-- Nasser Al-Rashdi (hired - Fleet Manager)
('2026-02-10 10:00:00', 'HQ Director Office', 'in-person', 'Fleet management deep-dive', 1, 'Extensive fleet knowledge. 10 years experience.', 5, @app_start+10, @admin1, @admin1),
('2026-02-15 14:00:00', 'HQ Director Office', 'in-person', 'Panel interview with management', 1, 'Unanimous approval. Excellent leadership.', 5, @app_start+10, @admin2, @admin1),

-- Yusuf Al-Zadjali (interviewed - Fleet Manager)
('2026-03-20 11:00:00', 'HQ Meeting Room B', 'in-person', 'Technical fleet assessment', 1, 'Good knowledge but less leadership experience.', 3, @app_start+11, @admin1, @admin1),

-- Zahra Al-Farsi (interviewed - Digital Marketing)
('2026-03-08 10:00:00', 'Zoom', 'video', 'Portfolio review and marketing case study', 1, 'Impressive Google Ads and SEO track record.', 4, @app_start+14, @admin2, @admin2),

-- Suleiman Al-Shanfari (hired - Accountant)
('2026-02-28 09:00:00', 'HQ Finance Office', 'in-person', 'Technical accounting assessment', 1, 'CPA certified. Flawless assessment results.', 5, @app_start+17, @admin1, @admin1),

-- Amna Al-Hashmi (interviewed - HR Coordinator)
('2026-03-18 14:00:00', 'HQ Meeting Room A', 'in-person', 'HR competency interview', 1, 'Good understanding of HR processes. CIPD pursuing.', 4, @app_start+20, @admin1, @admin1),

-- Hamza Al-Badi (hired - Counter Staff Salalah)
('2026-02-05 10:00:00', 'Phone', 'phone', 'Initial phone screening', 1, 'Energetic and customer-focused.', 4, @app_start+22, @admin2, @admin2),
('2026-02-10 09:00:00', 'Salalah Branch', 'in-person', 'On-site counter simulation', 1, 'Great with customers. Fast learner.', 4, @app_start+22, @admin1, @admin1),

-- Suad Al-Maskari (interviewed - Counter Staff Salalah)
('2026-03-25 11:00:00', 'Phone', 'phone', 'Phone screening', 1, 'Decent phone manner. Scheduling in-person.', 3, @app_start+23, @admin2, @admin2),

-- Ibrahim Al-Wahaibi (interviewed - Sales Executive)
('2026-03-22 10:00:00', 'HQ Meeting Room B', 'in-person', 'Sales pitch presentation', 1, 'Strong B2B sales background. Good closer.', 4, @app_start+28, @admin1, @admin1),

-- Samia Al-Riyami (hired - Sales Executive)
('2026-02-18 09:00:00', 'HQ Meeting Room A', 'in-person', 'Sales competency interview', 1, 'Exceptional B2B track record. Target exceeded 3 years.', 5, @app_start+29, @admin1, @admin1),
('2026-02-22 14:00:00', 'HQ Director Office', 'in-person', 'Final interview with Sales Director', 1, 'Highly recommended. Immediate hire.', 5, @app_start+29, @admin2, @admin1),

-- Salma Al-Kindi (interviewed - Ops Supervisor)
('2026-03-28 10:00:00', 'HQ Operations Center', 'in-person', 'Operations scenario assessment', 1, 'Hertz background is valuable. Good problem solver.', 4, @app_start+31, @admin1, @admin1),

-- Hanan Al-Lawati (interviewed - Quality Inspector)
('2026-03-15 09:00:00', 'HQ Meeting Room C', 'in-person', 'Quality management case study', 1, 'ISO 9001 auditor. Thorough and detail-oriented.', 5, @app_start+36, @admin1, @admin1),

-- Yaqoob Al-Farsi (interviewed - Mobile App Developer)
('2026-03-25 10:00:00', 'Zoom', 'video', 'Coding test review + Flutter discussion', 1, 'Excellent Flutter skills. Published 3 apps on stores.', 4, @app_start+39, @admin1, @admin1),

-- Khadija Al-Alawi (hired - Counter Staff Airport)
('2026-02-12 08:00:00', 'Muscat Airport Office', 'in-person', 'Airport counter simulation', 1, 'Previous Avis experience. Handles pressure well.', 5, @app_start+42, @admin2, @admin2),
('2026-02-16 10:00:00', 'HQ Meeting Room A', 'in-person', 'Final interview', 1, 'Perfect airport candidate. Multilingual.', 5, @app_start+42, @admin1, @admin1),

-- Ruqaiya Al-Badi (interviewed - Business Analyst)
('2026-03-30 14:00:00', 'Zoom', 'video', 'BA case study and requirements gathering exercise', 1, 'CBAP certified. Excellent requirements documentation.', 4, @app_start+44, @admin1, @admin1),

-- Safiya Al-Jabri (hired - Admin Assistant)
('2026-02-08 09:00:00', 'HQ Admin Office', 'in-person', 'Administrative skills assessment', 1, 'Quick typist. Organized and proactive.', 4, @app_start+46, @admin2, @admin2),

-- Hajar Al-Muqbali (interviewed - Network Engineer)
('2026-03-20 10:00:00', 'HQ IT Room', 'in-person', 'Network troubleshooting assessment', 1, 'CCNP certified. Solved complex scenarios efficiently.', 5, @app_start+48, @admin1, @admin1),

-- UPCOMING / SCHEDULED interviews
('2026-04-15 10:00:00', 'HQ Meeting Room A', 'in-person', 'Technical assessment - round 2', 0, NULL, NULL, @app_start+1, @admin1, @admin1),
('2026-04-16 14:00:00', 'Zoom', 'video', 'Marketing strategy presentation', 0, NULL, NULL, @app_start+13, @admin2, @admin2),
('2026-04-17 09:00:00', 'HQ Meeting Room B', 'in-person', 'Second round HR interview', 0, NULL, NULL, @app_start+21, @admin1, @admin1),
('2026-04-18 11:00:00', 'HQ IT Room', 'in-person', 'Hands-on IT support test', 0, NULL, NULL, @app_start+25, @admin2, @admin2),
('2026-04-18 14:00:00', 'HQ Meeting Room C', 'in-person', 'Legal case study discussion', 0, NULL, NULL, @app_start+34, @admin1, @admin1),
('2026-04-20 10:00:00', 'HQ Meeting Room A', 'in-person', 'Final interview - Operations Supervisor', 0, NULL, NULL, @app_start+32, @admin1, @admin1),
('2026-04-22 09:00:00', 'Zoom', 'video', 'Senior Accountant technical round', 0, NULL, NULL, @app_start+38, @admin2, @admin2);


-- =============================================
-- 5. RECRUITING STATUS HISTORY (65 records)
-- =============================================
INSERT INTO `recruiting_status_history` (`from_status`, `to_status`, `notes`, `application_id`, `changed_by`) VALUES
-- Ahmed Al-Balushi: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Started reviewing application.', @app_start, @admin1),
(1, 2, 'Strong technical background. Moving to shortlist.', @app_start, @admin1),
(2, 3, 'Completed both interview rounds.', @app_start, @admin1),

-- Sara Al-Hinai: Pending → Reviewing → Shortlisted
(0, 1, 'Application received and being reviewed.', @app_start+1, @admin1),
(1, 2, 'Good portfolio. Shortlisted for technical interview.', @app_start+1, @admin1),

-- Mohammed Al-Rawahi: Pending → Reviewing → Shortlisted → Interviewed → Rejected
(0, 1, 'Reviewing application.', @app_start+2, @admin1),
(1, 2, 'Initial review passed.', @app_start+2, @admin1),
(2, 3, 'Video interview completed.', @app_start+2, @admin2),
(3, 4, 'Not enough TypeORM experience. Rejected.', @app_start+2, @admin1),

-- Fatima Al-Siyabi: Pending → Reviewing
(0, 1, 'Started review process.', @app_start+3, @admin2),

-- Aisha Al-Busaidi: Pending → Reviewing → Shortlisted → Interviewed → Hired
(0, 1, 'Application looks promising.', @app_start+5, @admin1),
(1, 2, 'Shortlisted for role play assessment.', @app_start+5, @admin1),
(2, 3, 'Both interviews completed with flying colors.', @app_start+5, @admin2),
(3, 5, 'Hired! Excellent candidate.', @app_start+5, @admin1),

-- Hassan Al-Lawati: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Reviewing CV.', @app_start+6, @admin2),
(1, 2, 'Moved to shortlist.', @app_start+6, @admin2),
(2, 3, 'Video interview completed.', @app_start+6, @admin2),

-- Maryam Al-Riyami: Pending → Reviewing → Shortlisted
(0, 1, 'Under review.', @app_start+7, @admin2),
(1, 2, 'Call center experience noted. Shortlisted.', @app_start+7, @admin2),

-- Salim Al-Habsi: Pending → Reviewing → Rejected
(0, 1, 'Reviewing application.', @app_start+8, @admin1),
(1, 4, 'Language requirements not met. Rejected.', @app_start+8, @admin1),

-- Nasser Al-Rashdi: Pending → Reviewing → Shortlisted → Interviewed → Hired
(0, 1, 'Impressive fleet management background.', @app_start+10, @admin1),
(1, 2, 'Shortlisted for in-depth assessment.', @app_start+10, @admin1),
(2, 3, 'Panel interview completed.', @app_start+10, @admin1),
(3, 5, 'Hired as Fleet Manager. Unanimous approval.', @app_start+10, @admin1),

-- Yusuf Al-Zadjali: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Application under review.', @app_start+11, @admin1),
(1, 2, 'Relevant fleet experience. Shortlisted.', @app_start+11, @admin1),
(2, 3, 'Interview completed.', @app_start+11, @admin1),

-- Huda Al-Wahaibi: Pending → Reviewing → Rejected
(0, 1, 'Reviewing credentials.', @app_start+12, @admin2),
(1, 4, 'Missing required certifications. Rejected.', @app_start+12, @admin2),

-- Omar Al-Saadi: Pending → Reviewing → Shortlisted
(0, 1, 'Digital marketing CV under review.', @app_start+13, @admin2),
(1, 2, 'Strong social media portfolio. Shortlisted.', @app_start+13, @admin2),

-- Zahra Al-Farsi: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Reviewing marketing experience.', @app_start+14, @admin1),
(1, 2, 'Google Ads certified. Shortlisted.', @app_start+14, @admin1),
(2, 3, 'Portfolio review completed. Impressive.', @app_start+14, @admin2),

-- Noura Al-Tobi: Pending → Reviewing
(0, 1, 'CV looks promising. Started review.', @app_start+16, @admin2),

-- Suleiman Al-Shanfari: Full pipeline → Hired
(0, 1, 'CPA certification verified.', @app_start+17, @admin1),
(1, 2, 'Shortlisted for assessment.', @app_start+17, @admin1),
(2, 3, 'Technical assessment completed.', @app_start+17, @admin1),
(3, 5, 'Hired! CPA certified with 5 years experience.', @app_start+17, @admin1),

-- Reem Al-Ghafri: Pending → Reviewing → Shortlisted
(0, 1, 'Reviewing SAP experience.', @app_start+18, @admin1),
(1, 2, 'SAP certified. Shortlisted.', @app_start+18, @admin1),

-- Badr Al-Kalbani: Pending → Reviewing → Rejected
(0, 1, 'Application review started.', @app_start+19, @admin2),
(1, 4, 'No accounting degree. Rejected.', @app_start+19, @admin2),

-- Amna Al-Hashmi: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'HR background review.', @app_start+20, @admin1),
(1, 2, 'CIPD pursuing. Shortlisted.', @app_start+20, @admin1),
(2, 3, 'Competency interview completed.', @app_start+20, @admin1),

-- Hamza Al-Badi: Full pipeline → Hired
(0, 1, 'Reviewing for Salalah position.', @app_start+22, @admin2),
(1, 2, 'Energetic candidate. Shortlisted.', @app_start+22, @admin2),
(2, 3, 'Counter simulation completed.', @app_start+22, @admin1),
(3, 5, 'Hired for Salalah branch.', @app_start+22, @admin1),

-- Suad Al-Maskari: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Application review.', @app_start+23, @admin2),
(1, 2, 'Shortlisted for phone screening.', @app_start+23, @admin2),
(2, 3, 'Phone interview completed.', @app_start+23, @admin2),

-- Ibrahim Al-Wahaibi: Pending → Reviewing → Shortlisted → Interviewed
(0, 1, 'Sales background review.', @app_start+28, @admin1),
(1, 2, 'B2B experience noted. Shortlisted.', @app_start+28, @admin1),
(2, 3, 'Sales pitch interview completed.', @app_start+28, @admin1),

-- Samia Al-Riyami: Full pipeline → Hired
(0, 1, 'Excellent sales track record.', @app_start+29, @admin1),
(1, 2, 'Shortlisted immediately.', @app_start+29, @admin1),
(2, 3, 'Both interviews completed.', @app_start+29, @admin1),
(3, 5, 'Hired as Sales Executive.', @app_start+29, @admin1),

-- Khadija Al-Alawi: Full pipeline → Hired
(0, 1, 'Avis experience verified.', @app_start+42, @admin2),
(1, 2, 'Airport experience. Shortlisted.', @app_start+42, @admin2),
(2, 3, 'Both airport and HQ interviews done.', @app_start+42, @admin1),
(3, 5, 'Hired for Airport counter.', @app_start+42, @admin1),

-- Safiya Al-Jabri: Full pipeline → Hired
(0, 1, 'Admin skills review.', @app_start+46, @admin2),
(1, 2, 'Organized candidate. Shortlisted.', @app_start+46, @admin2),
(2, 3, 'Assessment completed.', @app_start+46, @admin2),
(3, 5, 'Hired as Admin Assistant.', @app_start+46, @admin2);


-- =============================================
-- 6. RECRUITING APPLICATION RATINGS (40 ratings)
-- =============================================
INSERT INTO `recruiting_application_ratings` (`rating`, `comments`, `application_id`, `rated_by`) VALUES
-- Ahmed Al-Balushi (Senior Software Engineer)
(5, 'Outstanding backend skills. Deep NestJS expertise.', @app_start, @admin1),
(4, 'Strong technical skills. Good cultural fit.', @app_start, @admin2),
(5, 'Best candidate for senior role. Highly recommended.', @app_start, @admin3),

-- Sara Al-Hinai
(4, 'Solid portfolio. Promising candidate.', @app_start+1, @admin1),
(3, 'Good but needs more backend exposure.', @app_start+1, @admin2),

-- Mohammed Al-Rawahi
(2, 'Limited TypeORM experience.', @app_start+2, @admin1),
(2, 'Below expectations for senior role.', @app_start+2, @admin2),

-- Aisha Al-Busaidi (CS Rep - hired)
(5, 'Best customer service candidate. Trilingual.', @app_start+5, @admin1),
(5, 'Perfect communication skills. Hire immediately.', @app_start+5, @admin2),

-- Hassan Al-Lawati
(3, 'Average performance. Needs more experience.', @app_start+6, @admin2),

-- Nasser Al-Rashdi (Fleet Manager - hired)
(5, 'Exceptional fleet management expertise.', @app_start+10, @admin1),
(5, 'Leadership qualities evident. Top candidate.', @app_start+10, @admin2),
(4, 'Strong operational knowledge.', @app_start+10, @admin3),

-- Yusuf Al-Zadjali
(3, 'Good knowledge but lacks leadership.', @app_start+11, @admin1),

-- Zahra Al-Farsi (Digital Marketing)
(4, 'Impressive Google Ads portfolio.', @app_start+14, @admin2),
(4, 'Strong digital marketing strategist.', @app_start+14, @admin1),

-- Suleiman Al-Shanfari (Accountant - hired)
(5, 'CPA certified. Flawless technical test.', @app_start+17, @admin1),
(5, 'Top accounting candidate. Immediate hire.', @app_start+17, @admin2),

-- Reem Al-Ghafri
(4, 'SAP experience valuable. Good candidate.', @app_start+18, @admin1),

-- Amna Al-Hashmi (HR Coordinator)
(4, 'Good HR understanding. CIPD in progress.', @app_start+20, @admin1),
(3, 'Needs more hands-on recruiting experience.', @app_start+20, @admin2),

-- Hamza Al-Badi (Counter Staff - hired)
(4, 'Great customer interaction skills.', @app_start+22, @admin2),
(4, 'Enthusiastic and quick learner.', @app_start+22, @admin1),

-- Ibrahim Al-Wahaibi (Sales)
(4, 'Strong B2B background. Good closer.', @app_start+28, @admin1),

-- Samia Al-Riyami (Sales - hired)
(5, 'Exceeded targets 3 consecutive years.', @app_start+29, @admin1),
(5, 'Best sales candidate by far.', @app_start+29, @admin2),

-- Salma Al-Kindi (Ops Supervisor)
(4, 'Hertz experience is a plus. Good problem solver.', @app_start+31, @admin1),
(3, 'Good but needs exposure to our scale.', @app_start+31, @admin2),

-- Hanan Al-Lawati (Quality Inspector)
(5, 'ISO 9001 certified. Meticulous attention to detail.', @app_start+36, @admin1),

-- Yaqoob Al-Farsi (Mobile Developer)
(4, 'Published apps. Flutter expert.', @app_start+39, @admin1),
(4, 'Good coding test. Solid mobile dev.', @app_start+39, @admin2),

-- Khadija Al-Alawi (Airport Counter - hired)
(5, 'Airport experience. Excellent under pressure.', @app_start+42, @admin2),
(5, 'Multilingual. Customer favorite at Avis.', @app_start+42, @admin1),

-- Ruqaiya Al-Badi (Business Analyst)
(4, 'CBAP certified. Strong documentation skills.', @app_start+44, @admin1),

-- Safiya Al-Jabri (Admin Assistant - hired)
(4, 'Organized and proactive. Fast typist.', @app_start+46, @admin2),
(4, 'Reliable and detail-oriented.', @app_start+46, @admin1),

-- Hajar Al-Muqbali (Network Engineer)
(5, 'CCNP certified. Solved complex lab scenarios.', @app_start+48, @admin1),
(4, 'Solid networking fundamentals.', @app_start+48, @admin2),

-- Fahad Al-Busaidi (Ops Supervisor)
(3, '6 years industry but limited supervisory role.', @app_start+32, @admin2),

-- Maha Al-Harthi (IT Support)
(4, 'CompTIA certified. Practical troubleshooting skills.', @app_start+25, @admin1),

-- Dalal Al-Kindy (Legal Advisor)
(4, 'Bar association member. Solid contract knowledge.', @app_start+34, @admin1);


-- =============================================
-- SUMMARY
-- =============================================
-- Departments:  12
-- Career Jobs:  20
-- Applications: 50
-- Interviews:   35 (28 completed + 7 upcoming/scheduled)
-- Status History: 65
-- Ratings:      40
-- =============================================
