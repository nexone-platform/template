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
    
    const result = await client.query("SELECT * FROM nex_core.users WHERE email = $1", ['admin@company.com']);
    console.log('User admin@company.com:', JSON.stringify(result.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
