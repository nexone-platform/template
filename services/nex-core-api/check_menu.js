const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM nex_core.menus WHERE title = 'Master Type 3'");
  console.log(res.rows);
  
  if (res.rows.length === 0) {
      console.log('Inserting menu item...');
      const res2 = await client.query(`
        INSERT INTO nex_core.menus (id, title, path, icon, parent_id, sort_order, is_active, app_id, action, route)
        VALUES (
          gen_random_uuid(),
          'Master Type 3',
          'template-master-3',
          'Files',
          (SELECT id FROM nex_core.menus WHERE path = 'settings' LIMIT 1),
          3,
          true,
          (SELECT id FROM nex_core.system_apps WHERE code = 'nex-core' LIMIT 1),
          'read',
          'template-master-3'
        ) RETURNING id;
      `);
      console.log('Inserted with id:', res2.rows[0].id);
      
      const menuId = res2.rows[0].id;
      const adminRoleId = (await client.query("SELECT id FROM nex_core.roles WHERE role_name = 'Administrator' LIMIT 1")).rows[0].id;
      
      if (adminRoleId && menuId) {
          console.log('Adding permissions to Administrator...');
          await client.query(`
            INSERT INTO nex_core.role_permissions (role_id, menu_id, can_view, can_create, can_edit, can_delete, can_approve, can_export)
            VALUES ($1, $2, true, true, true, true, true, true)
          `, [adminRoleId, menuId]);
      }
  }

  await client.end();
}
run().catch(console.error);
