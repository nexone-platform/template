const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:qwerty@203.151.66.51:5434/nexone_template'
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  try {
    // Helper to insert a menu
    async function insertMenu(title, page_key, route, icon, parent_id, seq) {
      const res = await client.query(`
        INSERT INTO nex_core.menus (menu_id, menu_code, title, route, page_key, icon, app_name, is_active, parent_id, menu_seq)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'nex-site', true, $6, $7)
        ON CONFLICT DO NOTHING
        RETURNING menu_id
      `, ['nex-site-' + page_key, title, route || '', page_key, icon || '', parent_id, seq]);
      
      if (res.rows.length > 0) return res.rows[0].menu_id;
      
      // If conflict (already exists), just fetch its ID
      const existRes = await client.query(`SELECT menu_id FROM nex_core.menus WHERE page_key = $1 AND app_name = 'nex-site'`, [page_key]);
      return existRes.rows[0].menu_id;
    }

    // 1. SECTION: MAIN
    const mainId = await insertMenu('MAIN', 'main-section', null, null, null, 1);

    // 2. Dashboard (No route, Expandable)
    const dashboardId = await insertMenu('Dashboard', 'dashboard-parent', null, 'LayoutDashboard', mainId, 2);

    // 3. Employee Dashboard (Child)
    await insertMenu('Employee Dashboard', 'employee-dash', '/dashboard/employee', null, dashboardId, 3);
    
    // 4. Management Dashboard (Child)
    await insertMenu('Management Dashboard', 'management-dash', '/dashboard/management', null, dashboardId, 4);

    // 5. Apps (Expandable)
    const appsId = await insertMenu('Apps', 'apps-parent', null, 'LayoutTemplate', mainId, 5);
    await insertMenu('Calendar', 'calendar', '/apps/calendar', null, appsId, 6);

    // 6. SECTION: EMPLOYEES
    const empSectionId = await insertMenu('EMPLOYEES', 'employees-section', null, null, null, 7);

    // 7. Employees (Normal link)
    await insertMenu('Employees', 'employees-list', '/employees', 'Users', empSectionId, 8);

    // 8. Clients (Normal link)
    await insertMenu('Clients', 'clients-list', '/clients', 'Users', empSectionId, 9);

    // 9. Projects (Expandable)
    const projectsId = await insertMenu('Projects', 'projects-parent', null, 'FileText', empSectionId, 10);
    await insertMenu('Projects List', 'projects-list', '/projects/list', null, projectsId, 11);
    await insertMenu('Projects Type', 'projects-type', '/projects/type', null, projectsId, 12);
    await insertMenu('Tasks', 'tasks', '/projects/tasks', null, projectsId, 13);

    console.log('Successfully inserted sample nested menus!');

    // Grant permissions
    const rolesRes = await client.query(`SELECT role_id FROM nex_core.roles`);
    const allSiteMenus = await client.query(`SELECT menu_id FROM nex_core.menus WHERE app_name = 'nex-site'`);
    
    for (const role of rolesRes.rows) {
      for (const menu of allSiteMenus.rows) {
        await client.query(`
          INSERT INTO nex_core.role_permissions (permission_id, role_id, menu_id, can_view, can_add, can_edit, can_delete, can_import, can_export, is_active)
          VALUES (gen_random_uuid(), $1, $2, true, true, true, true, true, true, true)
          ON CONFLICT DO NOTHING
        `, [role.role_id, menu.menu_id]);
      }
    }
    console.log('Granted permissions to all roles.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
