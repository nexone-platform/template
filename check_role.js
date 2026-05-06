const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: 'nexone_template',
  });

  try {
    await client.connect();
    
    const roleResult = await client.query('SELECT * FROM nex_core.roles WHERE role_id = $1', ['b98e5310-d1f6-4adf-9b3a-ed310c365c6b']);
    console.log('Role:', JSON.stringify(roleResult.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
