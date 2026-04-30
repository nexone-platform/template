require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// Map: menus_id -> { title, menu_value, route, base, page_key }
const menuUpdates = [
  // ─────────── nex-core ───────────
  // Groups (parent_id = null)
  { id: 200, title: 'Overview',        menu_value: 'Overview',        route: '',                    base: 'overview',         page_key: 'overview' },
  { id: 204, title: 'Organization',    menu_value: 'Organization',    route: '',                    base: 'organization',     page_key: 'organization' },
  { id: 208, title: 'Security',        menu_value: 'Security',        route: '',                    base: 'security',         page_key: 'security' },
  { id: 212, title: 'Appearance',      menu_value: 'Appearance',      route: '',                    base: 'appearance',       page_key: 'appearance' },
  { id: 215, title: 'Templates',       menu_value: 'Templates',       route: '',                    base: 'templates',        page_key: 'templates' },
  { id: 220, title: 'System',          menu_value: 'System',          route: '',                    base: 'system',           page_key: 'system' },
  { id: 227, title: 'Master Data',     menu_value: 'Master Data',     route: '',                    base: 'master-data',      page_key: 'master-data' },
  // Overview items
  { id: 201, title: 'Dashboard',       menu_value: 'Dashboard',       route: '/dashboard',          base: 'dashboard',        page_key: 'dashboard' },
  { id: 202, title: 'Notifications',   menu_value: 'Notifications',   route: '/notifications',      base: 'notifications',    page_key: 'notifications' },
  { id: 203, title: 'Activity Logs',   menu_value: 'Activity Logs',   route: '/logs',               base: 'logs',             page_key: 'logs' },
  // Organization items
  { id: 205, title: 'Company Info',    menu_value: 'Company Info',    route: '/company',            base: 'company',          page_key: 'company' },
  { id: 206, title: 'Branch Info',     menu_value: 'Branch Info',     route: '/branch',             base: 'branch',           page_key: 'branch' },
  { id: 207, title: 'Finance & Tax',   menu_value: 'Finance & Tax',   route: '/billing',            base: 'billing',          page_key: 'billing' },
  // Security items
  { id: 209, title: 'System Users',    menu_value: 'System Users',    route: '/users',              base: 'users',            page_key: 'users' },
  { id: 210, title: 'Roles & Permissions', menu_value: 'Roles & Permissions', route: '/roles',     base: 'roles',            page_key: 'roles' },
  { id: 211, title: 'Security Config', menu_value: 'Security Config', route: '/security-config',    base: 'security-config',  page_key: 'security-config' },
  // Appearance items
  { id: 213, title: 'Display & Theme', menu_value: 'Display & Theme', route: '/display',            base: 'display',          page_key: 'display' },
  { id: 214, title: 'Email Templates', menu_value: 'Email Templates', route: '/email',              base: 'email',            page_key: 'email' },
  // Templates items
  { id: 216, title: 'Master Type 1',   menu_value: 'Master Type 1',   route: '/template-master-1',  base: 'template-master-1', page_key: 'template-master-1' },
  { id: 217, title: 'Master Type 2',   menu_value: 'Master Type 2',   route: '/template-master-2',  base: 'template-master-2', page_key: 'template-master-2' },
  { id: 218, title: 'Master Type 3',   menu_value: 'Master Type 3',   route: '/template-master-3',  base: 'template-master-3', page_key: 'template-master-3' },
  { id: 219, title: 'Master & Graph',  menu_value: 'Master & Graph',  route: '/template-master-graph', base: 'template-master-graph', page_key: 'template-master-graph' },
  // System items
  { id: 221, title: 'Languages',       menu_value: 'Languages',       route: '/languages',          base: 'languages',        page_key: 'languages' },
  { id: 222, title: 'Menus',           menu_value: 'Menus',           route: '/menus',              base: 'menus',            page_key: 'menus' },
  { id: 223, title: 'Menu Languages',  menu_value: 'Menu Languages',  route: '/menus-languages',    base: 'menus-languages',  page_key: 'menus-languages' },
  { id: 224, title: 'System Apps',     menu_value: 'System Apps',     route: '/system-apps',        base: 'system-apps',      page_key: 'system-apps' },
  { id: 225, title: 'Database',        menu_value: 'Database',        route: '/database',           base: 'database',         page_key: 'database' },
  { id: 226, title: 'Monitoring',      menu_value: 'Monitoring',      route: '/monitoring',         base: 'monitoring',       page_key: 'monitoring' },
  // Master Data items
  { id: 228, title: 'Provinces / Areas', menu_value: 'Provinces / Areas', route: '/provinces',     base: 'provinces',        page_key: 'provinces' },
  { id: 229, title: 'Unit Types',      menu_value: 'Unit Types',      route: '/unit-type',          base: 'unit-type',        page_key: 'unit-type' },

  // ─────────── nex-site ───────────
  { id: 230, title: 'Dashboard',       menu_value: 'Dashboard',       route: '/',                   base: 'dashboard',        page_key: 'dashboard' },
  { id: 231, title: 'Pages',           menu_value: 'Pages',           route: '/pages',              base: 'pages',            page_key: 'pages' },
  { id: 232, title: 'Theme',           menu_value: 'Theme',           route: '/theme',              base: 'theme',            page_key: 'theme' },
  { id: 233, title: 'Language',        menu_value: 'Language',        route: '/translations',       base: 'translations',     page_key: 'translations' },
  { id: 234, title: 'Settings',        menu_value: 'Settings',        route: '/settings',           base: 'settings',         page_key: 'settings' },

  // ─────────── nex-speed ───────────
  // Groups
  { id: 235, title: 'Main',            menu_value: 'Main',            route: '',                    base: 'main',             page_key: 'main' },
  { id: 249, title: 'Mechanic & Parts', menu_value: 'Mechanic & Parts', route: '',                  base: 'mechanic-parts',   page_key: 'mechanic-parts' },
  { id: 253, title: 'Warehouse & Stock', menu_value: 'Warehouse & Stock', route: '',                base: 'warehouse-stock',  page_key: 'warehouse-stock' },
  { id: 257, title: 'Accounting & Finance', menu_value: 'Accounting & Finance', route: '',          base: 'accounting-finance', page_key: 'accounting-finance' },
  { id: 262, title: 'Master Data',     menu_value: 'Master Data',     route: '',                    base: 'master-data',      page_key: 'master-data' },
  { id: 267, title: 'Basic Data',      menu_value: 'Basic Data',      route: '',                    base: 'basic-data',       page_key: 'basic-data' },
  { id: 276, title: 'Templates',       menu_value: 'Templates',       route: '',                    base: 'templates',        page_key: 'templates' },
  { id: 281, title: 'System',          menu_value: 'System',          route: '',                    base: 'system',           page_key: 'system' },
  // Main items
  { id: 236, title: 'Dashboard',           menu_value: 'Dashboard',           route: '/dashboard',          base: 'dashboard',          page_key: 'dashboard' },
  { id: 237, title: 'Company Fleet',        menu_value: 'Company Fleet',       route: '/fleet',              base: 'fleet',              page_key: 'fleet' },
  { id: 238, title: 'Subcontractor Fleet',  menu_value: 'Subcontractor Fleet', route: '/subcontractors',     base: 'subcontractors',     page_key: 'subcontractors' },
  { id: 239, title: 'Vehicle Maintenance',  menu_value: 'Vehicle Maintenance', route: '/maintenance',        base: 'maintenance',        page_key: 'maintenance' },
  { id: 240, title: 'Drivers',              menu_value: 'Drivers',             route: '/drivers',            base: 'drivers',            page_key: 'drivers' },
  { id: 241, title: 'Transport Orders',     menu_value: 'Transport Orders',    route: '/orders',             base: 'orders',             page_key: 'orders' },
  { id: 242, title: 'GPS Tracking',         menu_value: 'GPS Tracking',        route: '/trips',              base: 'trips',              page_key: 'trips' },
  { id: 243, title: 'GPS Live + Geofence',  menu_value: 'GPS Live + Geofence', route: '/gps-live',           base: 'gps-live',           page_key: 'gps-live' },
  { id: 244, title: 'Route Optimizer AI',   menu_value: 'Route Optimizer AI',  route: '/route-optimizer',    base: 'route-optimizer',    page_key: 'route-optimizer' },
  { id: 245, title: 'Transport Trips',      menu_value: 'Transport Trips',     route: '/transport-trips',    base: 'transport-trips',    page_key: 'transport-trips' },
  { id: 246, title: 'Customer Tracking Portal', menu_value: 'Customer Tracking Portal', route: '/customer-tracking', base: 'customer-tracking', page_key: 'customer-tracking' },
  { id: 247, title: 'Proof of Delivery (POD)', menu_value: 'Proof of Delivery (POD)', route: '/pod',           base: 'pod',                page_key: 'pod' },
  { id: 248, title: 'Alerts',               menu_value: 'Alerts',              route: '/alerts',             base: 'alerts',             page_key: 'alerts' },
  // Mechanic & Parts items
  { id: 250, title: 'Vehicle Mechanics',    menu_value: 'Vehicle Mechanics',   route: '/mechanics',          base: 'mechanics',          page_key: 'mechanics' },
  { id: 251, title: 'Container Mechanics',  menu_value: 'Container Mechanics', route: '/container-mechanics', base: 'container-mechanics', page_key: 'container-mechanics' },
  { id: 252, title: 'Parts Shops',          menu_value: 'Parts Shops',         route: '/parts-shops',        base: 'parts-shops',        page_key: 'parts-shops' },
  // Warehouse & Stock items
  { id: 254, title: 'Parts Stock',          menu_value: 'Parts Stock',         route: '/stock-parts',        base: 'stock-parts',        page_key: 'stock-parts' },
  { id: 255, title: 'Oil Stock',            menu_value: 'Oil Stock',           route: '/stock-oil',          base: 'stock-oil',          page_key: 'stock-oil' },
  { id: 256, title: 'Storage Locations',    menu_value: 'Storage Locations',   route: '/storage',            base: 'storage',            page_key: 'storage' },
  // Accounting & Finance items
  { id: 258, title: 'Finance & Billing',    menu_value: 'Finance & Billing',   route: '/finance',            base: 'finance',            page_key: 'finance' },
  { id: 259, title: 'Auto Invoicing',       menu_value: 'Auto Invoicing',      route: '/invoices',           base: 'invoices',           page_key: 'invoices' },
  { id: 260, title: 'Trip Cost Analysis',   menu_value: 'Trip Cost Analysis',  route: '/trip-cost',          base: 'trip-cost',          page_key: 'trip-cost' },
  { id: 261, title: 'Analytics & Reports',  menu_value: 'Analytics & Reports', route: '/analytics',          base: 'analytics',          page_key: 'analytics' },
  // Master Data items
  { id: 263, title: 'Pickup & Delivery Locations', menu_value: 'Pickup & Delivery Locations', route: '/locations', base: 'locations', page_key: 'locations' },
  { id: 264, title: 'Maintenance Plans',    menu_value: 'Maintenance Plans',   route: '/maintenance-plan',   base: 'maintenance-plan',   page_key: 'maintenance-plan' },
  { id: 265, title: 'Expertise Types',      menu_value: 'Expertise Types',     route: '/expertise',          base: 'expertise',          page_key: 'expertise' },
  { id: 266, title: 'Parking Lots',         menu_value: 'Parking Lots',        route: '/parking',            base: 'parking',            page_key: 'parking' },
  // Basic Data items
  { id: 268, title: 'Vehicle Brands',       menu_value: 'Vehicle Brands',      route: '/brands',             base: 'brands',             page_key: 'brands' },
  { id: 269, title: 'Vehicle Types',        menu_value: 'Vehicle Types',       route: '/vehicle-type',       base: 'vehicle-type',       page_key: 'vehicle-type' },
  { id: 270, title: 'Mechanic Types',       menu_value: 'Mechanic Types',      route: '/mechanic-type',      base: 'mechanic-type',      page_key: 'mechanic-type' },
  { id: 271, title: 'Fluid Types',          menu_value: 'Fluid Types',         route: '/liquid-type',        base: 'liquid-type',        page_key: 'liquid-type' },
  { id: 272, title: 'Parts Groups',         menu_value: 'Parts Groups',        route: '/part-group',         base: 'part-group',         page_key: 'part-group' },
  { id: 273, title: 'Storage Types',        menu_value: 'Storage Types',       route: '/storage-type',       base: 'storage-type',       page_key: 'storage-type' },
  { id: 274, title: 'Parking Types',        menu_value: 'Parking Types',       route: '/parking-type',       base: 'parking-type',       page_key: 'parking-type' },
  { id: 275, title: 'Parts Categories',     menu_value: 'Parts Categories',    route: '/part-category',      base: 'part-category',      page_key: 'part-category' },
  // Templates items
  { id: 277, title: 'Master Type 1',        menu_value: 'Master Type 1',       route: '/template-master-1',  base: 'template-master-1',  page_key: 'template-master-1' },
  { id: 278, title: 'Master Type 2',        menu_value: 'Master Type 2',       route: '/template-master-2',  base: 'template-master-2',  page_key: 'template-master-2' },
  { id: 279, title: 'Master Type 3',        menu_value: 'Master Type 3',       route: '/template-master-3',  base: 'template-master-3',  page_key: 'template-master-3' },
  { id: 280, title: 'Master & Graph',       menu_value: 'Master & Graph',      route: '/template-master-graph-1', base: 'template-master-graph-1', page_key: 'template-master-graph-1' },
  // System items
  { id: 282, title: 'Settings',             menu_value: 'Settings',            route: '/settings',           base: 'settings',           page_key: 'settings' },
  { id: 283, title: 'Help',                 menu_value: 'Help',                route: '/help',               base: 'help',               page_key: 'help' },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const m of menuUpdates) {
      await client.query(`
        UPDATE nex_core.menus
        SET title = $1,
            menu_value = $2,
            route = $3,
            base = $4,
            page_key = $5,
            update_by = 'system',
            update_date = NOW()
        WHERE menus_id = $6
          AND app_name IN ('nex-core', 'nex-site', 'nex-speed')
      `, [m.title, m.menu_value, m.route, m.base, m.page_key, m.id]);
      console.log(`Updated [${m.id}] → ${m.title}`);
    }

    await client.query('COMMIT');
    console.log(`\n✅ Updated ${menuUpdates.length} menus to English successfully.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
