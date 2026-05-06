const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

client.connect()
  .then(() => client.query("SELECT * FROM nex_core.tenant_registrations WHERE company_abbreviation = 'TEMPLATE'"))
  .then(res => {
    if (res.rows.length > 0) {
      console.log("Tenant found:", JSON.stringify(res.rows[0], null, 2));
    } else {
      console.log("Tenant not found");
    }
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
