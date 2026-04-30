require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'nex_core' AND table_name = 'menus'
    `);
    console.log("Columns:", res.rows);
    
    // Also check current data
    const res2 = await pool.query('SELECT * FROM nex_core.menus');
    console.log("Data total rows:", res2.rows.length);
    if(res2.rows.length > 0) {
        console.log("Data first row:", res2.rows[0]);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    pool.end();
  }
}
check();
