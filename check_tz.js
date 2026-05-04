const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function checkTz() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'nex_core' 
      AND column_name IN ('create_date', 'update_date', 'created_at', 'updated_at')
    ORDER BY table_name, column_name;
  `);
  
  const tablesWithoutTz = res.rows.filter(r => r.data_type === 'timestamp without time zone');
  const tablesWithTz = res.rows.filter(r => r.data_type === 'timestamp with time zone');
  
  console.log("=== Columns WITHOUT Timezone ===");
  console.table(tablesWithoutTz);
  
  console.log("=== Columns WITH Timezone ===");
  console.table(tablesWithTz);

  await client.end();
}

checkTz().catch(console.error);
