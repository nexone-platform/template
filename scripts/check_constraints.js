const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'qwerty', database: 'nexone_techbiz' });

client.connect().then(async () => {
  const r = await client.query(
    "SELECT indexname, indexdef FROM pg_indexes WHERE tablename='menus' AND schemaname='nex_core'"
  );
  console.table(r.rows);
  client.end();
}).catch(e => { console.error(e.message); client.end(); });
