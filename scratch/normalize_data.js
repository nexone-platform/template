
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
    
    console.log('Normalizing menus app_name...');
    const res1 = await client.query("UPDATE nex_core.menus SET app_name = 'NexStream' WHERE app_name = 'nex-site'");
    console.log(`Updated ${res1.rowCount} menus from nex-site to NexStream`);

    console.log('Normalizing role_permissions app_name...');
    // We need to match the app_name from the menus table for each role_permission
    // But since they are NULL, we can try to guess or just set a default.
    // A better way is to join with menus table on menu_id.
    const res2 = await client.query(`
      UPDATE nex_core.role_permissions rp
      SET app_name = m.app_name
      FROM nex_core.menus m
      WHERE rp.menu_id = m.menu_id AND rp.app_name IS NULL
    `);
    console.log(`Updated ${res2.rowCount} role_permissions with app_name from menus`);

    // Any remaining NULLs set to NexCore as default
    const res3 = await client.query("UPDATE nex_core.role_permissions SET app_name = 'NexCore' WHERE app_name IS NULL");
    console.log(`Updated ${res3.rowCount} remaining role_permissions to NexCore`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
