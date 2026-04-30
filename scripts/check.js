require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='nex_core' AND table_name='menus' AND is_nullable='NO';")
  .then(res => console.log(res.rows))
  .catch(err => console.error(err))
  .finally(() => pool.end());
