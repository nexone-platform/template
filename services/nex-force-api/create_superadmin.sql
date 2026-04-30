-- 1. Check/Insert Superadmin into Employees
DO $$ 
DECLARE 
    emp_id integer;
BEGIN
    SELECT id INTO emp_id FROM "solution-one"."emp-tb-ms-employees" WHERE email = 'superadmin@nextforce.com';

    IF emp_id IS NULL THEN
        INSERT INTO "solution-one"."emp-tb-ms-employees" 
            (email, first_name_en, last_name_en, is_superadmin, create_date, create_by, employee_id)
        VALUES 
            ('superadmin@nextforce.com', 'System', 'Superadmin', true, CURRENT_TIMESTAMP, 'system', 'SUPER_ADMIN_01')
        RETURNING id INTO emp_id;
    ELSE
        UPDATE "solution-one"."emp-tb-ms-employees" 
        SET is_superadmin = true, role_id = 20
        WHERE id = emp_id;
    END IF;

    -- 2. Check/Insert Superadmin into Users
    -- password = 123456
    -- salt = vEApX4BvzKePKfimuWhdVnoP2R0um+Z7Ly7IMnseFwM=
    -- hash = 0xFBP/DzoRYrmSE0jl2/Bgq8UKdjWb2Ze3CK9YCikgI=
    IF NOT EXISTS (SELECT 1 FROM public."auth-tb-ms-user" WHERE email = 'superadmin@nextforce.com') THEN
        INSERT INTO public."auth-tb-ms-user" 
            (email, password, salt, employee_id, is_active, role_id, create_date, create_by)
        VALUES 
            ('superadmin@nextforce.com', '0xFBP/DzoRYrmSE0jl2/Bgq8UKdjWb2Ze3CK9YCikgI=', 'vEApX4BvzKePKfimuWhdVnoP2R0um+Z7Ly7IMnseFwM=', emp_id, true, 20, CURRENT_TIMESTAMP, 'system');
    ELSE
        UPDATE public."auth-tb-ms-user" 
        SET password = '0xFBP/DzoRYrmSE0jl2/Bgq8UKdjWb2Ze3CK9YCikgI=',
            salt = 'vEApX4BvzKePKfimuWhdVnoP2R0um+Z7Ly7IMnseFwM=',
            is_active = true,
            role_id = 20
        WHERE email = 'superadmin@nextforce.com';
    END IF;
END $$;
