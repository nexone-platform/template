const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'qwerty',
  host: 'localhost',
  database: 'nexone_techbiz'
});

const units = [
  { name: 'ลิตร', symbol: 'L', desc: 'หน่วยวัดปริมาตรของเหลว (Liter)' },
  { name: 'ชุด', symbol: 'set', desc: 'อะไหล่หรืออุปกรณ์ที่มาเป็นชุด (Set)' },
  { name: 'เส้น', symbol: 'pcs', desc: 'หน่วยนับสำหรับยาง สายพาน (Line/Belt/Tire)' },
  { name: 'ถัง', symbol: 'drum', desc: 'หน่วยนับของน้ำมัน/จาระบีแบบบรรจุถัง (Drum/Barrel)' },
  { name: 'แกลลอน', symbol: 'gal', desc: 'หน่วยนับสำหรับน้ำมันหรือของเหลว (Gallon)' },
  { name: 'หลอด', symbol: 'tube', desc: 'หน่วยสำหรับกาวหรือซิลิโคน (Tube)' },
  { name: 'ม้วน', symbol: 'roll', desc: 'หน่วยสำหรับสายไฟหรือเทป (Roll)' },
  { name: 'กิโลกรัม', symbol: 'kg', desc: 'หน่วยวัดและชั่งน้ำหนัก (Kilogram)' },
  { name: 'ตัน', symbol: 't', desc: 'หน่วยความจุ/น้ำหนัก (Ton)' },
  { name: 'กล่อง', symbol: 'box', desc: 'หน่วยหีบห่อแบบกล่อง (Box)' },
  { name: 'แผง', symbol: 'card', desc: 'หน่วยบรรจุภัณฑ์แผง (Card/Panel)' },
  { name: 'ตู้', symbol: 'cnt', desc: 'หน่วยตู้คอนเทนเนอร์ (Container)' },
  { name: 'เมตร', symbol: 'm', desc: 'หน่วยความยาว (Meter)' },
  { name: 'คัน', symbol: 'veh', desc: 'หน่วยนับสำหรับรถ (Vehicle)' },
  { name: 'เที่ยว', symbol: 'trip', desc: 'หน่วยการขนส่ง (Trip)' },
  { name: 'ชิ้น', symbol: 'pcs', desc: 'หน่วยชิ้นทั่วไป (Piece)' },
];

async function seed() {
  await client.connect();
  for (const u of units) {
    const res = await client.query('SELECT unit_type_id FROM nex_core.unit_types WHERE unit_type_name = $1', [u.name]);
    if (res.rows.length === 0) {
      await client.query(
        'INSERT INTO nex_core.unit_types (unit_type_name, symbol, description, is_active, create_by) VALUES ($1, $2, $3, true, $4)',
        [u.name, u.symbol, u.desc, 'system']
      );
      console.log(`Inserted: ${u.name}`);
    } else {
      await client.query(
        'UPDATE nex_core.unit_types SET symbol = $1, description = $2 WHERE unit_type_name = $3',
        [u.symbol, u.desc, u.name]
      );
      console.log(`Updated: ${u.name}`);
    }
  }
  await client.end();
  console.log('Seed completed.');
}

seed().catch(console.error);
