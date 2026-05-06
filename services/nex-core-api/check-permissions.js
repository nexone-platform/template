const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:qwerty@203.151.66.51:5434/nexone_template' 
  });
  
  try {
    await client.connect();
    
    // 1. Check menus - app_name, title, menu_code
    console.log('\n=== MENUS (app_name, title, menu_code, page_key) ===');
    const menus = await client.query("SELECT menu_id, title, menu_code, app_name, page_key, is_active FROM nex_core.menus WHERE is_active = true ORDER BY menu_seq ASC");
    menus.rows.forEach(r => console.log(`  [${r.app_name}] title="${r.title}" code="${r.menu_code}" page_key="${r.page_key}" active=${r.is_active}`));
    
    // 2. Check DISTINCT app_name values
    console.log('\n=== DISTINCT app_name ===');
    const apps = await client.query("SELECT DISTINCT app_name FROM nex_core.menus");
    apps.rows.forEach(r => console.log(`  "${r.app_name}"`));
    
    // 3. Check roles
    console.log('\n=== ROLES ===');
    const roles = await client.query("SELECT role_id, role_name, is_active FROM nex_core.roles ORDER BY role_name");
    roles.rows.forEach(r => console.log(`  ${r.role_id} | ${r.role_name} | active=${r.is_active}`));
    
    // 4. Check role_permissions - DISTINCT app_name
    console.log('\n=== DISTINCT app_name in role_permissions ===');
    const permApps = await client.query("SELECT DISTINCT app_name FROM nex_core.role_permissions");
    permApps.rows.forEach(r => console.log(`  "${r.app_name}"`));
    
    // 5. Check permissions for the first role
    if (roles.rows.length > 0) {
      const firstRole = roles.rows[0].role_id;
      console.log(`\n=== PERMISSIONS for role: ${roles.rows[0].role_name} (${firstRole}) ===`);
      const perms = await client.query(
        `SELECT rp.permission_id, rp.menu_id, rp.app_name, rp.can_view, rp.can_add, rp.can_edit, rp.can_delete, rp.can_import, rp.can_export, rp.is_active, m.title as menu_title, m.menu_code
         FROM nex_core.role_permissions rp
         LEFT JOIN nex_core.menus m ON rp.menu_id = m.menu_id
         WHERE rp.role_id = $1
         ORDER BY m.menu_seq`, [firstRole]);
      perms.rows.forEach(r => console.log(`  [${r.app_name}] "${r.menu_title}" code="${r.menu_code}" | view=${r.can_view} add=${r.can_add} edit=${r.can_edit} del=${r.can_delete} imp=${r.can_import} exp=${r.can_export} active=${r.is_active}`));
    }
    
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.end();
  }
}

test();
