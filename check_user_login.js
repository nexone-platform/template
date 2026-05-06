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
    const res = await c.query('SELECT * FROM nex_core.users WHERE email = $1', ['tigerlinly@gmail.com']);
    console.log(JSON.stringify(res.rows, null, 2));

    const tenantRes = await c.query('SELECT id, name, workspace_id FROM nex_core.tenants');
    console.log('Tenants:');
    console.log(JSON.stringify(tenantRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}

run();
