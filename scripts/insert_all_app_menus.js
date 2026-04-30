const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'qwerty', database: 'nexone_techbiz' });

const coreAdminMenus = [
  // section: overview
  { title: 'System Overview',  title_th: 'ภาพรวมระบบ',          route: 'dashboard',        base: 'dashboard',        page_key: 'dashboard',        materialicons: 'dashboard',       menu_seq: 1,  parent_id: null },
  { title: 'Notifications',    title_th: 'การแจ้งเตือน',         route: 'notifications',    base: 'notifications',    page_key: 'notifications',    materialicons: 'notifications',   menu_seq: 2,  parent_id: null },
  { title: 'Activity Logs',    title_th: 'ประวัติการใช้งาน',     route: 'logs',             base: 'logs',             page_key: 'logs',             materialicons: 'history',         menu_seq: 3,  parent_id: null },
  // section: organization
  { title: 'Company',          title_th: 'ข้อมูลบริษัท',         route: 'company',          base: 'company',          page_key: 'company',          materialicons: 'business',        menu_seq: 4,  parent_id: null },
  { title: 'Branch',           title_th: 'ข้อมูลสาขา',           route: 'branch',           base: 'branch',           page_key: 'branch',           materialicons: 'location_on',     menu_seq: 5,  parent_id: null },
  { title: 'Billing',          title_th: 'การเงิน & ภาษี',       route: 'billing',          base: 'billing',          page_key: 'billing',          materialicons: 'credit_card',     menu_seq: 6,  parent_id: null },
  // section: security
  { title: 'Users',            title_th: 'ผู้ใช้งานระบบ',        route: 'users',            base: 'users',            page_key: 'users',            materialicons: 'people',          menu_seq: 7,  parent_id: null },
  { title: 'Roles',            title_th: 'บทบาทและสิทธิ์',       route: 'roles',            base: 'roles',            page_key: 'roles',            materialicons: 'verified_user',   menu_seq: 8,  parent_id: null },
  { title: 'Security Config',  title_th: 'ตั้งค่าความปลอดภัย',   route: 'security-config',  base: 'security-config',  page_key: 'security-config',  materialicons: 'security',        menu_seq: 9,  parent_id: null },
  // section: appearance
  { title: 'Display & Theme',  title_th: 'การแสดงผล & ธีม',      route: 'display',          base: 'display',          page_key: 'display',          materialicons: 'tune',            menu_seq: 10, parent_id: null },
  { title: 'Email Templates',  title_th: 'อีเมล์แม่แบบ',         route: 'email',            base: 'email',            page_key: 'email',            materialicons: 'mail',            menu_seq: 11, parent_id: null },
  // section: system
  { title: 'Languages',        title_th: 'ภาษา',                 route: 'languages',        base: 'languages',        page_key: 'languages',        materialicons: 'language',        menu_seq: 12, parent_id: null },
  { title: 'Menus',            title_th: 'เมนู',                 route: 'menus',            base: 'menus',            page_key: 'menus',            materialicons: 'menu',            menu_seq: 13, parent_id: null },
  { title: 'Menu Languages',   title_th: 'ภาษาเมนู',             route: 'menus-languages',  base: 'menus-languages',  page_key: 'menus-languages',  materialicons: 'translate',       menu_seq: 14, parent_id: null },
  { title: 'System Apps',      title_th: 'แอปในระบบ',            route: 'system-apps',      base: 'system-apps',      page_key: 'system-apps',      materialicons: 'apps',            menu_seq: 15, parent_id: null },
  { title: 'Database',         title_th: 'ฐานข้อมูล',            route: 'database',         base: 'database',         page_key: 'database',         materialicons: 'storage',         menu_seq: 16, parent_id: null },
  { title: 'Monitoring',       title_th: 'ตรวจสอบระบบ',          route: 'monitoring',       base: 'monitoring',       page_key: 'monitoring',       materialicons: 'monitor',         menu_seq: 17, parent_id: null },
  // section: master-data
  { title: 'Provinces',        title_th: 'จังหวัด / พื้นที่',    route: 'provinces',        base: 'provinces',        page_key: 'provinces',        materialicons: 'map',             menu_seq: 18, parent_id: null },
  { title: 'Unit Types',       title_th: 'หน่วยนับ',             route: 'unit-type',        base: 'unit-type',        page_key: 'unit-type',        materialicons: 'straighten',      menu_seq: 19, parent_id: null },
];

