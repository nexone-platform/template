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

  console.log('Renaming table nex_core.templates to template_basic...');
  await client.query('ALTER TABLE IF EXISTS nex_core.templates RENAME TO template_basic;');

  console.log('Renaming finished.');
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
