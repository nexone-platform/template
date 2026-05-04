const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:qwerty@203.151.66.51:5434/nexone_template' 
  });
  
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'nex_core' AND table_name = 'menus'");
    console.log(res.rows);
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.end();
  }
}

test();
