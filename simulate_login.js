const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  await client.connect();

  const workspaceId = 'TEMPLATE';
  const email = 'tigerlinly@gmail.com';
  
  // 1. Check workspace
  const tRes = await client.query('SELECT * FROM nex_core.tenant_registrations WHERE company_abbreviation = $1', [workspaceId]);
  console.log('Tenant:', tRes.rows[0]);
  
  if (!tRes.rows[0]) {
    console.log('No tenant found');
    return;
  }
  const schemaName = tRes.rows[0].schema_name;

  // 2. We pretend getTenantDataSource gives us a connection to `database: schemaName`
  // Wait, in our DB, nexone_template IS the database. 
  // Let's connect to the tenant database explicitly just to test!
  const tenantClient = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: schemaName // this will be 'nexone_template'
  });
  await tenantClient.connect();

  const users = await tenantClient.query(`
    SELECT u.*, r.role_name 
    FROM nex_core.users u 
    LEFT JOIN nex_core.roles r ON u.role_id = r.role_id 
    WHERE u.email = $1
  `, [email]);
  
  console.log('User found:', users.rows[0]);

  await tenantClient.end();
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
