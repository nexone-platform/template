const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'P@ssw0rd123!',
    database: 'nexone_template', // This is the master DB name mentioned in context
  });

  try {
    await client.connect();
    
    // 1. Check User in nexone_template (Master) or nexone_template schema?
    // The context says "Host: 203.151.66.51, Port: 5434, DB: nexone_template"
    
    const userResult = await client.query('SELECT * FROM nex_core.users WHERE email = $1', ['tigerlinly@gmail.com']);
    console.log('User in nex_core.users:', JSON.stringify(userResult.rows, null, 2));

    const tenantResult = await client.query("SELECT * FROM nex_core.tenant_registrations WHERE workspace_id = $1", ['TEMPLATE']);
    console.log('Tenant Registration:', JSON.stringify(tenantResult.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
