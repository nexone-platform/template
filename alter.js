const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || '203.151.66.51',
  port: process.env.DB_PORT || 5434,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'qwerty',
  database: 'nexone_template',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to db');
    await client.query('ALTER TABLE nex_core.tenant_registrations ADD COLUMN IF NOT EXISTS company_title VARCHAR(100);');
    console.log('Added company_title column successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
