const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '203.151.66.51',
  database: 'nexone_template',
  password: 'qwerty',
  port: 5434,
});

async function run() {
  try {
    await client.connect();
    
    console.log('Cleaning up corrupted role_permissions (where role_id or menu_id is NULL)...');
    const deleteRes = await client.query(`
      DELETE FROM nex_core.role_permissions 
      WHERE role_id IS NULL OR menu_id IS NULL;
    `);
    console.log(`Deleted ${deleteRes.rowCount} corrupted records.`);

    console.log('Checking for actual duplicates for specific roles...');
    const dupeRes = await client.query(`
      SELECT role_id, menu_id, app_name, COUNT(*) 
      FROM nex_core.role_permissions 
      WHERE role_id IS NOT NULL AND menu_id IS NOT NULL
      GROUP BY role_id, menu_id, app_name
      HAVING COUNT(*) > 1;
    `);
    
    if (dupeRes.rows.length > 0) {
      console.log('STILL FOUND DUPLICATES:');
      console.log(JSON.stringify(dupeRes.rows, null, 2));
      
      // Cleanup strategy: Keep only one of each duplicate
      for (const row of dupeRes.rows) {
        console.log(`Cleaning duplicates for role ${row.role_id} and menu ${row.menu_id}...`);
        await client.query(`
          DELETE FROM nex_core.role_permissions 
          WHERE permission_id NOT IN (
            SELECT MIN(permission_id) 
            FROM nex_core.role_permissions 
            WHERE role_id = $1 AND menu_id = $2 AND app_name = $3
          ) AND role_id = $1 AND menu_id = $2 AND app_name = $3;
        `, [row.role_id, row.menu_id, row.app_name]);
      }
      console.log('Duplicate cleanup finished.');
    } else {
      console.log('No valid duplicates found.');
    }

  } catch (err) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await client.end();
  }
}

run();
