const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM nex_core.language_translations WHERE label_key = 'add_category'");
    console.log('Results:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
