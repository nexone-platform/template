const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwerty'
});

async function resetPassAndCheckEmployee() {
  try {
    await client.connect();

    const hashFor4215 = '0xFBP/DzoRYrmSE0jl2/Bgq8UKdjWb2Ze3CK9YCikgI=';
    const updateRes = await client.query(`UPDATE public."auth-tb-ms-user" SET password = $1 WHERE email = 'tigerlinly@gmail.com'`, [hashFor4215]);
    console.log("Update Users Table Result:", updateRes.rowCount, "rows updated");
  } catch (err) {
      console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

resetPassAndCheckEmployee();
