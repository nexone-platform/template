const { Client } = require('pg');
const c = new Client({ user: 'postgres', password: 'qwerty', host: 'localhost', database: 'nexone_techbiz' });
c.connect().then(async () => {
  const apps = await c.query(`
    SELECT app_seq_no, app_name, app_group, desc_th, desc_en, route_path, api_path 
    FROM nex_core.system_apps 
    ORDER BY app_seq_no
  `);
  apps.rows.forEach(r => console.log(`[${r.app_seq_no}] ${r.app_name} (${r.app_group})\n    TH: ${r.desc_th}\n    EN: ${r.desc_en}\n    Route: ${r.route_path}\n`));
  await c.end();
}).catch(e => { console.error(e.message); c.end(); });
