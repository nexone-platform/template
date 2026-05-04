const { Client } = require('pg');
const c = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});
c.connect()
  .then(() => c.query("SELECT column_name FROM information_schema.columns WHERE table_schema='nex_core' AND table_name='menus' ORDER BY ordinal_position"))
  .then(r => { r.rows.forEach(row => console.log(row.column_name)); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
