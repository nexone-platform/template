require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const adminNavSections = [
  {
    title: 'ภาพรวม',
    icon: 'layout',
    items: [
      { label: 'ภาพรวมระบบ', icon: 'globe', route: '/dashboard' },
      { label: 'การแจ้งเตือน', icon: 'bell', route: '/notifications' },
      { label: 'ประวัติการใช้งาน', icon: 'file-text', route: '/logs' },
    ]
  },
  {
    title: 'องค์กร',
    icon: 'building',
    items: [
      { label: 'ข้อมูลบริษัท', icon: 'building', route: '/company' },
      { label: 'ข้อมูลสาขา', icon: 'map-pin', route: '/branch' },
      { label: 'การเงิน & ภาษี', icon: 'credit-card', route: '/billing' },
    ]
  },
  {
    title: 'ความปลอดภัย',
    icon: 'shield',
    items: [
      { label: 'ผู้ใช้งานระบบ', icon: 'users', route: '/users' },
      { label: 'บทบาทและสิทธิ์', icon: 'shield', route: '/roles' },
      { label: 'ตั้งค่าความปลอดภัย', icon: 'shield', route: '/security-config' },
    ]
  },
  {
    title: 'การปรับแต่ง',
    icon: 'palette',
    items: [
      { label: 'การแสดงผล & ธีม', icon: 'sliders', route: '/display' },
      { label: 'อีเมล์แม่แบบ', icon: 'mail', route: '/email' },
    ]
  },
  {
    title: 'แม่แบบ',
    icon: 'layout',
    items: [
      { label: 'มาสเตอร์ แบบที่ 1', icon: 'layout', route: '/template-master-1' },
      { label: 'มาสเตอร์ แบบที่ 2', icon: 'layout', route: '/template-master-2' },
      { label: 'มาสเตอร์ แบบที่ 3', icon: 'layout', route: '/template-master-3' },
      { label: 'มาสเตอร์และกราฟ แบบที่ 1', icon: 'layout', route: '/template-master-graph' },
    ]
  },
  {
    title: 'ระบบ',
    icon: 'settings',
    items: [
      { label: 'ภาษา', icon: 'globe', route: '/languages' },
      { label: 'เมนู', icon: 'layout', route: '/menus' },
      { label: 'ภาษาเมนู', icon: 'globe', route: '/menus-languages' },
      { label: 'แอปในระบบ', icon: 'layout', route: '/system-apps' },
      { label: 'ฐานข้อมูล', icon: 'database', route: '/database' },
      { label: 'ตรวจสอบระบบ', icon: 'monitor', route: '/monitoring' },
    ]
  },
  {
    title: 'ข้อมูลอ้างอิง',
    icon: 'database',
    items: [
      { label: 'จังหวัด / พื้นที่', icon: 'map-pin', route: '/provinces' },
      { label: 'หน่วยนับ', icon: 'box', route: '/unit-type' },
    ]
  }
];

