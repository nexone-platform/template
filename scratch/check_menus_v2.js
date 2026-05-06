const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root', // Assuming default from previous sessions
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT menu_id, title, parent_id, menu_type, menu_seq FROM nex_core.menus WHERE app_name = 'nex-core' AND is_active = true ORDER BY menu_seq ASC;");
  console.log('ID | Title | Parent | Type | Seq');
  res.rows.forEach(r => {
    console.log(`${r.menu_id} | ${r.title} | ${r.parent_id} | ${r.menu_type} | ${r.menu_seq}`);
  });
  await client.end();
}

run().catch(console.error);
