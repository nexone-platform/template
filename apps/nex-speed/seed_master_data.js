const API_BASE = 'http://localhost:8081/api/v1';

const dataToSeed = {
  'parking-types': [
    { name: 'ลานจอดรถพ่วง', description: 'พื้นที่จอดรถบรรทุกหัวลากและหางพ่วงขนาดใหญ่', status: 'active' },
    { name: 'ลานจอดรถบรรทุก 10 ล้อ', description: 'พื้นที่จอดรถบรรทุก 10 ล้อทั่วไป', status: 'active' },
    { name: 'ลานจอดรถกระบะ', description: 'พื้นที่จอดรถกระบะและรถขนส่งขนาดเล็ก', status: 'active' },
    { name: 'ลานจอดซ่อมบำรุง', description: 'พื้นที่จอดสำหรับรอซ่อมหรือกำลังซ่อมบำรุง', status: 'active' },
    { name: 'ลานจอดชั่วคราว', description: 'พื้นที่สำหรับจอดรถชั่วคราวเพื่อรอการจัดคิว', status: 'active' }
  ],
  'storage-types': [
    { name: 'โกดังสินค้าแห้ง', description: 'สถานที่เก็บรักษาสินค้าทั่วไปที่ไม่มีความชื้น', status: 'active' },
    { name: 'โกดังควบคุมอุณหภูมิ', description: 'ห้องเย็น หรือ สถานที่เก็บสินค้าที่ต้องควบคุมอุณหภูมิ', status: 'active' },
    { name: 'ลานวางตู้คอนเทนเนอร์', description: 'พื้นที่โล่งสำหรับวางตู้คอนเทนเนอร์ทั้งตู้หนักและตู้เบา', status: 'active' },
    { name: 'ห้องเก็บอะไหล่', description: 'ห้องสำหรับจัดเก็บและเบิกจ่ายอะไหล่ซ่อมบำรุง', status: 'active' },
    { name: 'สถานที่เก็บวัตถุอันตราย', description: 'พื้นที่จัดเก็บสารเคมีหรือวัตถุไวไฟอย่างถูกหลัก', status: 'active' }
  ],
  'liquid-types': [
    { name: 'น้ำมันดีเซล (Diesel)', description: 'เชื้อเพลิงหลักสำหรับรถบรรทุก', status: 'active' },
    { name: 'น้ำมันเครื่อง (Engine Oil)', description: 'น้ำมันหล่อลื่นเครื่องยนต์', status: 'active' },
    { name: 'น้ำมันเกียร์ (Gear Oil)', description: 'น้ำมันหล่อลื่นระบบเกียร์', status: 'active' },
    { name: 'น้ำหล่อเย็น (Coolant)', description: 'น้ำยาระบายความร้อนเครื่องยนต์', status: 'active' },
    { name: 'น้ำมันเบรก (Brake Fluid)', description: 'ของเหลวในระบบเบรก', status: 'active' },
    { name: 'สารหล่อลื่นจารบี (Grease)', description: 'จารบีหล่อลื่นลูกปืนและเพลา', status: 'active' }
  ],
  'part-categories': [
    { name: 'ระบบเครื่องยนต์', description: 'อะไหล่ชิ้นส่วนภายในเครื่องยนต์ กรองเครื่อง เข็มขัด', status: 'active' },
    { name: 'ระบบช่วงล่าง', description: 'โช้คอัพ แหนบ ลูกหมาก เพลา', status: 'active' },
    { name: 'ระบบเบรก', description: 'ผ้าเบรก จานเบรก สายลมเบรก', status: 'active' },
    { name: 'ระบบไฟฟ้า', description: 'แบตเตอรี่ ไดชาร์จ ไดสตาร์ท หลอดไฟ', status: 'active' },
    { name: 'ยางและล้อ', description: 'ยางรถบรรทุก กระทะล้อ จุ๊บลม', status: 'active' },
    { name: 'อะไหล่ตัวถัง', description: 'กระจกมองข้าง ไฟท้าย กระจังหน้า', status: 'active' }
  ],
  'unit-types': [
    { name: 'ชิ้น', description: 'หน่วยนับพื้นฐาน (Piece)', status: 'active' },
    { name: 'ลิตร', description: 'หน่วยวัดปริมาตรของเหลว (Liter)', status: 'active' },
    { name: 'ชุด', description: 'อะไหล่ที่มาเป็นเซ็ต (Set)', status: 'active' },
    { name: 'เส้น', description: 'หน่วยนับสำหรับยาง สายพาน', status: 'active' },
    { name: 'ถัง', description: 'หน่วยนับของน้ำมันเครื่อง/จารบีแบบบรรจุถัง (Drum/Barrel)', status: 'active' },
    { name: 'แกลลอน', description: 'หน่วยนับสำหรับน้ำมันเครื่องหรือของเหลว (Gallon)', status: 'active' }
  ]
};

async function seedData() {
  for (const [endpoint, items] of Object.entries(dataToSeed)) {
    console.log(`\nSeeding ${endpoint}...`);
    for (const item of items) {
      try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        
        if (response.ok) {
          console.log(`✅ Success: ${item.name}`);
        } else {
          console.error(`❌ Failed: ${item.name} (${response.status})`);
        }
      } catch (err) {
        console.error(`⚠️ Error sending ${item.name}: ${err.message}`);
      }
    }
  }
}

seedData();
