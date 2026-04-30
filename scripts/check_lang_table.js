require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function run() {
  // Check table columns
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='nex_core' AND table_name='language_translations'
    ORDER BY ordinal_position
  `);
  console.log('=== language_translations columns ===');
  console.table(cols.rows);

  // Sample existing rows with page_key = 'menu'
  const sample = await pool.query(`
    SELECT translations_id, language_code, page_key, label_key, label_value
    FROM nex_core.language_translations
    WHERE page_key = 'menu'
    ORDER BY label_key, language_code
    LIMIT 10
  `);
  console.log('\n=== Sample existing menu translations ===');
  console.table(sample.rows);

  // Check max translations_id
  const maxId = await pool.query(`SELECT MAX(translations_id) as max FROM nex_core.language_translations`);
  console.log('\nMax translations_id:', maxId.rows[0].max);

  pool.end();
}
run().catch(console.error);
