const { Client } = require('pg');
const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function main() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'nex_core' 
      AND table_name = 'users'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
