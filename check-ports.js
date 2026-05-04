const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => client.query("SELECT * FROM nex_core.system_apps"))
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    return client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
