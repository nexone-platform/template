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
    console.log('Connected to DB successfully');
    
    const userResult = await client.query('SELECT * FROM nex_core.users WHERE email = $1', ['tigerlinly@gmail.com']);
    console.log('User in nex_core.users:', JSON.stringify(userResult.rows, null, 2));

    const tenantResult = await client.query("SELECT * FROM nex_core.tenant_registrations WHERE workspace_id = $1", ['TEMPLATE']);
    console.log('Tenant Registration:', JSON.stringify(tenantResult.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
