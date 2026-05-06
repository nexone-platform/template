const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => client.query("SELECT id, email, is_active, deleted_at FROM nex_core.users WHERE email = 'tigerlinly@gmail.com'"))
  .then(res => {
    console.log("User status:", JSON.stringify(res.rows[0], null, 2));
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
