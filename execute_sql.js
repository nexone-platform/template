const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ user: 'postgres', host: '203.151.66.51', database: 'nexone_template', password: 'qwerty', port: 5434 });
client.connect().then(() => {
  const sql1 = fs.readFileSync('c:\\Task\\Template\\language_translations_insert.sql', 'utf8');
  const sql2 = fs.readFileSync('c:\\Task\\Template\\system_config_insert.sql', 'utf8');
  return client.query(sql1).then(() => client.query(sql2));
}).then(() => {
  console.log('Success');
  client.end();
}).catch(err => {
  console.error(err);
  client.end();
});
