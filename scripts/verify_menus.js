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
  const result = await pool.query(`
    SELECT app_name, COUNT(*) as count
    FROM nex_core.menus
    WHERE app_name IS NOT NULL
    GROUP BY app_name
    ORDER BY app_name
  `);
  console.log('Menus by app:');
  console.table(result.rows);
  
  const nexcore = await pool.query(`
    SELECT menus_id, title, parent_id, route, menu_seq
    FROM nex_core.menus
    WHERE app_name = 'nex-core'
    ORDER BY menu_seq, menus_id
  `);
  console.log('\nnex-core menus:', nexcore.rows);
  pool.end();
}
run().catch(console.error);
