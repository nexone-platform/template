const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => client.query("SELECT id, email, password, is_active, failed_login_count, locked_until FROM nex_core.users WHERE email = 'tigerlinly@gmail.com'"))
  .then(res => {
    if (res.rows.length > 0) {
      console.log("User found:", JSON.stringify(res.rows[0], null, 2));
    } else {
      console.log("User not found");
    }
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
