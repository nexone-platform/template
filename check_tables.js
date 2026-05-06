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

  const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('public', 'nex_core', 'tenant')");
  console.log('Tables:', res.rows);

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
