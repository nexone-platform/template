const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template'
});

async function run() {
  await client.connect();
  
  // Get all columns for nex_core.menus
  const colsRes = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'nex_core' AND table_name = 'menus'
  `);
  
  const columns = colsRes.rows.map(r => r.column_name);
  console.log('Columns in nex_core.menus:', columns.join(', '));
  
  // Check non-null count for each column
  for (const col of columns) {
    const countRes = await client.query(`SELECT COUNT("${col}") as c FROM nex_core.menus WHERE "${col}" IS NOT NULL AND "${col}"::text != ''`);
    console.log(`Column ${col}: ${countRes.rows[0].c} non-null/non-empty values`);
  }
  
  // Show a few rows for context
  const dataRes = await client.query(`SELECT * FROM nex_core.menus LIMIT 3`);
  console.log('\nSample data:');
  console.log(dataRes.rows);
  
  await client.end();
}

run().catch(console.error);
