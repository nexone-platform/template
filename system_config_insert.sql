INSERT INTO nex_core.system_config (system_group, system_key, system_value, system_type, system_seq_no, description, create_by, is_active) VALUES 
('SYSTEM', 'DATE_FORMAT', 'dd/MM/yyyy', 'string', 10, 'Global Date Format', 'system', true),
('SYSTEM', 'TIME_FORMAT', 'HH:mm:ss', 'string', 11, 'Global Time Format', 'system', true),
('SYSTEM', 'DATETIME_FORMAT', 'dd/MM/yyyy HH:mm:ss', 'string', 12, 'Global Date Time Format', 'system', true)
ON CONFLICT (system_key) DO UPDATE SET system_value = EXCLUDED.system_value, system_group = EXCLUDED.system_group, system_type = EXCLUDED.system_type, description = EXCLUDED.description;
