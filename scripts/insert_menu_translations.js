require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// Thai translations mapped by menus_id
// These are the original Thai/English labels from the mockup data
const thaiLabels = {
  // ─────────── nex-core ───────────
  200: 'ภาพรวม',
  201: 'ภาพรวมระบบ',
  202: 'การแจ้งเตือน',
  203: 'ประวัติการใช้งาน',
  204: 'องค์กร',
  205: 'ข้อมูลบริษัท',
  206: 'ข้อมูลสาขา',
  207: 'การเงิน & ภาษี',
  208: 'ความปลอดภัย',
  209: 'ผู้ใช้งานระบบ',
  210: 'บทบาทและสิทธิ์',
  211: 'ตั้งค่าความปลอดภัย',
  212: 'การปรับแต่ง',
  213: 'การแสดงผล & ธีม',
  214: 'อีเมล์แม่แบบ',
  215: 'แม่แบบ',
  216: 'มาสเตอร์ แบบที่ 1',
  217: 'มาสเตอร์ แบบที่ 2',
  218: 'มาสเตอร์ แบบที่ 3',
  219: 'มาสเตอร์และกราฟ แบบที่ 1',
  220: 'ระบบ',
  221: 'ภาษา',
  222: 'เมนู',
  223: 'ภาษาเมนู',
  224: 'แอปในระบบ',
  225: 'ฐานข้อมูล',
  226: 'ตรวจสอบระบบ',
  227: 'ข้อมูลอ้างอิง',
  228: 'จังหวัด / พื้นที่',
  229: 'หน่วยนับ',
  // ─────────── nex-site ───────────
  230: 'แดชบอร์ด',
  231: 'หน้าเว็บ',
  232: 'ธีม',
  233: 'ภาษา',
  234: 'การตั้งค่า',
  // ─────────── nex-speed ───────────
  235: 'หลัก',
  236: 'แดชบอร์ด',
  237: 'การจัดการรถบริษัท',
  238: 'การจัดการรถร่วม',
  239: 'บำรุงรักษารถยนต์',
  240: 'พนักงานขับรถ',
  241: 'คำสั่งขนส่ง',
  242: 'GPS ติดตาม',
  243: 'GPS สด + เขตพื้นที่',
  244: 'AI วางแผนเส้นทาง',
  245: 'ทริปขนส่ง',
  246: 'พอร์ทัลติดตามลูกค้า',
  247: 'ยืนยันการส่ง (POD)',
  248: 'แจ้งเตือน',
  249: 'ช่าง & อะไหล่',
  250: 'ช่างซ่อมรถยนต์',
  251: 'ช่างซ่อมตู้คอนเทนเนอร์',
  252: 'ร้านอะไหล่',
  253: 'คลัง & สต๊อก',
  254: 'สต๊อกอะไหล่',
  255: 'สต๊อกน้ำมัน',
  256: 'สถานที่เก็บ',
  257: 'บัญชี & การเงิน',
  258: 'การเงิน & วางบิล',
  259: 'วางบิลอัตโนมัติ',
  260: 'วิเคราะห์ต้นทุนทริป',
  261: 'วิเคราะห์ & รายงาน',
  262: 'ข้อมูลหลัก',
  263: 'สถานที่รับ-ส่งสินค้า',
  264: 'แผนซ่อมบำรุง',
  265: 'ประเภทเชี่ยวชาญ',
  266: 'ลานจอดรถ',
  267: 'เมนูพื้นฐาน',
  268: 'ยี่ห้อรถ',
  269: 'ประเภทรถ',
  270: 'ประเภทช่างซ่อม',
  271: 'ประเภทของเหลว',
  272: 'กลุ่มอะไหล่',
  273: 'ประเภทคลัง/สถานที่',
  274: 'ประเภทที่จอดรถ',
  275: 'หมวดหมู่อะไหล่',
  276: 'แม่แบบ (Template)',
  277: 'มาสเตอร์ แบบที่ 1',
  278: 'มาสเตอร์ แบบที่ 2',
  279: 'มาสเตอร์ แบบที่ 3',
  280: 'มาสเตอร์และกราฟ แบบที่ 1',
  281: 'ระบบ',
  282: 'ตั้งค่า',
  283: 'ช่วยเหลือ',
};

async function run() {
  const client = await pool.connect();
  try {
    // Fetch all menus for our apps
    const menusResult = await client.query(`
      SELECT menus_id, menu_code, menu_value, app_name
      FROM nex_core.menus
      WHERE app_name IN ('nex-core', 'nex-site', 'nex-speed')
        AND menu_code IS NOT NULL
      ORDER BY menus_id
    `);

    const menus = menusResult.rows;
    console.log(`Found ${menus.length} menus to translate.`);

    await client.query('BEGIN');

    // Delete existing translations for these menu codes to avoid duplicates
    const menuCodes = menus.map(m => m.menu_code);
    const deleteResult = await client.query(`
      DELETE FROM nex_core.language_translations
      WHERE page_key = 'menu'
        AND label_key = ANY($1::text[])
    `, [menuCodes]);
    console.log(`Deleted ${deleteResult.rowCount} existing menu translation rows.`);

    let insertCount = 0;

    for (const menu of menus) {
      const { menus_id, menu_code, menu_value } = menu;
      const thaiLabel = thaiLabels[menus_id] || menu_value; // fallback to en if no thai mapping

      // Insert TH translation
      await client.query(`
        INSERT INTO nex_core.language_translations
          (language_code, page_key, label_key, label_value, is_active, create_by, create_date)
        VALUES ($1, 'menu', $2, $3, true, 'system', NOW())
      `, ['th', menu_code, thaiLabel]);

      // Insert EN translation
      await client.query(`
        INSERT INTO nex_core.language_translations
          (language_code, page_key, label_key, label_value, is_active, create_by, create_date)
        VALUES ($1, 'menu', $2, $3, true, 'system', NOW())
      `, ['en', menu_code, menu_value]);

      insertCount += 2;
      console.log(`  [${menu_code}] TH: "${thaiLabel}" | EN: "${menu_value}"`);
    }

    await client.query('COMMIT');
    console.log(`\n✅ Inserted ${insertCount} translation records (${menus.length} menus × 2 languages) successfully.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
