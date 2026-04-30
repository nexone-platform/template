const { Client } = require('pg');
require('dotenv').config({ path: './services/nex-core-api/.env.development' });

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'nexone',
  ssl: false,
});

async function main() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'templates'
      ORDER BY table_schema
    `);
    console.log('Tables named "templates":');
    if (res.rows.length === 0) {
      console.log('  ❌ Not found in any schema!');
      // List all schemas
      const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
      console.log('\nAvailable schemas:', schemas.rows.map(r => r.schema_name).join(', '));
    } else {
      res.rows.forEach(r => console.log(`  ✅ Found: ${r.table_schema}.${r.table_name}`));
    }
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}
main();
