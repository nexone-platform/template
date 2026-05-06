const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ user: 'postgres', host: '203.151.66.51', database: 'nexone_template', password: 'qwerty', port: 5434 });
client.connect().then(() => {
  const sql = fs.readFileSync('c:\\Task\\Template\\template-master-2-translations.sql', 'utf8');
  return client.query(sql);
}).then(() => {
  console.log('Successfully inserted translations for Template Master 2');
  client.end();
}).catch(err => {
  console.error('Error inserting translations:', err);
  client.end();
});
