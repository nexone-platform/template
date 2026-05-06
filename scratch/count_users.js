
const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM nex_core.users");
    console.log("User count:", res.rows[0].count);
    const users = await client.query("SELECT id, email, display_name FROM nex_core.users LIMIT 10");
    console.log("Users:", JSON.stringify(users.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
