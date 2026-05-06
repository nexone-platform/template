const fs = require('fs');
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
    const sql = fs.readFileSync('seed_template_master_2.sql', 'utf8');
    await client.query(sql);
    console.log('SQL executed successfully');
  } catch (err) {
    console.error('ERROR:', err);
  }
  await client.end();
}
run();
