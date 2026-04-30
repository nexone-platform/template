-- Update existing translation for Passport No in Thai and English
INSERT INTO "solution-one"."adm-tb-ms-language-translations" 
("page_key", "label_key", "label_value", "language_code", "create_date", "create_by") 
VALUES
('employee-profile', 'Passport No', 'บัตรประชาชน / Passport', 'th', CURRENT_TIMESTAMP, 'system'),
('employee-profile', 'Passport No', 'National ID / Passport No', 'en', CURRENT_TIMESTAMP, 'system')
ON CONFLICT ("page_key", "label_key", "language_code") DO UPDATE 
SET "label_value" = EXCLUDED."label_value",
    "update_date" = CURRENT_TIMESTAMP;

-- Also update for employee-page just in case
INSERT INTO "solution-one"."adm-tb-ms-language-translations" 
("page_key", "label_key", "label_value", "language_code", "create_date", "create_by") 
VALUES
('employee-page', 'Passport No', 'บัตรประชาชน / Passport', 'th', CURRENT_TIMESTAMP, 'system'),
('employee-page', 'Passport No', 'National ID / Passport No', 'en', CURRENT_TIMESTAMP, 'system')
ON CONFLICT ("page_key", "label_key", "language_code") DO UPDATE 
SET "label_value" = EXCLUDED."label_value",
    "update_date" = CURRENT_TIMESTAMP;
