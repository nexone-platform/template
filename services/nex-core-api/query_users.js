const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'nex_core' AND table_name = 'users'");
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
