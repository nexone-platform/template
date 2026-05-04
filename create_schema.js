const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT schema_name FROM information_schema.schemata");
    console.log("Schemas:", res.rows.map(r => r.schema_name));
    
    // Create nex_site schema
    await client.query("CREATE SCHEMA IF NOT EXISTS nex_site");
    console.log("Schema nex_site created or already exists.");

    // Create site_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nex_site.site_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        key varchar(100) UNIQUE,
        value text DEFAULT '',
        description varchar(255) DEFAULT '',
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);
    console.log("Table nex_site.site_settings created or already exists.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
