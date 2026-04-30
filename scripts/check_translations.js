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
  // Show sample of inserted translations — both TH and EN side by side
  const result = await pool.query(`
    SELECT
      t_th.label_key,
      t_th.label_value AS label_th,
      t_en.label_value AS label_en
    FROM nex_core.language_translations t_th
    JOIN nex_core.language_translations t_en
      ON t_th.label_key = t_en.label_key
      AND t_th.page_key = t_en.page_key
    WHERE t_th.page_key = 'menu'
      AND t_th.language_code = 'th'
      AND t_en.language_code = 'en'
      AND t_th.label_key LIKE 'nex-%'
    ORDER BY t_th.label_key
    LIMIT 20
  `);
  console.log('=== Sample TH/EN menu translations ===');
  console.table(result.rows);

  const count = await pool.query(`
    SELECT language_code, COUNT(*) as count
    FROM nex_core.language_translations
    WHERE page_key = 'menu' AND label_key LIKE 'nex-%'
    GROUP BY language_code
  `);
  console.log('\n=== Count by language ===');
  console.table(count.rows);
  pool.end();
}
run().catch(console.error);
