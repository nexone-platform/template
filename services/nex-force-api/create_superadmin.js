const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwerty'
});

async function createSuperadmin() {
  try {
    await client.connect();

    const email = 'superadmin@nextforce.com';
    const passwordRaw = '123456';
    const saltRaw = crypto.randomBytes(32).toString('base64');
    const hashedPassword = crypto.createHash('sha256').update(passwordRaw + saltRaw, 'utf8').digest('base64');

    console.log("Checking if superadmin already exists in Employees...");
    const checkEmp = await client.query(`SELECT id FROM "solution-one"."emp-tb-ms-employees" WHERE email = $1`, [email]);
    let employeePk = 0;

    if (checkEmp.rows.length === 0) {
        console.log("Inserting superadmin into Employees...");
        const insEmp = await client.query(`
            INSERT INTO "solution-one"."emp-tb-ms-employees" 
            (email, first_name_en, last_name_en, is_superadmin, create_date, create_by, employee_id)
            VALUES ($1, 'System', 'Superadmin', true, CURRENT_TIMESTAMP, 'system', 'SUPER_ADMIN_01')
            RETURNING id
        `, [email]);
        employeePk = insEmp.rows[0].id;
    } else {
        employeePk = checkEmp.rows[0].id;
        await client.query(`UPDATE "solution-one"."emp-tb-ms-employees" SET is_superadmin = true WHERE id = $1`, [employeePk]);
    }

    console.log("Superadmin Employee ID (PK):", employeePk);

    const checkUser = await client.query(`SELECT * FROM public."auth-tb-ms-user" WHERE email = $1`, [email]);
    if (checkUser.rows.length === 0) {
        console.log("Inserting superadmin into Users...");
        await client.query(`
            INSERT INTO public."auth-tb-ms-user" 
            (email, password, salt, employee_id, is_active, role_id, create_date, create_by)
            VALUES ($1, $2, $3, $4, true, 1, CURRENT_TIMESTAMP, 'system')
        `, [email, hashedPassword, saltRaw, employeePk]);
    } else {
        console.log("Updating existing superadmin in Users...");
        await client.query(`
            UPDATE public."auth-tb-ms-user" 
            SET password = $1, salt = $2, is_active = true 
            WHERE email = $3
        `, [hashedPassword, saltRaw, email]);
    }

    console.log("-----------------------------------------");
    console.log("SUCCESS! Superadmin created.");
    console.log("Email:", email);
    console.log("Password:", passwordRaw);
    console.log("-----------------------------------------");
  } catch (err) {
      console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

createSuperadmin();
