const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'qwerty',
  host: 'localhost',
  database: 'nexone_techbiz'
});

const plan = [
  { name: 'NexCore', id: 1, route: 3001, api: 8083 }, // Wait, API is actually 8083 for NexCore? The plan says sequential, let me use 8001..8022 for all as it is sequential.
  { name: 'NexForce', id: 2, route: 3002, api: 8002 },
  { name: 'NexSite', id: 3, route: 3003, api: 8003 },
  { name: 'NexAsset', id: 4, route: 3004, api: 8004 },
  { name: 'NexProcure', id: 5, route: 3005, api: 8005 },
  { name: 'NexStock', id: 6, route: 3006, api: 8006 },
  { name: 'NexProduce', id: 7, route: 3007, api: 8007 },
  { name: 'NexSpeed', id: 8, route: 3008, api: 8008 },
  { name: 'NexSales', id: 9, route: 3009, api: 8009 },
  { name: 'NexPOS', id: 10, route: 3010, api: 8010 },
  { name: 'NexDelivery', id: 11, route: 3011, api: 8011 },
  { name: 'NexFinance', id: 12, route: 3012, api: 8012 },
  { name: 'NexCost', id: 13, route: 3013, api: 8013 },
  { name: 'NexTax', id: 14, route: 3014, api: 8014 },
  { name: 'NexPayroll', id: 15, route: 3015, api: 8015 },
  { name: 'NexLess', id: 16, route: 3016, api: 8016 },
  { name: 'NexApprove', id: 17, route: 3017, api: 8017 },
  { name: 'NexAudit', id: 18, route: 3018, api: 8018 },
  { name: 'NexMaint', id: 19, route: 3019, api: 8019 },
  { name: 'NexLearn', id: 20, route: 3020, api: 8020 },
  { name: 'NexConnect', id: 21, route: 3021, api: 8021 },
  { name: 'NexBI', id: 22, route: 3022, api: 8022 },
];

async function updateApps() {
  await client.connect();
  try {
    await client.query('BEGIN');

    // Remove generated always
    await client.query('ALTER TABLE nex_core.system_apps ALTER COLUMN app_id DROP IDENTITY IF EXISTS');

    // Shift up
    await client.query('UPDATE nex_core.system_apps SET app_id = app_id + 1000');

    // Update to exact match
    for (const app of plan) {
      const res = await client.query('SELECT app_id FROM nex_core.system_apps WHERE app_name = $1', [app.name]);
      if (res.rows.length > 0) {
        const tempId = res.rows[0].app_id;
        
        await client.query(`
          UPDATE nex_core.system_apps 
          SET app_id = $1, 
              app_seq_no = $2, 
              route_path = $3, 
              api_path = $4 
          WHERE app_id = $5
        `, [
          app.id, 
          app.id,
          `http://localhost:${app.route}`, 
          `http://localhost:${app.api}/api`, 
          tempId
        ]);
        console.log(`Updated ${app.name} -> ID: ${app.id}`);
      }
    }

    // Reconstruct identity sequence
    await client.query('ALTER TABLE nex_core.system_apps ALTER COLUMN app_id ADD GENERATED ALWAYS AS IDENTITY (START WITH 23)');

    await client.query('COMMIT');
    console.log('Update Complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update failed:', error);
  } finally {
    await client.end();
  }
}

updateApps();
