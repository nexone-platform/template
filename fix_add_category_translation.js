const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: '203.151.66.51', database: 'nexone_template', password: 'qwerty', port: 5434 });

async function run() {
  await client.connect();
  await client.query(`
    UPDATE nex_core.language_translations 
    SET label_value = 'เพิ่มหมวดหมู่' 
    WHERE page_key = 'template-master-2' AND label_key = 'add_category' AND language_code = 'th';
    
    UPDATE nex_core.language_translations 
    SET label_value = 'Add Category' 
    WHERE page_key = 'template-master-2' AND label_key = 'add_category' AND language_code = 'en';
  `);
  console.log('Fixed add_category translation');
  await client.end();
}

run().catch(console.error);
