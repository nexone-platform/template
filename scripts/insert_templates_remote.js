const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_techbiz',
  ssl: false,
});

const templates = [
  { g: 'หมวดหมู่หลัก', n: 'มาตรฐานแบบที่ 2 (Pattern 2)', d: 'มีส่วนประกอบของกล่องตัวเลขสถิติด้านบน', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'เปลี่ยน Layout ง่ายๆ', d: 'เพียงแค่ใส่ props summaryCards ใน CrudLayout', a: true },
  { g: 'สถานะพิเศษ', n: 'Export บาร์ฝั่งซ้าย', d: 'สามารถเติมเนื้อหาในฝั่งซ้าย toolbarLeft ได้', a: false },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 4', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 4', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 5', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 5', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 6', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 6', a: false },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 7', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 7', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 8', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 8', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 9', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 9', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 10', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 10', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 11', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 11', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 12', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 12', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 13', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 13', a: false },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 14', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 14', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 15', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 15', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 16', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 16', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 17', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 17', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 18', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 18', a: false },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 19', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 19', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 20', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 20', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 21', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 21', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 22', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 22', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 23', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 23', a: false },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 24', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 24', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 25', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 25', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 26', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 26', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 27', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 27', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 28', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 28', a: false },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 29', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 29', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 30', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 30', a: true },
  { g: 'หมวดหมู่หลัก', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 31', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 31', a: true },
  { g: 'หมวดหมู่ย่อย', n: 'รายการคำสั่งซื้อคลังสินค้าที่ 32', d: 'ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 32', a: true },
];

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to remote DB: 203.151.66.51:5434');

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS nex_core.templates (
        create_date    timestamp    DEFAULT now() NOT NULL,
        create_by      varchar(50)  DEFAULT 'system',
        update_date    timestamp,
        update_by      varchar(50),
        is_active      bool         DEFAULT true NOT NULL,
        template_id    bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        template_group varchar(50),
        template_name  varchar(100) NOT NULL,
        template_desc  varchar(200)
      )
    `);
    console.log('✅ Table nex_core.templates ready');

    const countRes = await client.query('SELECT COUNT(*) FROM nex_core.templates');
    const existing = parseInt(countRes.rows[0].count);
    console.log('📊 Existing records:', existing);

    if (existing > 0) {
      console.log('⚠️  Already has data. Skipping...');
    } else {
      for (const t of templates) {
        await client.query(
          'INSERT INTO nex_core.templates (template_group, template_name, template_desc, is_active, create_by) VALUES ($1, $2, $3, $4, $5)',
          [t.g, t.n, t.d, t.a, 'system']
        );
      }
      console.log('✅ Inserted', templates.length, 'records!');
    }

    // Verify
    const vRes = await client.query('SELECT template_id, template_name, template_group, is_active FROM nex_core.templates ORDER BY template_id LIMIT 5');
    console.log('\n📋 First 5 records:');
    vRes.rows.forEach(r => console.log(`  #${r.template_id} [${r.template_group}] ${r.template_name} - ${r.is_active ? '✅' : '❌'}`));
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
