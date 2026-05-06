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
    const res = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'nex_core'");
    console.log('Tables in nex_core:');
    console.log(res.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}

run();
