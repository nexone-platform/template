const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'nexone_techbiz',
  password: 'qwerty',
  port: 5432,
});

async function run() {
  await client.connect();
  const schema = 'nex_site';
  
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1
  `, [schema]);

  for (const row of res.rows) {
    const table = `"${schema}"."${row.table_name}"`;
    await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
  }
  
  await client.end();
}

run();
