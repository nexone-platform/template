const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwerty'
});

async function checkUser() {
  try {
    await client.connect();
    const userRes = await client.query(`SELECT email, is_active, password, salt FROM public."auth-tb-ms-user" WHERE email = 'tigerlinly@gmail.com'`);
    console.log("Users Table Result:", userRes.rows);

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

checkUser();
