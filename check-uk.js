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
  try {
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'nex_core.menus'::regclass;
    `);
    console.log('CONSTRAINTS:', res.rows);
  } catch (err) {
    console.error('ERROR:', err);
  }
  await client.end();
}
run();
