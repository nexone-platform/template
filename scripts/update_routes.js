const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_techbiz'
});

async function main() {
  await client.connect();
  const updates = [
    { name: 'NexWeb', route_path: 'http://localhost:3000' },
    { name: 'NexCore Admin', route_path: 'http://localhost:3001' },
    { name: 'NexForce', route_path: 'http://localhost:3002' },
    { name: 'NexSite Backoffice', route_path: 'http://localhost:3003', new_name: 'NexSite' },
    { name: 'NexStock', route_path: 'http://localhost:3006' },
    { name: 'NexSpeed', route_path: 'http://localhost:3008' },
  ];

  for (const app of updates) {
    if (app.new_name) {
       await client.query(`UPDATE nex_core.system_apps SET route_path = $1, app_name = $2 WHERE app_name = $3`, [app.route_path, app.new_name, app.name]);
    } else {
       await client.query(`UPDATE nex_core.system_apps SET route_path = $1 WHERE app_name = $2`, [app.route_path, app.name]);
    }
  }

  const res = await client.query('SELECT app_name, route_path FROM nex_core.system_apps');
  console.log('Current system_apps:');
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
