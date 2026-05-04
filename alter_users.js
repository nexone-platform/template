const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function alterUsersTable() {
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding ERP-standard fields to users table...');
    
    const queries = [
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS manager_id UUID;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS company_id UUID;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS cost_center_code VARCHAR(50);",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS valid_to TIMESTAMPTZ;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Bangkok';",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'TH';"
    ];

    for (const q of queries) {
      console.log(q);
      await client.query(q);
    }

    await client.query('COMMIT');
    console.log('Successfully updated users table!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error occurred, transaction rolled back.', err);
  } finally {
    await client.end();
  }
}

alterUsersTable();
