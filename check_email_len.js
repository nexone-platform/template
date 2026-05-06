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
    
    const result = await client.query("SELECT email, LENGTH(email) as len FROM nex_core.users WHERE email LIKE '%tigerlinly%'");
    console.log('User Email Check:', JSON.stringify(result.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
