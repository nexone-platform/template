const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwerty'
});

async function fixSuperAdminRole() {
  try {
    await client.connect();
    
    // Update role in Users
    await client.query(`UPDATE public."auth-tb-ms-user" SET role_id = 20 WHERE email = 'superadmin@nextforce.com'`);
    
    // Update role in Employees if column exists
    try {
        await client.query(`UPDATE "solution-one"."emp-tb-ms-employees" SET role_id = 20 WHERE email = 'superadmin@nextforce.com'`);
    } catch(e) {}
    
    console.log("Superadmin role updated to 20 (SuperAdmin)!");
  } catch (err) {
      console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

fixSuperAdminRole();
