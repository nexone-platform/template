-- Add sidebar_text_color column to theme settings table
ALTER TABLE "solution-one"."adm-tb-ms-theme-settings"
ADD COLUMN IF NOT EXISTS sidebar_text_color VARCHAR(20) DEFAULT '#FFFFFF';
