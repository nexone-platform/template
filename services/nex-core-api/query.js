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
  const res = await client.query(`
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema IN ('public', 'nex_core')
  `);
  console.log('Tables:', res.rows.map(r => r.table_schema + '.' + r.table_name));

  const users = await client.query(`
    SELECT * FROM nex_core.users LIMIT 5
  `).catch(e => console.log('users table not found'));

  if (users) {
      console.log('nex_core.users:', users.rows);
  }
  
  const publicUsers = await client.query(`
    SELECT id, email, role_id, role_name, password FROM users LIMIT 5
  `).catch(e => console.log('public.users table not found'));

  if (publicUsers) {
      console.log('public.users:', publicUsers.rows);
  }

  await client.end();
}

main().catch(console.error);
