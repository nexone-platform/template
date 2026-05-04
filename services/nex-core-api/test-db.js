const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:qwerty@203.151.66.51:5434/nexone_template'  
  });
  
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query("INSERT INTO nex_core.language_translations (language_code, page_key, label_key, label_value) VALUES ($1, 'app_menus', $2, $3) RETURNING *", ['en', 'overview_test_123', 'Overview']);
    console.log(res.rows);
    await client.query("DELETE FROM nex_core.language_translations WHERE label_key = 'overview_test_123'");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

test();
