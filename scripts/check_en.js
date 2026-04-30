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
  for (const app of ['nex-core', 'nex-site', 'nex-speed']) {
    const result = await pool.query(`
      SELECT menus_id, title, menu_value, route, base, page_key, parent_id
      FROM nex_core.menus
      WHERE app_name = $1
      ORDER BY menu_seq, menus_id
      LIMIT 10
    `, [app]);
    console.log(`\n=== ${app} (first 10) ===`);
    console.table(result.rows);
  }
  pool.end();
}
run().catch(console.error);
