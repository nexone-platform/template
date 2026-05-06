const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  await client.connect();

  const ddl = `
    CREATE TABLE IF NOT EXISTS nex_core.template3 (
      id VARCHAR(50) PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      origin VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      cargo_type VARCHAR(100),
      weight NUMERIC(10, 2),
      status VARCHAR(50) DEFAULT 'pending',
      priority VARCHAR(50) DEFAULT 'normal',
      delivery_date DATE,
      estimated_cost NUMERIC(12, 2),
      vehicle_id VARCHAR(50),
      driver_id VARCHAR(50),
      create_date TIMESTAMPTZ DEFAULT NOW(),
      create_by VARCHAR(50) DEFAULT 'system',
      update_date TIMESTAMPTZ,
      update_by VARCHAR(50)
    );
  `;

  console.log('Creating table nex_core.template3...');
  await client.query(ddl);

  console.log('Inserting mock data...');
  const insertQuery = `
    INSERT INTO nex_core.template3 (id, customer_name, origin, destination, cargo_type, weight, status, priority, delivery_date, estimated_cost, create_date)
    VALUES 
    ('ORD-001', 'บริษัท สยามพารากอน จำกัด', 'กรุงเทพมหานคร', 'เชียงใหม่', 'Electronics', 2.5, 'in-transit', 'high', '2024-05-10', 15000, NOW()),
    ('ORD-002', 'บริษัท ไทยโฮมมาร์ท จำกัด', 'ชลบุรี', 'ระยอง', 'Construction', 15.0, 'completed', 'normal', '2024-04-20', 8000, NOW()),
    ('ORD-003', 'หจก. ท่าเรือแหลมฉบัง', 'ระยอง', 'กรุงเทพมหานคร', 'Chemicals', 5.0, 'pending', 'high', '2024-05-15', 12000, NOW()),
    ('ORD-004', 'บริษัท เซ็นทรัลพัฒนา จำกัด', 'กรุงเทพมหานคร', 'ภูเก็ต', 'Retail', 3.0, 'cancelled', 'low', '2024-05-01', 5000, NOW()),
    ('ORD-005', 'ร้านเจ๊หมวย ขายส่ง', 'นครราชสีมา', 'ขอนแก่น', 'Food', 1.5, 'pending', 'normal', '2024-05-12', 3000, NOW())
    ON CONFLICT (id) DO NOTHING;
  `;
  await client.query(insertQuery);

  console.log('Seeding finished.');
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
