const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template',
});

async function run() {
  await client.connect();
  try {
    await client.query(`SET search_path TO nex_core;`);
    
    // 1. Create employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id uuid PRIMARY KEY,
        employee_code varchar(50),
        first_name varchar(100),
        last_name varchar(100),
        manager_id uuid,
        company_id uuid,
        cost_center_code varchar(50),
        create_date timestamptz DEFAULT now(),
        create_by uuid,
        update_date timestamptz DEFAULT now(),
        update_by uuid
      );
    `);
    console.log('employees table checked/created');

    // 2. Modify users
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS role_name;`);
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS manager_id;`);
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS company_id;`);
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS cost_center_code;`);
    
    await client.query(`ALTER TABLE users ALTER COLUMN role_id DROP NOT NULL;`);
    await client.query(`ALTER TABLE users ALTER COLUMN role_id DROP DEFAULT;`);
    await client.query(`ALTER TABLE users ALTER COLUMN role_id TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE users ALTER COLUMN employee_id TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE users ALTER COLUMN create_by TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE users ALTER COLUMN update_by TYPE uuid USING NULL;`);
    console.log('users table modified');

    // 3. Modify roles
    const res = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'roles'::regclass AND contype = 'p';
    `);
    if (res.rows.length > 0) {
      await client.query(`ALTER TABLE roles DROP CONSTRAINT "${res.rows[0].conname}" CASCADE;`);
    }
    
    await client.query(`ALTER TABLE roles ALTER COLUMN role_id DROP DEFAULT;`);
    await client.query(`ALTER TABLE roles ALTER COLUMN role_id TYPE uuid USING gen_random_uuid();`);
    await client.query(`ALTER TABLE roles ADD PRIMARY KEY (role_id);`);
    
    await client.query(`ALTER TABLE roles ALTER COLUMN create_by TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE roles ALTER COLUMN update_by TYPE uuid USING NULL;`);
    console.log('roles table modified');

    // 4. Modify role_permissions
    const resPerm = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'role_permissions'::regclass AND contype = 'p';
    `);
    if (resPerm.rows.length > 0) {
      await client.query(`ALTER TABLE role_permissions DROP CONSTRAINT "${resPerm.rows[0].conname}" CASCADE;`);
    }
    await client.query(`ALTER TABLE role_permissions ALTER COLUMN permission_id DROP DEFAULT;`);
    await client.query(`ALTER TABLE role_permissions ALTER COLUMN permission_id TYPE uuid USING gen_random_uuid();`);
    await client.query(`ALTER TABLE role_permissions ADD PRIMARY KEY (permission_id);`);

    await client.query(`ALTER TABLE role_permissions ALTER COLUMN role_id DROP NOT NULL;`);
    await client.query(`ALTER TABLE role_permissions ALTER COLUMN role_id TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE role_permissions ALTER COLUMN create_by TYPE uuid USING NULL;`);
    await client.query(`ALTER TABLE role_permissions ALTER COLUMN update_by TYPE uuid USING NULL;`);
    console.log('role_permissions table modified');

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating db:', err);
  } finally {
    await client.end();
  }
}
run();
