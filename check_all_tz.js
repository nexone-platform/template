const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function checkAllTimestamps() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'nex_core' 
      AND data_type = 'timestamp without time zone'
    ORDER BY table_name, column_name;
  `);
  
  console.log("=== Any remaining timestamp WITHOUT Timezone columns? ===");
  console.table(res.rows);
  await client.end();
}

checkAllTimestamps().catch(console.error);
