const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '203.151.66.51',
  database: 'nexone_template',
  password: 'qwerty',
  port: 5434,
});

async function run() {
  try {
    await client.connect();
    
    console.log('Checking for duplicate role_permissions (same role_id and menu_id)...');
    const res = await client.query(`
      SELECT role_id, menu_id, app_name, COUNT(*) 
      FROM nex_core.role_permissions 
      GROUP BY role_id, menu_id, app_name
      HAVING COUNT(*) > 1;
    `);
    
    if (res.rows.length > 0) {
      console.log('FOUND DUPLICATES:');
      console.log(JSON.stringify(res.rows, null, 2));
    } else {
      console.log('No duplicates found.');
    }

    console.log('\nChecking for invalid UUIDs or constraints...');
    // Check if there are any permissions where menu_id does not exist in menus table
    const orphanedRes = await client.query(`
      SELECT rp.permission_id, rp.menu_id 
      FROM nex_core.role_permissions rp
      LEFT JOIN nex_core.menus m ON rp.menu_id = m.menu_id
      WHERE m.menu_id IS NULL AND rp.menu_id IS NOT NULL;
    `);
    console.log('Orphaned permissions (pointing to non-existent menus):', orphanedRes.rows.length);
    if (orphanedRes.rows.length > 0) {
       console.log(JSON.stringify(orphanedRes.rows.slice(0, 5), null, 2));
    }

  } catch (err) {
    console.error('Error during diagnostics:', err.message);
  } finally {
    await client.end();
  }
}

run();
