
const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51', port: 5434, user: 'postgres', password: 'qwerty', database: 'nexone_template'
});
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT menu_id, title, menu_code, parent_id, menu_seq, menu_type FROM nex_core.menus WHERE app_name = 'NexCore' ORDER BY menu_seq LIMIT 30");
    res.rows.forEach(r => {
      console.log(`${r.menu_seq} | ${r.title.padEnd(20)} | ${r.menu_code.padEnd(25)} | ${r.parent_id} | ${r.menu_type}`);
    });
  } catch (err) { console.error(err); } finally { await client.end(); }
}
run();
