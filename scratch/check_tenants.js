
const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT company_abbreviation, schema_name, provisioning_status FROM nex_core.tenant_registrations");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
