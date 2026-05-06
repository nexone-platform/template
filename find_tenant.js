const { Client } = require('pg');

const c = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await c.connect();
    const res = await c.query("SELECT * FROM nex_core.tenant_registrations WHERE company_abbreviation = 'TEMPLATE'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}

run();
