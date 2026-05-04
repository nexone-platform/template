const { Client } = require('pg');

async function addLoginFields(dbName) {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: dbName
  });

  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`Adding login fields to ${dbName}.nex_core.users...`);
    
    const queries = [
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0;",
      "ALTER TABLE nex_core.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;"
    ];

    for (const q of queries) {
      await client.query(q);
    }

    await client.query('COMMIT');
    console.log(`Successfully updated users table in ${dbName}!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error occurred in ${dbName}, transaction rolled back.`, err);
  } finally {
    await client.end();
  }
}

async function run() {
  await addLoginFields('nexone_template');
  await addLoginFields('nex_tbiz');
}

run();
