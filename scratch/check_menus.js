
const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    console.log("--- Distinct app_names ---");
    const apps = await client.query("SELECT DISTINCT app_name FROM nex_core.menus");
    console.log(apps.rows.map(r => r.app_name));

    console.log("\n--- Top level menus for NexCore ---");
    const res = await client.query(`
      SELECT menu_id, title, menu_code, parent_id, menu_seq 
      FROM nex_core.menus 
      WHERE app_name = 'NexCore' 
      ORDER BY menu_seq
    `);
    
    // Simple tree builder for debugging
    const nodes = res.rows;
    const map = {};
    nodes.forEach(n => map[n.menu_id] = { ...n, children: [] });
    const roots = [];
    nodes.forEach(n => {
      if (n.parent_id && map[n.parent_id]) {
        map[n.parent_id].children.push(map[n.menu_id]);
      } else {
        roots.push(map[n.menu_id]);
      }
    });

    console.log(JSON.stringify(roots, (key, value) => {
      if (key === 'children' && value.length === 0) return undefined;
      return value;
    }, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
