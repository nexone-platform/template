const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_techbiz'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT app_name, icon_path, app_group, seq_no FROM nex_core.system_apps ORDER BY id;');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.dir);
