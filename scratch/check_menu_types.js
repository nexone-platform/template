const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT menu_id, title, menu_type FROM nex_core.menus WHERE app_name = 'nex-core' ORDER BY menu_seq;");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
