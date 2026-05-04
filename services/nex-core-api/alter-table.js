const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:qwerty@203.151.66.51:5434/nexone_template' 
  });
  
  try {
    await client.connect();
    await client.query("ALTER TABLE nex_core.menus ADD COLUMN menu_type varchar(50) DEFAULT 'menu';");
    console.log("Column added");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

test();
