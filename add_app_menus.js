const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template'
});

async function run() {
  await client.connect();
  
  console.log('Connected to database.');

  // Find parent id of 'System' group
  const parentRes = await client.query(`SELECT menu_id FROM nex_core.menus WHERE page_key = 'system-group' LIMIT 1`);
  const parentId = parentRes.rows.length > 0 ? parentRes.rows[0].menu_id : null;
  
  console.log('Found parentId for system-group:', parentId);

  // Check if it already exists
  const existingRes = await client.query(`SELECT menu_id FROM nex_core.menus WHERE page_key = 'app-menus'`);
  if (existingRes.rows.length > 0) {
    console.log('Menu app-menus already exists.');
  } else {
    // Insert new menu
    try {
      const insertRes = await client.query(`
        INSERT INTO nex_core.menus (menu_id, menu_code, title, route, page_key, icon, app_name, is_active, parent_id, menu_seq)
        VALUES (gen_random_uuid(), 'nex-core-app-menus', 'App Menus', 'app-menus', 'app-menus', 'LayoutTemplate', 'nex-core', true, $1, 57)
        RETURNING menu_id
      `, [parentId]);
      const newMenuId = insertRes.rows[0].menu_id;
      console.log('Successfully inserted App Menus into nex_core.menus with ID:', newMenuId);
    } catch (e) {
      console.error('Error inserting:', e.message);
    }
  }

  // Grant permissions for app-menus
  const existingRes2 = await client.query(`SELECT menu_id FROM nex_core.menus WHERE page_key = 'app-menus'`);
  if (existingRes2.rows.length > 0) {
      const newMenuId = existingRes2.rows[0].menu_id;
      // Get all roles
      const rolesRes = await client.query(`SELECT role_id FROM nex_core.roles`);
      for (const row of rolesRes.rows) {
        await client.query(`
          INSERT INTO nex_core.role_permissions (permission_id, role_id, menu_id, can_view, can_add, can_edit, can_delete, can_import, can_export, is_active)
          VALUES (gen_random_uuid(), $1, $2, true, true, true, true, true, true, true)
          ON CONFLICT DO NOTHING
        `, [row.role_id, newMenuId]);
      }
      console.log('Ensured permissions exist for all roles on app-menus.');
  }

  await client.end();
}

run().catch(console.error);
