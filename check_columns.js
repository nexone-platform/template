const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '203.151.66.51',
    port: 5434,
    user: 'postgres',
    password: 'qwerty',
    database: 'nexone_template',
  });

  try {
    await client.connect();
    
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'nex_core' AND table_name = 'tenant_registrations'
    `);
    console.log('Columns of tenant_registrations:', JSON.stringify(columns.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