const speedNavSections = [
    {
        title: 'หลัก',
        icon: 'layout',
        items: [
            { label: 'Dashboard', icon: 'layout', route: '/dashboard' },
            { label: 'การจัดการรถบริษัท', icon: 'truck', route: '/fleet' },
            { label: 'การจัดการรถร่วม', icon: 'handshake', route: '/subcontractors' },
            { label: 'บำรุงรักษารถยนต์', icon: 'tool', route: '/maintenance' },
            { label: 'พนักงานขับรถ', icon: 'users', route: '/drivers' },
            { label: 'คำสั่งขนส่ง', icon: 'clipboard', route: '/orders' },
            { label: 'GPS Tracking', icon: 'map-pin', route: '/trips' },
            { label: 'GPS Live + Geofence', icon: 'navigation', route: '/gps-live' },
            { label: 'Route Optimizer AI', icon: 'map', route: '/route-optimizer' },
            { label: 'ทริปขนส่ง', icon: 'navigation', route: '/transport-trips' },
            { label: 'พอร์ทัลติดตามลูกค้า', icon: 'map', route: '/customer-tracking' },
            { label: 'ยืนยันการส่ง (POD)', icon: 'clipboard', route: '/pod' },
            { label: 'แจ้งเตือน', icon: 'bell', route: '/alerts' },
        ],
    },
    {
        title: 'ช่าง & อะไหล่',
        icon: 'tool',
        items: [
            { label: 'ช่างซ่อมรถยนต์', icon: 'tool', route: '/mechanics' },
            { label: 'ช่างซ่อมตู้คอนเทนเนอร์', icon: 'box', route: '/container-mechanics' },
            { label: 'ร้านอะไหล่', icon: 'shopping-bag', route: '/parts-shops' },
        ],
    },
    {
        title: 'คลัง & สต๊อก',
        icon: 'package',
        items: [
            { label: 'สต๊อกอะไหล่', icon: 'package', route: '/stock-parts' },
            { label: 'สต๊อกน้ำมัน', icon: 'droplet', route: '/stock-oil' },
            { label: 'สถานที่เก็บ', icon: 'database', route: '/storage' },
        ],
    },
    {
        title: 'บัญชี การเงิน',
        icon: 'file-text',
        items: [
            { label: 'การเงิน & วางบิล', icon: 'file-text', route: '/finance' },
            { label: 'วางบิลอัตโนมัติ', icon: 'file-text', route: '/invoices' },
            { label: 'วิเคราะห์ต้นทุนทริป', icon: 'bar-chart', route: '/trip-cost' },
            { label: 'วิเคราะห์ & รายงาน', icon: 'bar-chart', route: '/analytics' },
        ],
    },
    {
        title: 'ข้อมูลหลัก',
        icon: 'map',
        items: [
            { label: 'สถานที่รับ-ส่งสินค้า', icon: 'navigation', route: '/locations' },
            { label: 'แผนซ่อมบำรุง', icon: 'tool', route: '/maintenance-plan' },
            { label: 'ประเภทเชี่ยวชาญ', icon: 'map-pin', route: '/expertise' },
            { label: 'ลานจอดรถ', icon: 'circle', route: '/parking' },
        ],
    },
    {
        title: 'เมนูพื้นฐาน',
        icon: 'box',
        items: [
            { label: 'ยี่ห้อรถ', icon: 'truck', route: '/brands' },
            { label: 'ประเภทรถ', icon: 'truck', route: '/vehicle-type' },
            { label: 'ประเภทช่างซ่อม', icon: 'tool', route: '/mechanic-type' },
            { label: 'ประเภทของเหลว', icon: 'droplet', route: '/liquid-type' },
            { label: 'กลุ่มอะไหล่', icon: 'package', route: '/part-group' },
            { label: 'ประเภทคลัง/สถานที่', icon: 'database', route: '/storage-type' },
            { label: 'ประเภทที่จอดรถ', icon: 'circle', route: '/parking-type' },
            { label: 'หมวดหมู่อะไหล่', icon: 'package', route: '/part-category' },
        ],
    },
    {
        title: 'แม่แบบ (Template)',
        icon: 'layout',
        items: [
            { label: 'มาสเตอร์ แบบที่ 1', icon: 'box', route: '/template-master-1' },
            { label: 'มาสเตอร์ แบบที่ 2', icon: 'layout', route: '/template-master-2' },
            { label: 'มาสเตอร์ แบบที่ 3', icon: 'layout', route: '/template-master-3' },
            { label: 'มาสเตอร์และกราฟ แบบที่ 1', icon: 'layout', route: '/template-master-graph-1' },
        ],
    },
    {
        title: 'ระบบ',
        icon: 'settings',
        items: [
            { label: 'ตั้งค่า', icon: 'settings', route: '/settings' },
            { label: 'ช่วยเหลือ', icon: 'help-circle', route: '/help' },
        ],
    },
];

const nexSiteMenus = [
    { title: 'Dashboard', icon: 'dashboard', route: '/' },
    { title: 'Pages', icon: 'layers', route: '/pages' },
    { title: 'Theme', icon: 'palette', route: '/theme' },
    { title: 'Language', icon: 'globe', route: '/translations' },
    { title: 'Settings', icon: 'settings', route: '/settings' },
];

async function insertMenuLevel(menus, parentId, appName, currentSeq) {
    for (let i = 0; i < menus.length; i++) {
        const m = menus[i];
        
        let idResult = await pool.query('SELECT MAX(menus_id) as max FROM nex_core.menus');
        let nextId = (idResult.rows[0].max || 0) + 1;
        
        await pool.query(`
            INSERT INTO nex_core.menus (menus_id, parent_id, title, route, app_name, menu_seq, is_active, icon, create_date, create_by, menu_code, menu_value, base, page_key)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'system', $9, $10, $11, $12)
        `, [
            nextId,
            parentId,
            m.title || m.label,
            m.route || '',
            appName,
            currentSeq + i + 1,
            true,
            m.icon,
            `${appName}-${nextId}`,
            m.title || m.label,
            m.route ? m.route.replace(/\//g,'') : (m.title || m.label).replace(/\s+/g, '-').toLowerCase(),
            m.route ? m.route.replace(/\//g,'') : (m.title || m.label).replace(/\s+/g, '-').toLowerCase()
        ]);
        
        console.log(`Inserted menu ${m.title || m.label} for ${appName} (id: ${nextId})`);
        
        if (m.items && m.items.length > 0) {
            await insertMenuLevel(m.items, nextId, appName, 0);
        }
    }
}

async function run() {
    try {
        await pool.query('BEGIN');
        
        await pool.query("DELETE FROM nex_core.menus WHERE app_name IN ('nex-core', 'nex-site', 'nex-speed')");
        
        console.log("Inserting nex-core menus...");
        await insertMenuLevel(adminNavSections, null, 'nex-core', 0);
        
        console.log("Inserting nex-site menus...");
        await insertMenuLevel(nexSiteMenus, null, 'nex-site', 0);
        
        console.log("Inserting nex-speed menus...");
        await insertMenuLevel(speedNavSections, null, 'nex-speed', 0);
        
        await pool.query('COMMIT');
        console.log("Done inserting all menus.");
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error inserting menus:", err.message);
    } finally {
        pool.end();
    }
}
run();
