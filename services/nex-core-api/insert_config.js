const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template',
});

async function main() {
  await client.connect();
  const res = await client.query(`SELECT system_id FROM nex_core.system_config WHERE system_key = 'PAGE_RECORD_DEFAULT'`);
  if (res.rows.length > 0) {
    await client.query(`UPDATE nex_core.system_config SET system_value = '20' WHERE system_key = 'PAGE_RECORD_DEFAULT'`);
    console.log('Updated PAGE_RECORD_DEFAULT');
  } else {
    await client.query(`
      INSERT INTO nex_core.system_config (system_group, system_key, system_value, system_type, description, is_active)
      VALUES ('UI_SETTINGS', 'PAGE_RECORD_DEFAULT', '20', 'NUMBER', 'Default number of records per page', true)
    `);
    console.log('Inserted PAGE_RECORD_DEFAULT');
  }
  await client.end();
}

main().catch(console.error);
