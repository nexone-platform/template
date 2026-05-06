const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

const customers = ['บริษัท ช้างน้อยโลจิสติกส์ จำกัด', 'ร้าน ส.เจริญขนส่ง', 'บริษัท แอลเอ็นจี ซัพพลาย จำกัด', 'หจก. ทรัพย์อนันต์', 'บมจ. อุตสาหกรรมปูนซิเมนต์'];
const provinces = ['เชียงใหม่', 'กรุงเทพมหานคร', 'ระยอง', 'ชลบุรี', 'ขอนแก่น', 'สงขลา', 'ภูเก็ต', 'อุดรธานี'];
const cargoTypes = ['Electronics', 'Construction', 'Chemicals', 'Retail', 'Food', 'Machinery'];
const statuses = ['pending', 'in-transit', 'completed', 'cancelled'];
const priorities = ['low', 'normal', 'high'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNum(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateData(count) {
  const records = [];
  for (let i = 0; i < count; i++) {
    const origin = randomItem(provinces);
    let destination = randomItem(provinces);
    while (destination === origin) {
      destination = randomItem(provinces);
    }

    records.push({
      id: `ORD-30${i.toString().padStart(2, '0')}`,
      customer_name: randomItem(customers),
      origin,
      destination,
      cargo_type: randomItem(cargoTypes),
      weight: randomNum(1, 30),
      status: randomItem(statuses),
      priority: randomItem(priorities),
      delivery_date: `2024-0${Math.floor(Math.random() * 4) + 5}-${Math.floor(Math.random() * 28) + 1}`,
      estimated_cost: randomNum(3000, 25000)
    });
  }
  return records;
}

async function run() {
  await client.connect();

  console.log('Inserting 30 mock records into nex_core.template_checkbox...');
  const data = generateData(30);
  
  for (const item of data) {
    const query = `
      INSERT INTO nex_core.template_checkbox 
      (id, customer_name, origin, destination, cargo_type, weight, status, priority, delivery_date, estimated_cost, create_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    const values = [item.id, item.customer_name, item.origin, item.destination, item.cargo_type, item.weight, item.status, item.priority, item.delivery_date, item.estimated_cost];
    await client.query(query, values);
  }

  console.log('Inserting 30 records finished.');
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
