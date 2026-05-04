const { Client } = require('pg');
const c = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

c.connect()
  .then(async () => {
    // 1. List all schemas
    const schemas = await c.query("SELECT schema_name FROM information_schema.schemata ORDER BY schema_name");
    console.log('=== ALL SCHEMAS ===');
    schemas.rows.forEach(r => console.log(' ', r.schema_name));

    // 2. Check if nex_core exists
    const nex = await c.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'nex_core'");
    console.log('\n=== nex_core schema exists?', nex.rowCount > 0 ? 'YES' : 'NO', '===');

    // 3. Count tables in nex_core
    if (nex.rowCount > 0) {
      const tables = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'nex_core' ORDER BY table_name");
      console.log('\n=== TABLES in nex_core ===');
      tables.rows.forEach(r => console.log(' ', r.table_name));

      // 4. Count records in key tables
      console.log('\n=== RECORD COUNTS ===');
      const counts = ['menus', 'users', 'languages', 'language_translations', 'sessions', 'roles'];
      for (const t of counts) {
        try {
          const cnt = await c.query(`SELECT COUNT(*) as cnt FROM nex_core.${t}`);
          console.log(`  ${t}: ${cnt.rows[0].cnt} records`);
        } catch (e) {
          console.log(`  ${t}: ERROR - ${e.message.split('\n')[0]}`);
        }
      }
    }

    c.end();
  })
  .catch(e => { console.error(e.message); c.end(); });
