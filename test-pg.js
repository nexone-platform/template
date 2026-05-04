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
    const res = await client.query(`SELECT * FROM nex_core.menus WHERE menu_id = '020f2d9a-78ce-4142-a31a-ce48d5aae9d8'`);
    console.log('MENU:', res.rows[0]);
  } catch (err) {
    console.error('ERROR:', err);
  }
  await client.end();
}
run();
