const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template'
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  try {
    // Check and create extension if needed (not strictly required for gen_random_uuid() in PG13+, but good for safety)
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Alter table nex_core.menus to set default value for menu_id
    await client.query(`
      ALTER TABLE nex_core.menus 
      ALTER COLUMN menu_id SET DEFAULT gen_random_uuid();
    `);
    
    console.log('Successfully set DEFAULT gen_random_uuid() for nex_core.menus.menu_id');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
