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
  await client.query("DROP TABLE IF EXISTS nex_core.sessions CASCADE;");
  await client.query("DROP TABLE IF EXISTS nex_core.users CASCADE;");
  console.log('Tables dropped successfully');
  await client.end();
}

main().catch(console.error);
