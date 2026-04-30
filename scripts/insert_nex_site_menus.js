const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'qwerty', database: 'nexone_techbiz' });

const nexSiteMenus = [
  { title: 'Dashboard',  title_th: 'แดชบอร์ด',   route: '/',             base: '/',             page_key: 'dashboard',    materialicons: 'dashboard', menu_seq: 1 },
  { title: 'Pages',      title_th: 'จัดการหน้า',  route: '/pages',        base: '/pages',        page_key: 'pages',        materialicons: 'article',   menu_seq: 2 },
  { title: 'Theme',      title_th: 'ธีม',          route: '/theme',        base: '/theme',        page_key: 'theme',        materialicons: 'palette',   menu_seq: 3 },
  { title: 'Language',   title_th: 'ภาษา',         route: '/translations', base: '/translations', page_key: 'translations', materialicons: 'translate', menu_seq: 4 },
  { title: 'Settings',   title_th: 'ตั้งค่า',      route: '/settings',     base: '/settings',     page_key: 'settings',     materialicons: 'settings',  menu_seq: 5 },
];

client.connect().then(async () => {
  const check = await client.query("SELECT count(*) FROM nex_core.menus WHERE app_name = 'nex-site'");
  if (parseInt(check.rows[0].count) > 0) {
    console.log('nex-site menus already exist, skipping INSERT');
    const result = await client.query(
      "SELECT menus_id, title, title_th, route, page_key, app_name, menu_seq FROM nex_core.menus WHERE app_name = 'nex-site' ORDER BY menu_seq"
    );
    console.table(result.rows);
    client.end();
    return;
  }

  for (const menu of nexSiteMenus) {
    await client.query(
      `INSERT INTO nex_core.menus
        (menu_code, menu_value, title, title_th, route, base, page_key, materialicons, menu_seq, app_name, is_active, create_by, create_date)
       VALUES
        ($1, $1, $2, $3, $4, $5, $6, $7, $8, 'nex-site', true, 'system', NOW())`,
      [menu.page_key, menu.title, menu.title_th, menu.route, menu.base, menu.page_key, menu.materialicons, menu.menu_seq]
    );
    console.log(`Inserted: ${menu.title} (${menu.route})`);
  }

  const result = await client.query(
    "SELECT menus_id, title, title_th, route, page_key, app_name, menu_seq FROM nex_core.menus WHERE app_name = 'nex-site' ORDER BY menu_seq"
  );
  console.log('\nnex-site menus in DB:');
  console.table(result.rows);

  client.end();
}).catch(e => { console.error(e.message); client.end(); });