const nexSpeedMenus = [
  { title: 'Dashboard',             title_th: 'แดชบอร์ด',                 route: 'dashboard',          base: 'dashboard',          page_key: 'dashboard',          materialicons: 'dashboard',        menu_seq: 1  },
  { title: 'Fleet',                 title_th: 'การจัดการรถบริษัท',         route: 'fleet',              base: 'fleet',              page_key: 'fleet',              materialicons: 'local_shipping',   menu_seq: 2  },
  { title: 'Subcontractors',        title_th: 'การจัดการรถร่วม',           route: 'subcontractors',     base: 'subcontractors',     page_key: 'subcontractors',     materialicons: 'handshake',        menu_seq: 3  },
  { title: 'Maintenance',           title_th: 'บำรุงรักษารถยนต์',          route: 'maintenance',        base: 'maintenance',        page_key: 'maintenance',        materialicons: 'build',            menu_seq: 4  },
  { title: 'Drivers',               title_th: 'พนักงานขับรถ',             route: 'drivers',            base: 'drivers',            page_key: 'drivers',            materialicons: 'people',           menu_seq: 5  },
  { title: 'Orders',                title_th: 'คำสั่งขนส่ง',              route: 'orders',             base: 'orders',             page_key: 'orders',             materialicons: 'assignment',       menu_seq: 6  },
  { title: 'GPS Tracking',          title_th: 'GPS Tracking',             route: 'trips',              base: 'trips',              page_key: 'trips',              materialicons: 'gps_fixed',        menu_seq: 7  },
  { title: 'Finance',               title_th: 'การเงิน & วางบิล',         route: 'finance',            base: 'finance',            page_key: 'finance',            materialicons: 'receipt',          menu_seq: 8  },
  { title: 'Analytics',             title_th: 'วิเคราะห์ & รายงาน',       route: 'analytics',          base: 'analytics',          page_key: 'analytics',          materialicons: 'bar_chart',        menu_seq: 9  },
  { title: 'Mechanics',             title_th: 'ช่างซ่อมรถยนต์',           route: 'mechanics',          base: 'mechanics',          page_key: 'mechanics',          materialicons: 'build',            menu_seq: 10 },
  { title: 'Part Types',            title_th: 'สต๊อกอะไหล่',             route: 'stock-parts',        base: 'stock-parts',        page_key: 'stock-parts',        materialicons: 'inventory',        menu_seq: 11 },
  { title: 'Settings',              title_th: 'ตั้งค่า',                  route: 'settings',           base: 'settings',           page_key: 'settings',           materialicons: 'settings',         menu_seq: 12 },
];

client.connect().then(async () => {
  for (const [appName, menus] of [['nex-core-admin', coreAdminMenus], ['nex-speed', nexSpeedMenus]]) {
    const check = await client.query(`SELECT count(*) FROM nex_core.menus WHERE app_name = '${appName}'`);
    if (parseInt(check.rows[0].count) > 0) {
      console.log(`[${appName}] Already has ${check.rows[0].count} menus — skipping`);
      continue;
    }
    for (const menu of menus) {
      const menuCode = `${appName}:${menu.page_key}`; // unique per app
      await client.query(
        `INSERT INTO nex_core.menus (menu_code, menu_value, title, title_th, route, base, page_key, materialicons, menu_seq, app_name, is_active, create_by, create_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, 'system', NOW())`,
        [menuCode, menu.page_key, menu.title, menu.title_th, menu.route, menu.base, menu.page_key, menu.materialicons, menu.menu_seq, appName]
      );
    }
    console.log(`[${appName}] Inserted ${menus.length} menus`);
  }

  const result = await client.query(
    `SELECT app_name, count(*) as total FROM nex_core.menus WHERE app_name IN ('nex-core-admin','nex-speed') GROUP BY app_name`
  );
  console.table(result.rows);
  client.end();
}).catch(e => { console.error(e.message); client.end(); });
