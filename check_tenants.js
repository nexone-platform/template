const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  await client.connect();

  const res = await client.query('SELECT company_abbreviation, schema_name, provisioning_status FROM nex_core.tenant_registrations');
  console.log('Tenants:', res.rows);

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
