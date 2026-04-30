// Script สำหรับ insert mock data จาก Template 2 เข้าตาราง templates
// โปรด run: node insert_templates.js (ต้องมี .env ที่มีค่า DB เส้นทาง nex-core-api)

const { Client } = require('pg');
require('dotenv').config({ path: './services/nex-core-api/.env.development' });

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'nexone',
  ssl: false,
});

// Mock data จาก TemplateMaster2Page ทั้ง 32 รายการ
const templates = [
  { template_group: 'หมวดหมู่หลัก', template_name: 'มาตรฐานแบบที่ 2 (Pattern 2)', template_desc: 'มีส่วนประกอบของกล่องตัวเลขสถิติด้านบน', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'เปลี่ยน Layout ง่ายๆ', template_desc: 'เพียงแค่ใส่ props summaryCards ใน CrudLayout', is_active: true },
  { template_group: 'สถานะพิเศษ', template_name: 'Export บาร์ฝั่งซ้าย', template_desc: 'สามารถเติมเนื้อหาในฝั่งซ้าย toolbarLeft ได้', is_active: false },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 4', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 4', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 5', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 5', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 6', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 6', is_active: false },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 7', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 7', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 8', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 8', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 9', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 9', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 10', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 10', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 11', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 11', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 12', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 12', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 13', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 13', is_active: false },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 14', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 14', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 15', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 15', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 16', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 16', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 17', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 17', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 18', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 18', is_active: false },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 19', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 19', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 20', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 20', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 21', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 21', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 22', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 22', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 23', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 23', is_active: false },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 24', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 24', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 25', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 25', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 26', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 26', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 27', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 27', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 28', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 28', is_active: false },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 29', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 29', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 30', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 30', is_active: true },
  { template_group: 'หมวดหมู่หลัก', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 31', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 31', is_active: true },
  { template_group: 'หมวดหมู่ย่อย', template_name: 'รายการคำสั่งซื้อคลังสินค้าที่ 32', template_desc: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 32', is_active: true },
];

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to DB');

    // Check existing count
    await client.query('SET search_path TO nex_core,public');

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS nex_core.templates (
        create_date   timestamp     DEFAULT now() NOT NULL,
        create_by     varchar(50)   DEFAULT 'system',
        update_date   timestamp,
        update_by     varchar(50),
        is_active     bool          DEFAULT true NOT NULL,
        template_id   bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        template_group varchar(50),
        template_name  varchar(100) NOT NULL,
        template_desc  varchar(200)
      )
    `);
    console.log('✅ Table nex_core.templates ready');

    const countRes = await client.query('SELECT COUNT(*) FROM templates');

    console.log(`📊 Current records in templates: ${countRes.rows[0].count}`);

    if (parseInt(countRes.rows[0].count) > 0) {
      console.log('⚠️  Table already has data. Skipping insert to avoid duplicates.');
      console.log('   If you want to re-insert, run: DELETE FROM public.templates;');
    } else {
      for (const t of templates) {
        await client.query(
          `INSERT INTO templates (template_group, template_name, template_desc, is_active, create_by, create_date)
           VALUES ($1, $2, $3, $4, 'system', now())`,
          [t.template_group, t.template_name, t.template_desc, t.is_active]
        );
      }
      console.log(`✅ Inserted ${templates.length} template records successfully!`);
    }

    // Verify
    const verifyRes = await client.query('SELECT template_id, template_name, template_group, is_active FROM templates ORDER BY template_id LIMIT 5');
    console.log('\n📋 First 5 records:');
    verifyRes.rows.forEach(r => console.log(`  #${r.template_id} [${r.template_group}] ${r.template_name} - ${r.is_active ? '✅' : '❌'}`));
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
