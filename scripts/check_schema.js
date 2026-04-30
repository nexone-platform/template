const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'qwerty', database: 'nexone_techbiz' });
client.connect().then(async () => {
  const r = await client.query(
    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='nex_core' AND table_name='menus' ORDER BY ordinal_position"
  );
  console.table(r.rows);
  client.end();
}).catch(e => { console.error(e.message); client.end(); });
