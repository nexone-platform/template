const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'nex_core' AND table_name = 'users'"))
  .then(res => {
    console.log("Columns:", JSON.stringify(res.rows, null, 2));
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
