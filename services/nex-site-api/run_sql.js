const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'nexone_techbiz',
  password: 'qwerty',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const sqlPath = path.resolve(__dirname, 'landing_page_data_fixed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing landing_page_data_fixed.sql...');
    await client.query(sql);
    console.log('landing_page_data_fixed.sql executed successfully.');
    
  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

run();
