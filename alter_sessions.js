const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template',
  });
  await client.connect();
  try {
    await client.query('ALTER TABLE nex_core.sessions ADD COLUMN IF NOT EXISTS schema_name VARCHAR(100)');
    console.log('Altered sessions table in nexone_template');
    
    // Also need to alter sessions in the nex_tbiz database if there is one? 
    // Wait, the sessions table in the tenant DB is `nex_core.sessions`.
    // Actually, we don't even use the sessions table in the tenant DB currently!
    // All sessions are created in `nexone_template.sessions`.
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
