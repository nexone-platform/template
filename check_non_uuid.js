const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template'
});

async function run() {
  await client.connect();
  
  // Find all tables and their columns ending in 'id' or being primary keys
  // AND are NOT 'uuid'
  const query = `
    SELECT 
      c.table_schema,
      c.table_name,
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      tc.constraint_type
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu
      ON c.table_name = kcu.table_name 
      AND c.column_name = kcu.column_name 
      AND c.table_schema = kcu.table_schema
    LEFT JOIN information_schema.table_constraints tc
      ON kcu.constraint_name = tc.constraint_name 
      AND kcu.table_schema = tc.table_schema
    WHERE c.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      AND c.data_type != 'uuid'
      AND (
        c.column_name LIKE '%_id' 
        OR c.column_name = 'id'
        OR c.column_name LIKE '%id'
        OR tc.constraint_type = 'PRIMARY KEY'
      )
    ORDER BY c.table_schema, c.table_name, c.column_name;
  `;
  
  const res = await client.query(query);
  
  const tables = {};
  for (const row of res.rows) {
    const key = row.table_schema + '.' + row.table_name;
    if (!tables[key]) tables[key] = [];
    
    // avoid duplicates if a column is both PK and FK
    const existing = tables[key].find(c => c.column_name === row.column_name);
    if (existing) {
        if (row.constraint_type && !existing.constraint_type.includes(row.constraint_type)) {
            existing.constraint_type += ', ' + row.constraint_type;
        }
    } else {
        tables[key].push({
            column_name: row.column_name,
            data_type: row.data_type,
            char_len: row.character_maximum_length,
            constraint_type: row.constraint_type || ''
        });
    }
  }

  for (const [table, cols] of Object.entries(tables)) {
    console.log(`\n[${table}]`);
    for (const col of cols) {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.char_len ? '('+col.char_len+')' : ''} ${col.constraint_type ? '['+col.constraint_type+']' : ''}`);
    }
  }
  
  await client.end();
}

run().catch(console.error);
