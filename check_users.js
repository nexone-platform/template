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

  const res = await client.query('SELECT * FROM nex_core.users WHERE email = $1', ['tigerlinly@gmail.com']);
  console.log('tigerlinly@gmail.com details:');
  console.log(res.rows);

  const res2 = await client.query('SELECT * FROM nex_core.users');
  console.log('\nAll users:');
  console.log(res2.rows.map(r => r.email));

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
